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
