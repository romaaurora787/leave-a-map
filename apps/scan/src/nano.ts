// apps/scan/src/nano.ts: lane 2, Gemini Nano on the person's own mail. Runs in the window (the
// Prompt API isn't available in Workers) and never in the cloud.
import { initializeApp } from 'firebase/app';
import { getAI, getGenerativeModel, GoogleAIBackend, InferenceMode, InferenceSource } from 'firebase/ai';
import { LABEL_SCHEMA, SYSTEM_PROMPT, buildPrompt, parseLabel, type Label } from '../../../packages/core/contract.ts';

// Placeholder values on purpose. The scan site holds no real Firebase project, so even if a
// request escaped the CSP it could not authenticate to anything.
const NO_CLOUD_CONFIG = { apiKey: 'on-device-only', projectId: 'on-device-only', appId: '1:000000000000:web:0000000000000000' };

const TEXT_EN = [{ type: 'text' as const, languages: ['en'] }];
const CORE_OPTIONS = { expectedInputs: TEXT_EN, expectedOutputs: TEXT_EN };

export type NanoState = 'ready' | 'needs-download' | 'unavailable';
export type InferenceLog = { id: string; source: string; ms: number; valid: boolean };

type LanguageModelApi = { availability(o: unknown): Promise<string> };
const languageModel = () => (globalThis as { LanguageModel?: LanguageModelApi }).LanguageModel;

export async function probeNano(): Promise<NanoState> {
  const api = languageModel();
  if (!api) return 'unavailable';
  try {
    const state = await api.availability(CORE_OPTIONS);
    if (state === 'available') return 'ready';
    return state === 'unavailable' ? 'unavailable' : 'needs-download';
  } catch {
    return 'unavailable';
  }
}

/** Call from a click handler: downloading the model needs user activation. */
export async function startNano(onProgress: (loaded: number) => void, log: (entry: InferenceLog) => void): Promise<NanoClassifier> {
  // Required guard, firebase-js-sdk#10635: without LanguageModel the SDK ignores ONLY_ON_DEVICE
  // and sends the prompt to the cloud. Never build the model unless Nano is really there.
  if ((await probeNano()) === 'unavailable') throw new Error('nano-unavailable');
  const app = initializeApp(NO_CLOUD_CONFIG, 'scan-on-device');
  const ai = getAI(app, { backend: new GoogleAIBackend() });
  const model = getGenerativeModel(ai, {
    mode: InferenceMode.ONLY_ON_DEVICE,
    onDeviceParams: {
      createOptions: {
        ...CORE_OPTIONS,
        // systemInstruction is not sent on-device, so the instructions go in the initial prompts.
        initialPrompts: [{ role: 'system', content: [{ type: 'text', value: SYSTEM_PROMPT }] }],
      },
      promptOptions: { responseConstraint: LABEL_SCHEMA },
    },
  });
  await model.initializeDeviceModel(onProgress);
  return new NanoClassifier(model, log);
}

type Model = { generateContent(p: string): Promise<{ response: { text(): string; inferenceSource?: string } }> };

export class NanoClassifier {
  private tail: Promise<unknown> = Promise.resolve();
  private readonly model: Model;
  private readonly log: (entry: InferenceLog) => void;

  constructor(model: Model, log: (entry: InferenceLog) => void) {
    this.model = model;
    this.log = log;
  }

  /** One at a time: each SDK call replaces the previous session, which would abort a running prompt. */
  classify(id: string, senderDomain: string, preparedText: string): Promise<Label | null> {
    const run = () => this.once(id, senderDomain, preparedText);
    const result = this.tail.then(run, run);
    this.tail = result.catch(() => undefined);
    return result;
  }

  private async once(id: string, senderDomain: string, text: string): Promise<Label | null> {
    const started = performance.now();
    const { response } = await this.model.generateContent(buildPrompt(senderDomain, text));
    const source = response.inferenceSource ?? 'unknown';
    if (source !== InferenceSource.ON_DEVICE) throw new Error(`left the device: ${source}`);
    const label = parseLabel(response.text(), text);
    this.log({ id, source, ms: Math.round(performance.now() - started), valid: label !== null });
    return label;
  }
}

export type RewriteStyle = 'shorter' | 'formal' | 'simple';
const STYLE_WORDS: Record<RewriteStyle, string> = {
  shorter: 'Make it shorter and to the point. Keep every request.',
  formal: 'Make it more formal and polite, as a letter to a bank or insurer.',
  simple: 'Use simple, plain words that are easy to read. Keep every request.',
};
// Numbered rules, because Nano is a small model. Tested on Nano across both sample letters and all three
// styles (18 rewrites each): the old one-paragraph prompt broke 6 (made up "[He/She]", merged or dropped
// blanks, bracketed an email address); this one broke none.
const REWRITE_SYSTEM = [
  'You rewrite a letter that someone will send to a company. Follow these rules exactly:',
  '1. Keep the meaning and every request. Do not add facts, names, numbers, dates, addresses or new requests.',
  '2. Text in square brackets, like [your name], is a blank the sender fills in later. Copy each blank exactly as written, brackets included.',
  '3. Never make new blanks. The only square brackets in your reply are the ones already in the letter.',
  '4. Never guess anyone\'s gender. For a person, use their name blank or "they", "them" and "their". Never write he, she, him, his, her or hers.',
  '5. Reply with the letter text only: no subject line, no notes, no explanation.',
].join('\n');

let rewriter: ReturnType<typeof getGenerativeModel> | null = null;

/** The [blanks] a draft has, so a rewrite that drops one can be refused. */
export const blanks = (s: string) => [...new Set(s.match(/\[[^\]\n]{1,80}\]/g) ?? [])];

const GENDERED = /\b(he|she|him|his|her|hers)\b/gi;
const gendered = (s: string) => new Set((s.match(GENDERED) ?? []).map((w) => w.toLowerCase()));

/** What's wrong with a rewrite, if anything: a [blank] dropped, a new one made up, or a gender guessed. */
export function rewriteProblem(before: string, after: string): 'lost-blanks' | 'added-blanks' | 'gendered' | null {
  const had = blanks(before);
  if (after.length < 40 || had.some((b) => !after.includes(b))) return 'lost-blanks';
  if (blanks(after).some((b) => !had.includes(b))) return 'added-blanks';
  const was = gendered(before);
  if ([...gendered(after)].some((w) => !was.has(w))) return 'gendered';
  return null;
}

/** How long the model may take to answer once it's on the device, before we give up and keep the letter. */
const REWRITE_MS = 60_000;

/**
 * Where a rewrite is: downloading Chrome's built-in model first (once, a few GB; pct when Chrome
 * reports it), or rewriting.
 */
export type RewriteStage = { stage: 'download'; pct?: number } | { stage: 'rewrite' };

/**
 * Rewrite a draft letter with Gemini Nano, on this device only (it holds the most personal details
 * in the app). Throws if Nano isn't here, if the answer didn't come from the device, or if a
 * [blank] went missing, or 'timed-out' if the model takes too long to answer. Call from a click: a first download needs it.
 */
export async function rewriteOnDevice(body: string, style: RewriteStyle, onStage: (s: RewriteStage) => void = () => {}): Promise<string> {
  const state = await probeNano();
  if (state === 'unavailable') throw new Error('nano-unavailable');
  if (!rewriter) {
    const ai = getAI(initializeApp(NO_CLOUD_CONFIG, 'scan-rewrite'), { backend: new GoogleAIBackend() });
    rewriter = getGenerativeModel(ai, {
      mode: InferenceMode.ONLY_ON_DEVICE,
      onDeviceParams: { createOptions: { ...CORE_OPTIONS, initialPrompts: [{ role: 'system', content: [{ type: 'text', value: REWRITE_SYSTEM }] }] } },
    });
  }
  const model = rewriter;
  // A first download can take many minutes, so it has no time limit here; the page offers "Stop waiting".
  if (state === 'needs-download') onStage({ stage: 'download' });
  await model.initializeDeviceModel((loaded) => { if (state === 'needs-download') onStage({ stage: 'download', pct: Math.round(loaded * 100) }); });
  onStage({ stage: 'rewrite' });
  // The rules again, next to the letter: a small model follows what's closest to the text.
  const ask = `${STYLE_WORDS[style]}\nKeep these blanks exactly: ${blanks(body).join(' ') || '(none)'}. ` +
    `Add no other square brackets. Use "they" and "their" for people, never he or she.\n\nLetter:\n${body}`;
  const attempt = async () => {
    const { response } = await model.generateContent(ask);
    if (response.inferenceSource !== InferenceSource.ON_DEVICE) throw new Error('left the device');
    return response.text().trim();
  };
  const run = async () => {
    // ponytail: one retry; Nano's slips are random, so a second try usually comes back clean.
    let out = await attempt(), problem = rewriteProblem(body, out);
    if (problem) { out = await attempt(); problem = rewriteProblem(body, out); }
    if (problem) throw new Error(problem);
    return out;
  };
  return Promise.race([run(), new Promise<never>((_, no) => setTimeout(() => no(new Error('timed-out')), REWRITE_MS))]);
}
