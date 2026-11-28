// apps/scan/src/screens/reach.tsx: "How to reach them" and "Write to them" on each card.
// Contacts come from the company's own, checked emails (packages/core/contacts.ts). The draft is
// plain text the person edits here; it's copied or opened in their own email app, never sent from
// this page.
import { useEffect, useRef, useState } from 'preact/hooks';
import type { NanoState, RewriteStage, RewriteStyle } from '../nano.ts';
import type { Contacts } from '../../../../packages/core/contacts.ts';
import { draftMessage, mailtoHref } from '../../../../packages/core/draft.ts';
import type { RankedAccount } from '../../../../packages/core/types.ts';
import type { Mode } from '../mode.ts';

// Whether Gemini Nano can run here, asked once for the whole list: ready, needs a one-time download, or not here.
let nanoHere: Promise<NanoState> | null = null;
const nanoState = () => (nanoHere ??= import('../nano.ts').then((m) => m.probeNano()).catch(() => 'unavailable' as const));

const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, '')}`;
// .example domains (the samples) don't exist, so they're shown as text, not links.
const isExample = (d: string) => /\.(?:example|test|invalid|localhost)$/.test(d);

function Website({ domain }: { domain: string }) {
  return isExample(domain)
    ? <span>{domain} <span class="meta">(made-up sample site)</span></span>
    : <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer">{domain}</a>;
}

export function Reach({ a, mode, contacts, address, closing }: { a: RankedAccount; mode: Mode; contacts?: Contacts; address: string; closing?: { date: string; past: boolean } }) {
  const loss = mode === 'loss';
  const any = !!contacts && (contacts.emails.length + contacts.phones.length + contacts.addresses.length) > 0;
  const [draft, setDraft] = useState(() => draftMessage({ mode, bucket: a.bucket, company: a.name, address, closing }));
  const [copied, setCopied] = useState<'' | 'yes' | 'no'>('');
  // null while checking. The buttons always show, greyed out where Nano can't run.
  const [nano, setNano] = useState<NanoState | null>(null);
  // What a rewrite is doing now; "Stop waiting" bumps `run`, so a late answer from an old run is ignored.
  const [stage, setStage] = useState<RewriteStage | null>(null);
  const [said, setSaid] = useState('');
  const run = useRef(0);
  const latest = useRef(draft);
  latest.current = draft;
  useEffect(() => { let live = true; void nanoState().then((v) => { if (live) setNano(v); }); return () => { live = false; }; }, []);
  const rewrite = async (style: RewriteStyle) => {
    const me = ++run.current;
    const before = draft.body;
    setStage({ stage: 'rewrite' }); setSaid(''); setCopied('');
    try {
      const { rewriteOnDevice } = await import('../nano.ts');
      const body = await rewriteOnDevice(before, style, (s) => { if (run.current === me) setStage(s); });
      if (run.current !== me) return;
      nanoHere = Promise.resolve('ready'); setNano('ready');
      // Preact may run a state updater later, so read the letter as it is now from a ref.
      const kept = latest.current.body !== before;
      if (!kept) setDraft((d) => ({ ...d, body }));
      setSaid(kept ? 'You changed the letter while it was being rewritten, so your version is kept.'
        : 'Rewritten on this device by Gemini Nano. Nothing left this computer. Check it before you send it.');
    } catch (e) {
      if (run.current !== me) return;
      const why = (e as Error).message;
      setSaid(why === 'lost-blanks' ? 'The rewrite dropped some of the [blanks], so your version is kept.'
        : why === 'added-blanks' ? 'The rewrite made up [blanks] of its own, so your version is kept.'
        : why === 'gendered' ? 'The rewrite guessed whether the person is a man or a woman, so your version is kept.'
        : why === 'timed-out' ? 'Couldn\u2019t rewrite it on this device in time. Your letter is unchanged.'
        : 'Couldn\u2019t rewrite it on this device. Your letter is unchanged.');
    } finally {
      if (run.current === me) setStage(null);
    }
  };
  const stopWaiting = () => {
    run.current++;
    const downloading = stage?.stage === 'download';
    setStage(null);
    setSaid(downloading ? 'Stopped waiting. Your letter is unchanged. Chrome may keep downloading its built-in AI in the background, so try again later.'
      : 'Stopped waiting. Your letter is unchanged.');
  };
  const working = stage !== null;
  const status = stage?.stage === 'download'
    ? `Downloading Chrome\u2019s built-in AI to this device, once${stage.pct !== undefined ? `: ${stage.pct}%` : ''}. It\u2019s a few GB, so it can take several minutes. Your letter is unchanged meanwhile.`
    : stage ? 'Rewriting on this device\u2026' : said;
  const to = contacts?.emails[0];
  const copy = async () => {
    try { await navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`); setCopied('yes'); }
    catch { setCopied('no'); }
  };
  const id = `draft-${a.key.replace(/[^a-z0-9-]/gi, '-')}`;
  return (
    <div class="reach">
      {any ? (
        <div class="reach-found">
          <p class="reach-head">How to reach {a.name}</p>
          <dl>
            <div><dt>Website</dt><dd><Website domain={a.key} /></dd></div>
            {contacts!.emails.length > 0 && <div><dt>Email</dt><dd>{contacts!.emails.map((e) => <a key={e} href={`mailto:${e}`}>{e}</a>)}</dd></div>}
            {contacts!.phones.length > 0 && <div><dt>Phone</dt><dd>{contacts!.phones.map((p) => <a key={p} href={telHref(p)}>{p}</a>)}</dd></div>}
            {contacts!.addresses.length > 0 && <div><dt>Post</dt><dd>{contacts!.addresses.map((p) => <span key={p}>{p}</span>)}</dd></div>}
          </dl>
          <p class="meta">Found in {loss ? 'their' : 'your'} emails from {a.name} that passed the sender checks. Before you share anything personal, check them against {a.name}'s own website.</p>
        </div>
      ) : (
        <div class="reach-found">
          <p class="reach-head">How to reach {a.name}</p>
          <dl><div><dt>Website</dt><dd><Website domain={a.key} /></dd></div></dl>
          <p class="meta">No email address or phone number in {loss ? 'their' : 'your'} emails from {a.name}. Look for "Contact us" or "Help" on the website{loss ? ', and for "bereavement" or "deceased customer"' : ''}.</p>
        </div>
      )}
      <details class="draft">
        <summary><span class="chev" aria-hidden="true" />{loss ? `Write to ${a.name}: a ready-made message` : `Ask ${a.name} to change the email: a ready-made message`}</summary>
        <div class="draft-body">
          <p class="meta">Fill in the parts in [brackets], then copy it or open it in your email app. Nothing is sent until you press Send there.</p>
          <label for={`${id}-s`}>Subject</label>
          <input id={`${id}-s`} type="text" value={draft.subject} onInput={(e) => { setDraft({ ...draft, subject: e.currentTarget.value }); setCopied(''); }} />
          <label for={`${id}-b`}>Message</label>
          <textarea id={`${id}-b`} rows={14} value={draft.body} onInput={(e) => { setDraft({ ...draft, body: e.currentTarget.value }); setCopied(''); }} />
          <div class="draft-actions rewrite" role="group" aria-label="Rewrite on this device" aria-describedby={nano === 'unavailable' || nano === 'needs-download' ? `${id}-nonano` : undefined}>
            <span class="meta">Rewrite on this device:</span>
            {([['shorter', 'Shorter'], ['formal', 'More formal'], ['simple', 'Simpler words']] as [RewriteStyle, string][]).map(([style, label]) => (
              <button key={style} type="button" class="secondary" disabled={nano === null || nano === 'unavailable' || working} onClick={() => void rewrite(style)}>{label}</button>
            ))}
          </div>
          {nano === 'unavailable' && <p id={`${id}-nonano`} class="meta">Rewriting on this device needs Chrome on a computer with its built-in AI.</p>}
          {nano === 'needs-download' && !working && <p id={`${id}-nonano`} class="meta">The first rewrite downloads Chrome’s built-in AI to this device, once. It’s a few GB, so it can take a while.</p>}
          {status && <p class="meta" role="status">{status}</p>}
          {working && <div class="draft-actions"><button type="button" class="secondary" onClick={stopWaiting}>Stop waiting</button></div>}
          <div class="draft-actions">
            <button type="button" class="secondary" onClick={copy}>Copy message</button>
            <a class="button-link" href={mailtoHref(to, draft)}>{to ? `Open in my email app, to ${to}` : 'Open in my email app'}</a>
          </div>
          <p class="meta" aria-live="polite">{copied === 'yes' ? 'Copied. Paste it into a new email.' : copied === 'no' ? 'Couldn’t copy here. Select the message and copy it yourself.' : ''}</p>
        </div>
      </details>
    </div>
  );
}
