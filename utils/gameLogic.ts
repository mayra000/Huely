import { DAILY_COLORS } from './colors';

export type TileResult = 'exact' | 'close' | 'miss';
export type KeyStatus = TileResult | null;

export interface GuessEntry {
  code: string;
  result: TileResult[];
}

export function formatDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDayIndex(date: Date = new Date()): number {
  return (
    (date.getFullYear() * 366 + date.getMonth() * 31 + date.getDate()) %
    DAILY_COLORS.length
  );
}

export function getDayNumber(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getTodayColor(date: Date = new Date()): string {
  return DAILY_COLORS[getDayIndex(date)];
}

export function getRandomPracticeColor(): string {
  return Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')
    .toUpperCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const value = parseInt(hex, 16);
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  };
}

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  let x = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
  let y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175;
  let z = lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041;

  x /= 0.95047;
  y /= 1;
  z /= 1.08883;

  const f = (t: number) => (t > 0.008856 ? t ** (1 / 3) : 7.787 * t + 16 / 116);

  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** Perceptual color similarity from 0–100 based on CIE76 Delta E in LAB space. */
export function getColorMatchPercent(guess: string, target: string): number {
  if (guess.toUpperCase() === target.toUpperCase()) return 100;

  const guessRgb = hexToRgb(guess);
  const targetRgb = hexToRgb(target);
  const guessLab = rgbToLab(guessRgb.r, guessRgb.g, guessRgb.b);
  const targetLab = rgbToLab(targetRgb.r, targetRgb.g, targetRgb.b);

  const delta = Math.hypot(
    guessLab[0] - targetLab[0],
    guessLab[1] - targetLab[1],
    guessLab[2] - targetLab[2],
  );

  return Math.round(Math.max(0, Math.min(100, 100 - delta)));
}

export function getBestColorMatchPercent(guesses: GuessEntry[], target: string): number {
  if (guesses.length === 0) return 0;
  return Math.max(...guesses.map((g) => getColorMatchPercent(g.code, target)));
}

export function evaluateGuess(guess: string, target: string): TileResult[] {
  const result: TileResult[] = Array(6).fill('miss');
  const targetChars = target.split('');
  const guessChars = guess.split('');
  const used = Array(6).fill(false);

  for (let i = 0; i < 6; i++) {
    if (guessChars[i] === targetChars[i]) {
      result[i] = 'exact';
      used[i] = true;
    }
  }

  for (let i = 0; i < 6; i++) {
    if (result[i] === 'exact') continue;
    const ch = guessChars[i];
    const idx = targetChars.findIndex((t, j) => !used[j] && t === ch);
    if (idx !== -1) {
      result[i] = 'close';
      used[idx] = true;
    }
  }

  return result;
}

export function getKeyStatus(guesses: GuessEntry[], key: string): KeyStatus {
  let status: KeyStatus = null;
  for (const g of guesses) {
    g.code.split('').forEach((ch, i) => {
      if (ch === key) {
        const r = g.result[i];
        if (r === 'exact') status = 'exact';
        else if (r === 'close' && status !== 'exact') status = 'close';
        else if (!status) status = 'miss';
      }
    });
  }
  return status;
}

const EMOJI_MAP: Record<TileResult, string> = {
  exact: '🟢',
  close: '🟠',
  miss: '⚫',
};

export function buildEmojiGrid(guesses: GuessEntry[]): string {
  return guesses.map((g) => g.result.map((r) => EMOJI_MAP[r]).join('')).join('\n');
}

export function buildShareMessage(
  day: number,
  guesses: GuessEntry[],
  won: boolean,
): string {
  const score = won ? `${guesses.length}/5` : 'X/5';
  return `Huely #${day} ${score}\n\n${buildEmojiGrid(guesses)}`;
}

export function getYesterdayDateKey(date: Date = new Date()): string {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDateKey(yesterday);
}
