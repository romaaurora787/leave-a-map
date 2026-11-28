import { describe, expect, it } from 'vitest';
import { loadNotes, NOTE_MAX, saveNotes } from '../../apps/scan/src/checklist.ts';
import { blanks, rewriteProblem } from '../../apps/scan/src/nano.ts';

const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };

describe('notes per account', () => {
  it('round-trips and keeps lists apart', () => {
    const s = mem();
    expect(saveNotes('loss.a@x.example', { 'bank.example': 'rang 3 Dec, ref 88120' }, s)).toBe(true);
    expect(loadNotes('loss.a@x.example', s)).toEqual({ 'bank.example': 'rang 3 Dec, ref 88120' });
    expect(loadNotes('uni.example', s)).toEqual({});
  });
  it('drops anything that is not text and caps the length', () => {
    const s = mem();
    s.setItem('lam.notes.l', JSON.stringify({ a: 5, b: '', c: 'x'.repeat(NOTE_MAX + 10) }));
    expect(loadNotes('l', s)).toEqual({ c: 'x'.repeat(NOTE_MAX) });
    s.setItem('lam.notes.l', '[1,2]');
    expect(loadNotes('l', s)).toEqual({});
  });
  it('works with no storage', () => {
    expect(loadNotes('l', null)).toEqual({});
    expect(saveNotes('l', {}, null)).toBe(false);
  });
});

describe('blanks in a draft', () => {
  it('finds each [blank] once', () => {
    expect(blanks('Dear team, [their full name] died on [date of death]. [their full name]')).toEqual(['[their full name]', '[date of death]']);
  });
});

describe('checking a rewrite', () => {
  const before = 'Dear team, I am writing about [their full name], who passed away on [date of death]. Please close their account.';
  it('accepts a rewrite that keeps every blank and says "their"', () => {
    expect(rewriteProblem(before, 'Dear team, I write regarding [their full name], who passed away on [date of death]. Kindly close their account.')).toBeNull();
  });
  // The three slips Nano made with the old prompt, on the live sample letters.
  it('refuses a dropped or merged blank', () => {
    expect(rewriteProblem(before, 'Dear team, [their full name] passed away. Please close their account, which is all I need.')).toBe('lost-blanks');
  });
  it('refuses a made-up blank', () => {
    expect(rewriteProblem(before, 'Dear team, [their full name] passed away on [date of death]. Please close [his/her] account now.')).toBe('added-blanks');
  });
  it('refuses a guessed gender, but not words that were already there', () => {
    expect(rewriteProblem(before, 'Dear team, [their full name] passed away on [date of death]. Please close his account now, thanks.')).toBe('gendered');
    expect(rewriteProblem('Her account: [their full name], died on [date of death].', 'Regarding her account: [their full name], died on [date of death].')).toBeNull();
  });
});
