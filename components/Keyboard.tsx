import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AppTheme, monoFont } from '@/constants/theme';
import { getKeyStatus, GuessEntry } from '@/utils/gameLogic';

const KEY_ROWS = [
  ['1', '2', '3', 'A', 'B'],
  ['4', '5', '6', 'C', 'D'],
  ['7', '8', '9', 'E', 'F'],
  ['⌫', '0'],
];

interface KeyboardProps {
  theme: AppTheme;
  guesses: GuessEntry[];
  current: string;
  gameOver: boolean;
  onKey: (key: string) => void;
  onSubmit: () => void;
}

export default function Keyboard({
  theme,
  guesses,
  current,
  gameOver,
  onKey,
  onSubmit,
}: KeyboardProps) {
  const canSubmit = current.length === 6 && !gameOver;

  function getKeyStyle(key: string) {
    if (key === '⌫') return theme.keyBase;
    const status = getKeyStatus(guesses, key);
    if (status === 'exact') return theme.feedback.exact;
    if (status === 'close') return theme.feedback.close;
    if (status === 'miss') return theme.keyMiss;
    return theme.keyBase;
  }

  return (
    <View style={[styles.container, theme.glassCard]}>
      {KEY_ROWS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((k) => {
            const keyStyle = getKeyStyle(k);
            const isBackspace = k === '⌫';
            return (
              <Pressable
                key={k}
                onPress={() => onKey(k)}
                disabled={gameOver}
                style={({ pressed }) => [
                  styles.key,
                  keyStyle,
                  isBackspace ? styles.backspaceKey : styles.regularKey,
                  pressed && styles.keyPressed,
                ]}
              >
                <Text style={[styles.keyText, { color: keyStyle.color, fontFamily: monoFont }]}>
                  {k}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}

      <Pressable
        onPress={onSubmit}
        disabled={!canSubmit}
        style={({ pressed }) => [
          styles.submit,
          theme.submitBtn,
          !canSubmit && styles.submitDisabled,
          pressed && canSubmit && styles.keyPressed,
        ]}
      >
        <Text style={[styles.submitText, { color: theme.submitBtn.color }]}>Submit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 7,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  key: {
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regularKey: {
    flex: 1,
    minWidth: 36,
  },
  backspaceKey: {
    minWidth: 48,
    paddingHorizontal: 18,
  },
  keyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  keyPressed: {
    opacity: 0.75,
  },
  submit: {
    width: '100%',
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
