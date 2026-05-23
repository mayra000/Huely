import { View, Text, StyleSheet } from 'react-native';
import { AppTheme, monoFont } from '@/constants/theme';
import { GuessEntry, TileResult } from '@/utils/gameLogic';

interface GuessGridProps {
  theme: AppTheme;
  guesses: GuessEntry[];
  current: string;
  gameOver: boolean;
}

function getTileStyle(result: TileResult, theme: AppTheme) {
  return theme.feedback[result];
}

export default function GuessGrid({ theme, guesses, current, gameOver }: GuessGridProps) {
  const remainingEmpty = Math.max(0, 5 - guesses.length - (gameOver ? 0 : 1));

  return (
    <View style={[styles.container, theme.glassCard]}>
      {guesses.map((g, ri) => (
        <View key={ri} style={styles.row}>
          <Text style={[styles.hash, { color: theme.textMuted, fontFamily: monoFont }]}>#</Text>
          {g.code.split('').map((ch, ci) => {
            const tileStyle = getTileStyle(g.result[ci], theme);
            return (
              <View key={ci} style={[styles.tile, tileStyle]}>
                <Text style={[styles.tileText, { color: tileStyle.color, fontFamily: monoFont }]}>
                  {ch}
                </Text>
              </View>
            );
          })}
        </View>
      ))}

      {!gameOver && (
        <View style={styles.row}>
          <Text style={[styles.hash, { color: theme.textMuted, fontFamily: monoFont }]}>#</Text>
          {Array.from({ length: 6 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.tile,
                theme.emptyTile,
                current[i] && {
                  borderColor: theme.activeTileBorder,
                  borderWidth: StyleSheet.hairlineWidth,
                },
              ]}
            >
              <Text
                style={[
                  styles.tileText,
                  { color: current[i] ? theme.textPrimary : 'transparent', fontFamily: monoFont },
                ]}
              >
                {current[i] || ''}
              </Text>
            </View>
          ))}
        </View>
      )}

      {Array.from({ length: remainingEmpty }).map((_, ri) => (
        <View key={`empty-${ri}`} style={styles.row}>
          <Text style={[styles.hash, { color: theme.textMuted, fontFamily: monoFont }]}>#</Text>
          {Array.from({ length: 6 }).map((_, ci) => (
            <View key={ci} style={[styles.tile, theme.emptyTile]} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  hash: {
    width: 14,
    fontSize: 10,
  },
  tile: {
    flex: 1,
    aspectRatio: 1.15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
