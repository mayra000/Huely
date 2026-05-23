import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { AppTheme } from '@/constants/theme';
import { Stats } from '@/utils/storage';

interface StatsModalProps {
  visible: boolean;
  theme: AppTheme;
  stats: Stats;
  onClose: () => void;
}

export default function StatsModal({ visible, theme, stats, onClose }: StatsModalProps) {
  const winPct =
    stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
  const maxBar = Math.max(...stats.guessDistribution, 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.backdrop, { backgroundColor: theme.modalBackdrop }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, theme.modalCard]}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Statistics</Text>
                <Pressable onPress={onClose} hitSlop={8}>
                  <Text style={[styles.close, { color: theme.textMuted }]}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.statGrid}>
                {[
                  { label: 'Current\nStreak', value: stats.currentStreak },
                  { label: 'Max\nStreak', value: stats.maxStreak },
                  { label: 'Played', value: stats.gamesPlayed },
                  { label: 'Win %', value: winPct },
                ].map(({ label, value }) => (
                  <View key={label} style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.textPrimary }]}>{value}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Guess Distribution
              </Text>

              <View style={styles.chart}>
                {stats.guessDistribution.map((count, i) => (
                  <View key={i} style={styles.barRow}>
                    <Text style={[styles.barLabel, { color: theme.textMuted }]}>{i + 1}</Text>
                    <View style={[styles.barTrack, { backgroundColor: theme.emptySwatch }]}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${Math.max((count / maxBar) * 100, count > 0 ? 8 : 0)}%`,
                            backgroundColor: theme.feedback.exact.backgroundColor,
                          },
                        ]}
                      >
                        <Text style={styles.barCount}>{count > 0 ? count : ''}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
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
    gap: 16,
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
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  chart: {
    gap: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    width: 12,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  barTrack: {
    flex: 1,
    height: 22,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    minWidth: 0,
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  barCount: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
