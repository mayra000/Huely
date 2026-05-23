import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { AppTheme } from '@/constants/theme';

const RULES = [
  { icon: '🟢', text: 'Green — correct character in the correct position' },
  { icon: '🟠', text: 'Orange — character is in the code but wrong position' },
  { icon: '⚫', text: 'Gray — character is not in the hex code at all' },
  { icon: '#', text: 'Hex codes use only 0–9 and A–F (16 characters total)' },
  { icon: '5', text: 'You have 5 guesses to find the color' },
  { icon: '↻', text: 'Practice mode generates a random color — no effect on your daily streak' },
];

interface RulesModalProps {
  visible: boolean;
  theme: AppTheme;
  onClose: () => void;
}

export default function RulesModal({ visible, theme, onClose }: RulesModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.backdrop, { backgroundColor: theme.modalBackdrop }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, theme.modalCard]}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>How to play</Text>
                <Pressable onPress={onClose} hitSlop={8}>
                  <Text style={[styles.close, { color: theme.textMuted }]}>✕</Text>
                </Pressable>
              </View>

              <Text style={[styles.intro, { color: theme.textMuted }]}>
                Guess today's 6-character hex color code. After each guess you'll get feedback on
                each character.
              </Text>

              <View style={styles.rulesList}>
                {RULES.map(({ icon, text }) => (
                  <View key={text} style={styles.ruleRow}>
                    <Text style={styles.ruleIcon}>{icon}</Text>
                    <Text style={[styles.ruleText, { color: theme.textMuted }]}>{text}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.button,
                  theme.accentBtn,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.buttonText}>Got it</Text>
              </Pressable>
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
    padding: 20,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  close: {
    fontSize: 18,
    lineHeight: 18,
  },
  intro: {
    fontSize: 12,
    lineHeight: 19,
  },
  rulesList: {
    gap: 10,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  ruleIcon: {
    fontSize: 14,
    minWidth: 20,
    textAlign: 'center',
    marginTop: 1,
  },
  ruleText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    width: '100%',
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
