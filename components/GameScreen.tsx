import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTheme, ThemeMode } from '@/constants/theme';
import ColorPreview from './ColorPreview';
import GuessGrid from './GuessGrid';
import Keyboard from './Keyboard';
import RulesModal from './RulesModal';
import StatsModal from './StatsModal';
import SuccessModal from './SuccessModal';
import {
  evaluateGuess,
  getDayNumber,
  getRandomPracticeColor,
  getBestColorMatchPercent,
  GuessEntry,
} from '@/utils/gameLogic';
import {
  createFreshDailyState,
  DailyState,
  loadDailyState,
  loadStats,
  loadTheme,
  saveDailyState,
  saveTheme,
  Stats,
  updateStatsAfterGame,
} from '@/utils/storage';

function IconBtn({
  onPress,
  label,
  theme,
  children,
}: {
  onPress: () => void;
  label: string;
  theme: ReturnType<typeof getTheme>;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.iconBtn, theme.glassCard, pressed && styles.pressed]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.iconBtnText, { color: theme.textPrimary }]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [ready, setReady] = useState(false);
  const [isPractice, setIsPractice] = useState(false);
  const [target, setTarget] = useState('');
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [current, setCurrent] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const hasFinishedRef = useRef(false);

  const theme = getTheme(themeMode);
  const yourColor = guesses.length > 0 ? guesses[guesses.length - 1].code : null;

  const applyDailyState = useCallback((state: DailyState) => {
    setIsPractice(false);
    setTarget(state.target);
    setGuesses(state.guesses);
    setCurrent('');
    setGameOver(state.gameOver);
    setWon(state.won);
    setShowSuccessModal(false);
    hasFinishedRef.current = state.gameOver;
  }, []);

  useEffect(() => {
    async function init() {
      const [savedTheme, daily, savedStats] = await Promise.all([
        loadTheme(),
        loadDailyState(),
        loadStats(),
      ]);
      setThemeMode(savedTheme);
      applyDailyState(daily);
      setStats(savedStats);
      setReady(true);
    }
    init();
  }, [applyDailyState]);

  const persistDaily = useCallback(
    async (next: Partial<DailyState>) => {
      if (isPractice) return;
      const state: DailyState = {
        date: createFreshDailyState().date,
        target,
        guesses,
        gameOver,
        won,
        ...next,
      };
      await saveDailyState(state);
    },
    [isPractice, target, guesses, gameOver, won],
  );

  useEffect(() => {
    if (!ready || !gameOver || hasFinishedRef.current) return;

    hasFinishedRef.current = true;

    async function finishGame() {
      if (!isPractice) {
        const updated = await updateStatsAfterGame(won, guesses.length);
        setStats(updated);
        await persistDaily({ gameOver: true, won, guesses });
      }
    }

    finishGame();
  }, [gameOver, ready, isPractice, won, guesses, persistDaily]);

  function startPractice() {
    setIsPractice(true);
    setTarget(getRandomPracticeColor());
    setGuesses([]);
    setCurrent('');
    setGameOver(false);
    setWon(false);
    setShowSuccessModal(false);
    hasFinishedRef.current = false;
  }

  async function exitPractice() {
    const daily = await loadDailyState();
    applyDailyState(daily);
  }

  function toggleTheme() {
    const next: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    saveTheme(next);
  }

  function handleKey(k: string) {
    if (gameOver) return;
    if (k === '⌫') {
      setCurrent((c) => c.slice(0, -1));
    } else if (current.length < 6) {
      setCurrent((c) => (c + k).toUpperCase());
    }
  }

  async function submit() {
    if (current.length !== 6 || gameOver) return;

    const result = evaluateGuess(current, target);
    const newGuesses = [...guesses, { code: current, result }];
    const didWin = current === target;
    const didLose = !didWin && newGuesses.length >= 5;

    setGuesses(newGuesses);
    setCurrent('');

    if (didWin) {
      setWon(true);
      setGameOver(true);
      setShowSuccessModal(true);
    } else if (didLose) {
      setGameOver(true);
    }

    if (!isPractice) {
      await saveDailyState({
        date: createFreshDailyState().date,
        target,
        guesses: newGuesses,
        gameOver: didWin || didLose,
        won: didWin,
      });
    }
  }

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#534ab7" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[...theme.gradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>huely</Text>
          <View style={styles.headerActions}>
            {isPractice ? (
              <Pressable
                onPress={exitPractice}
                accessibilityLabel="Back to daily mode"
                style={({ pressed }) => [
                  styles.headerTextBtn,
                  theme.glassCard,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.headerTextBtnLabel, { color: theme.textPrimary }]}>
                  ← Daily
                </Text>
              </Pressable>
            ) : (
              <IconBtn onPress={startPractice} label="Practice mode" theme={theme}>
                ↻
              </IconBtn>
            )}
            <IconBtn onPress={() => setShowRules(true)} label="How to play" theme={theme}>
              ?
            </IconBtn>
            <IconBtn
              onPress={() => setShowStats(true)}
              label="Statistics"
              theme={theme}
            >
              <SymbolView
                name={{ ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' }}
                size={16}
                tintColor={theme.textPrimary}
              />
            </IconBtn>
            <Pressable
              onPress={toggleTheme}
              style={({ pressed }) => [styles.themeToggle, theme.glassCard, pressed && styles.pressed]}
            >
              <Text style={[styles.themeToggleText, { color: theme.textPrimary }]}>
                {themeMode === 'dark' ? '☀ light' : '☾ dark'}
              </Text>
            </Pressable>
          </View>
        </View>

        {isPractice && (
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.practiceBadge,
                {
                  backgroundColor: theme.practiceBadge.backgroundColor,
                  borderColor: theme.practiceBadge.borderColor,
                },
              ]}
            >
              <Text style={[styles.practiceBadgeText, { color: theme.practiceBadge.color }]}>
                PRACTICE MODE
              </Text>
            </View>
          </View>
        )}

        <ColorPreview
          theme={theme}
          yourColor={yourColor}
          targetColor={target}
          isPractice={isPractice}
          revealTargetHex={gameOver}
        />

        {gameOver && !won && (
          <View style={[styles.resultBanner, theme.glassCard]}>
            <Text style={[styles.resultTitle, { color: theme.lossText }]}>
              Out of guesses
            </Text>
            <Text style={[styles.resultSub, { color: theme.textMuted }]}>
              The color was #{target}
            </Text>
            <Text style={[styles.resultSub, { color: theme.textMuted }]}>
              Best guess: {getBestColorMatchPercent(guesses, target)}% color match
            </Text>
            {isPractice && (
              <Pressable
                onPress={startPractice}
                style={({ pressed }) => [
                  styles.tryAnother,
                  theme.accentBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.tryAnotherText}>Try another ↻</Text>
              </Pressable>
            )}
          </View>
        )}

        <GuessGrid theme={theme} guesses={guesses} current={current} gameOver={gameOver} />

        <Keyboard
          theme={theme}
          guesses={guesses}
          current={current}
          gameOver={gameOver}
          onKey={handleKey}
          onSubmit={submit}
        />

        <View style={styles.legend}>
          {[
            { label: 'Exact', color: theme.feedback.exact.backgroundColor },
            { label: 'Close', color: theme.feedback.close.backgroundColor },
            { label: 'Miss', color: theme.legendMiss },
          ].map(({ label, color }) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color as string }]} />
              <Text style={[styles.legendText, { color: theme.textMuted }]}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <RulesModal visible={showRules} theme={theme} onClose={() => setShowRules(false)} />
      <StatsModal
        visible={showStats}
        theme={theme}
        stats={stats ?? {
          currentStreak: 0,
          maxStreak: 0,
          gamesPlayed: 0,
          wins: 0,
          guessDistribution: [0, 0, 0, 0, 0],
          lastPlayedDate: null,
        }}
        onClose={() => setShowStats(false)}
      />
      <SuccessModal
        visible={showSuccessModal}
        theme={theme}
        day={getDayNumber()}
        guesses={guesses}
        targetColor={target}
        isPractice={isPractice}
        onClose={() => setShowSuccessModal(false)}
        onTryAnother={startPractice}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2ebf0',
  },
  content: {
    paddingHorizontal: 16,
    maxWidth: 360,
    width: '100%',
    alignSelf: 'center',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: {
    fontSize: 15,
  },
  themeToggle: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    minHeight: 32,
    justifyContent: 'center',
  },
  headerTextBtn: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minHeight: 32,
    justifyContent: 'center',
  },
  headerTextBtnLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  themeToggleText: {
    fontSize: 11,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.75,
  },
  badgeRow: {
    alignItems: 'center',
  },
  practiceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: StyleSheet.hairlineWidth,
  },
  practiceBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  resultBanner: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultSub: {
    fontSize: 12,
    marginTop: 3,
    textAlign: 'center',
  },
  tryAnother: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 99,
  },
  tryAnotherText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
  },
});
