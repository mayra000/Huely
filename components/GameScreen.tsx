import { getTheme, GRADIENT_COLORS } from '@/constants/theme';
import {
    evaluateGuess,
    getBestColorMatchPercent,
    getDayNumber,
    getRandomPracticeColor,
    GuessEntry,
} from '@/utils/gameLogic';
import {
    createFreshDailyState,
    DailyState,
    loadDailyState,
    loadStats,
    saveDailyState,
    Stats,
    updateStatsAfterGame,
} from '@/utils/storage';
import { syncStreakReminder } from '@/utils/streakNotifications';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ColorPreview from './ColorPreview';
import GuessGrid from './GuessGrid';
import Keyboard from './Keyboard';
import RulesModal from './RulesModal';
import StatsModal from './StatsModal';
import SuccessModal from './SuccessModal';
import { useThemeMode } from './ThemeContext';

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
  const { themeMode, setThemeMode } = useThemeMode();
  const [ready, setReady] = useState(false);
  const [isPractice, setIsPractice] = useState(false);
  const [target, setTarget] = useState('');
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [current, setCurrent] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
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
    setShowResultModal(false);
    hasFinishedRef.current = state.gameOver;
  }, []);

  useEffect(() => {
    async function init() {
      const [daily, savedStats] = await Promise.all([loadDailyState(), loadStats()]);
      applyDailyState(daily);
      setStats(savedStats);
      setReady(true);
      void syncStreakReminder(savedStats);
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
        await syncStreakReminder(updated);
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
    setShowResultModal(false);
    hasFinishedRef.current = false;
  }

  async function exitPractice() {
    const daily = await loadDailyState();
    applyDailyState(daily);
  }

  function toggleTheme() {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
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
      setShowResultModal(true);
    } else if (didLose) {
      setGameOver(true);
      setShowResultModal(true);
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
      <LinearGradient
        colors={[...GRADIENT_COLORS[themeMode]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.loading}
      >
        <ActivityIndicator size="large" color="#534ab7" />
      </LinearGradient>
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
          <Image
            source={require('@/assets/images/hexli-logo.png')}
            style={styles.titleLogo}
            resizeMode="contain"
            accessibilityLabel="Hexli logo"
          />
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
                size={18}
                tintColor={theme.textPrimary}
              />
            </IconBtn>
            <IconBtn
              onPress={toggleTheme}
              label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              theme={theme}
            >
              <SymbolView
                name={
                  themeMode === 'dark'
                    ? { ios: 'sun.max.fill', android: 'light_mode', web: 'light_mode' }
                    : { ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' }
                }
                size={18}
                tintColor={theme.textPrimary}
              />
            </IconBtn>
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
        visible={showResultModal}
        theme={theme}
        day={getDayNumber()}
        guesses={guesses}
        targetColor={target}
        isPractice={isPractice}
        won={won}
        onClose={() => setShowResultModal(false)}
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
  },
  content: {
    paddingHorizontal: 10,
    ...(Platform.OS === 'web' ? { maxWidth: 420 } : {}),
    width: '100%',
    alignSelf: 'center',
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleLogo: {
    width: 28,
    height: 28,
    flexShrink: 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: {
    fontSize: 17,
  },
  headerTextBtn: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 36,
    justifyContent: 'center',
  },
  headerTextBtnLabel: {
    fontSize: 12,
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
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
  },
});
