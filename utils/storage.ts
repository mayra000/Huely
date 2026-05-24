import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  formatDateKey,
  getTodayColor,
  getYesterdayDateKey,
  GuessEntry,
} from './gameLogic';
import { DEFAULT_THEME_MODE, ThemeMode } from '@/constants/theme';

const THEME_KEY = '@huely/theme';
const STATS_KEY = '@huely/stats';
const DAILY_KEY = '@huely/daily';

export interface DailyState {
  date: string;
  target: string;
  guesses: GuessEntry[];
  gameOver: boolean;
  won: boolean;
}

export interface Stats {
  currentStreak: number;
  maxStreak: number;
  gamesPlayed: number;
  wins: number;
  guessDistribution: [number, number, number, number, number];
  lastPlayedDate: string | null;
}

const DEFAULT_STATS: Stats = {
  currentStreak: 0,
  maxStreak: 0,
  gamesPlayed: 0,
  wins: 0,
  guessDistribution: [0, 0, 0, 0, 0],
  lastPlayedDate: null,
};

async function readJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadTheme(): Promise<ThemeMode> {
  const value = await AsyncStorage.getItem(THEME_KEY);
  return value === 'light' ? 'light' : DEFAULT_THEME_MODE;
}

export async function saveTheme(mode: ThemeMode): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, mode);
}

export async function loadStats(): Promise<Stats> {
  const stats = await readJson<Stats>(STATS_KEY);
  return stats ?? { ...DEFAULT_STATS };
}

export async function saveStats(stats: Stats): Promise<void> {
  await writeJson(STATS_KEY, stats);
}

export function createFreshDailyState(date: Date = new Date()): DailyState {
  return {
    date: formatDateKey(date),
    target: getTodayColor(date),
    guesses: [],
    gameOver: false,
    won: false,
  };
}

export async function loadDailyState(): Promise<DailyState> {
  const today = formatDateKey();
  const saved = await readJson<DailyState>(DAILY_KEY);
  if (saved && saved.date === today) {
    return saved;
  }
  return createFreshDailyState();
}

export async function saveDailyState(state: DailyState): Promise<void> {
  await writeJson(DAILY_KEY, state);
}

export async function updateStatsAfterGame(
  won: boolean,
  guessCount: number,
): Promise<Stats> {
  const stats = await loadStats();
  const today = formatDateKey();
  const yesterday = getYesterdayDateKey();

  if (stats.lastPlayedDate === today) {
    return stats;
  }

  stats.gamesPlayed += 1;

  if (won) {
    stats.wins += 1;
    stats.guessDistribution[guessCount - 1] += 1;

    if (stats.lastPlayedDate === yesterday) {
      stats.currentStreak += 1;
    } else {
      stats.currentStreak = 1;
    }

    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  } else {
    stats.currentStreak = 0;
  }

  stats.lastPlayedDate = today;
  await saveStats(stats);
  return stats;
}
