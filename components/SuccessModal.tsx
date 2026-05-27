import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { AppTheme } from '@/constants/theme';
import { buildEmojiGrid, getBestColorMatchPercent, GuessEntry } from '@/utils/gameLogic';
import { copyShareMessage } from './ShareSheet';

interface SuccessModalProps {
  visible: boolean;
  theme: AppTheme;
  day: number;
  guesses: GuessEntry[];
  targetColor: string;
  isPractice: boolean;
  won: boolean;
  onClose: () => void;
  onTryAnother?: () => void;
}

export default function SuccessModal({
  visible,
  theme,
  day,
  guesses,
  targetColor,
  isPractice,
  won,
  onClose,
  onTryAnother,
}: SuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const guessCount = guesses.length;
  const emojiGrid = buildEmojiGrid(guesses);
  const bestMatch = getBestColorMatchPercent(guesses, targetColor);

  async function handleCopy() {
    await copyShareMessage(day, guesses, won);
    setCopied(true);
  }

  function handleClose() {
    setCopied(false);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={[styles.backdrop, { backgroundColor: theme.modalBackdrop }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, theme.modalCard]}>
              <View
                style={[styles.colorSwatch, { backgroundColor: `#${targetColor}` }]}
              />

              <Text style={[styles.title, { color: won ? theme.winText : theme.lossText }]}>
                {won ? 'Nice eye!' : 'So close!'}
              </Text>
              {won ? (
                <Text style={[styles.subtitle, { color: theme.textPrimary }]}>
                  You got it in {guessCount} guess{guessCount === 1 ? '' : 'es'}
                  {isPractice ? ' (practice)' : ''}
                </Text>
              ) : (
                <View style={styles.lossDetails}>
                  <Text style={[styles.subtitle, { color: theme.textPrimary }]}>
                    The color was #{targetColor}
                    {isPractice ? ' (practice)' : ''}
                  </Text>
                  <Text style={[styles.detailText, { color: theme.textMuted }]}>
                    Best guess: {bestMatch}% color match
                  </Text>
                </View>
              )}

              <View style={styles.emojiGrid}>
                {emojiGrid.split('\n').map((row, i) => (
                  <Text key={i} style={styles.emojiRow}>
                    {row}
                  </Text>
                ))}
              </View>

              <Pressable
                onPress={handleCopy}
                style={({ pressed }) => [
                  styles.button,
                  theme.accentBtn,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.buttonText}>
                  {copied ? 'Copied!' : 'Copy results to share'}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleClose}
                style={({ pressed }) => [styles.dismissBtn, pressed && styles.buttonPressed]}
              >
                <Text style={[styles.dismissText, { color: theme.textMuted }]}>Done</Text>
              </Pressable>

              {isPractice && onTryAnother && (
                <Pressable
                  onPress={() => {
                    handleClose();
                    onTryAnother();
                  }}
                  style={({ pressed }) => [styles.dismissBtn, pressed && styles.buttonPressed]}
                >
                  <Text style={[styles.tryAnotherText, { color: theme.textPrimary }]}>
                    Try another ↻
                  </Text>
                </Pressable>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  colorSwatch: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  lossDetails: {
    alignItems: 'center',
    gap: 3,
  },
  detailText: {
    fontSize: 12,
    textAlign: 'center',
  },
  emojiGrid: {
    marginVertical: 8,
    gap: 4,
    alignItems: 'center',
  },
  emojiRow: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 2,
  },
  button: {
    width: '100%',
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  dismissBtn: {
    paddingVertical: 6,
  },
  dismissText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tryAnotherText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
