import { View, Text, StyleSheet } from 'react-native';
import { AppTheme, monoFont } from '@/constants/theme';

interface ColorPreviewProps {
  theme: AppTheme;
  yourColor: string | null;
  targetColor: string;
  isPractice: boolean;
  revealTargetHex: boolean;
}

export default function ColorPreview({
  theme,
  yourColor,
  targetColor,
  isPractice,
  revealTargetHex,
}: ColorPreviewProps) {
  const cards = [
    {
      label: 'YOUR COLOR',
      color: yourColor,
      hex: yourColor ? `#${yourColor}` : '—',
    },
    {
      label: isPractice ? 'PRACTICE COLOR' : "TODAY'S COLOR",
      color: targetColor,
      hex: revealTargetHex ? `#${targetColor}` : '??????',
    },
  ];

  return (
    <View style={styles.row}>
      {cards.map(({ label, color, hex }) => (
        <View key={label} style={[styles.card, theme.glassCard]}>
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
        </View>
      ))}
    </View>
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
});
