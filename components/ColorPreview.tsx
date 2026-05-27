import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import { AppTheme, monoFont } from '@/constants/theme';

interface ColorPreviewProps {
  theme: AppTheme;
  yourColor: string | null;
  targetColor: string;
  isPractice: boolean;
  revealTargetHex: boolean;
}

type ColorCardId = 'your' | 'target';

export default function ColorPreview({
  theme,
  yourColor,
  targetColor,
  isPractice,
  revealTargetHex,
}: ColorPreviewProps) {
  const [expandedCard, setExpandedCard] = useState<ColorCardId | null>(null);
  const targetLabel = isPractice ? 'PRACTICE COLOR' : "TODAY'S COLOR";
  const targetHex = revealTargetHex ? `#${targetColor}` : '??????';
  const cards = [
    {
      id: 'your' as const,
      label: 'YOUR COLOR',
      color: yourColor,
      hex: yourColor ? `#${yourColor}` : '—',
      expandable: Boolean(yourColor),
    },
    {
      id: 'target' as const,
      label: targetLabel,
      color: targetColor,
      hex: targetHex,
      expandable: true,
    },
  ];
  const expandedDetails = cards.find(({ id }) => id === expandedCard);

  function closeExpanded() {
    setExpandedCard(null);
  }

  return (
    <>
      <View style={styles.row}>
        {cards.map(({ id, label, color, hex, expandable }) => {
          const cardContent = (
            <>
              <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
              <View
                style={[
                  styles.swatch,
                  {
                    backgroundColor: color ? `#${color}` : theme.emptySwatch,
                  },
                ]}
              >
                {!color && <Text style={[styles.question, { color: theme.textMuted }]}>?</Text>}
              </View>
              <Text style={[styles.hex, { color: theme.textMuted, fontFamily: monoFont }]}>
                {hex}
              </Text>
            </>
          );

          if (expandable) {
            return (
              <Pressable
                key={label}
                onPress={() => setExpandedCard(id)}
                accessibilityRole="button"
                accessibilityLabel={`Expand ${label.toLowerCase()}`}
                style={({ pressed }) => [
                  styles.card,
                  theme.glassCard,
                  pressed && styles.pressed,
                ]}
              >
                {cardContent}
              </Pressable>
            );
          }

          return (
            <View key={label} style={[styles.card, theme.glassCard]}>
              {cardContent}
            </View>
          );
        })}
      </View>

      <Modal
        visible={expandedCard !== null}
        transparent
        animationType="fade"
        onRequestClose={closeExpanded}
      >
        <TouchableWithoutFeedback onPress={closeExpanded}>
          <View style={[styles.backdrop, { backgroundColor: theme.modalBackdrop }]}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalCard, theme.modalCard]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                    {expandedDetails?.label}
                  </Text>
                  <Pressable onPress={closeExpanded} hitSlop={8}>
                    <Text style={[styles.close, { color: theme.textMuted }]}>✕</Text>
                  </Pressable>
                </View>

                <View
                  style={[
                    styles.expandedSwatch,
                    {
                      backgroundColor: expandedDetails?.color
                        ? `#${expandedDetails.color}`
                        : theme.emptySwatch,
                    },
                  ]}
                >
                  {!expandedDetails?.color && (
                    <Text style={[styles.question, { color: theme.textMuted }]}>?</Text>
                  )}
                </View>
                <Text
                  style={[styles.modalHex, { color: theme.textMuted, fontFamily: monoFont }]}
                >
                  {expandedDetails?.hex}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  swatch: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  question: {
    fontSize: 20,
  },
  hex: {
    fontSize: 11,
    marginTop: 6,
  },
  pressed: {
    opacity: 0.75,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  close: {
    fontSize: 18,
    lineHeight: 18,
  },
  expandedSwatch: {
    height: 220,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHex: {
    fontSize: 13,
    textAlign: 'center',
  },
});
