import * as Clipboard from 'expo-clipboard';
import { buildShareMessage, GuessEntry } from '@/utils/gameLogic';

export async function copyShareMessage(
  day: number,
  guesses: GuessEntry[],
  won: boolean,
): Promise<void> {
  const message = buildShareMessage(day, guesses, won);
  await Clipboard.setStringAsync(message);
}
