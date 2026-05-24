import { Platform, StyleSheet, TextStyle, ViewStyle } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export const DEFAULT_THEME_MODE: ThemeMode = 'dark';

export const GRADIENT_COLORS = {
  light: ['#c9d6df', '#e2ebf0', '#d4c5e2'] as const,
  dark: ['#1a1a2e', '#16213e', '#0f3460'] as const,
};

export const monoFont = Platform.select({
  ios: 'SFMono-Regular',
  default: 'monospace',
});

export function getTheme(mode: ThemeMode) {
  const dark = mode === 'dark';

  return {
    mode,
    dark,
    textPrimary: dark ? '#e8eaf6' : '#1a1a2e',
    textMuted: dark ? 'rgba(232,234,246,0.5)' : 'rgba(26,26,46,0.5)',
    gradient: GRADIENT_COLORS[mode],
    glassCard: {
      backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.45)',
      borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.75)',
      borderWidth: StyleSheet.hairlineWidth,
    } satisfies ViewStyle,
    modalCard: {
      backgroundColor: dark ? '#1e2038' : '#f5f7fa',
      borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.75)',
      borderWidth: StyleSheet.hairlineWidth,
    } satisfies ViewStyle,
    emptyTile: {
      backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.35)',
      borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
      borderWidth: StyleSheet.hairlineWidth,
    } satisfies ViewStyle,
    keyBase: {
      backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
      borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.75)',
      borderWidth: StyleSheet.hairlineWidth,
      color: dark ? '#e8eaf6' : '#1a1a2e',
    } satisfies ViewStyle & TextStyle,
    submitBtn: {
      backgroundColor: dark ? 'rgba(127,119,221,0.75)' : 'rgba(83,74,183,0.8)',
      color: '#fff',
    } satisfies ViewStyle & TextStyle,
    practiceBadge: {
      backgroundColor: 'rgba(186,117,23,0.2)',
      borderColor: 'rgba(186,117,23,0.35)',
      color: dark ? '#FAC775' : '#854F0B',
    },
    accentBtn: {
      backgroundColor: dark ? 'rgba(127,119,221,0.75)' : 'rgba(83,74,183,0.8)',
    },
    feedback: {
      exact: { backgroundColor: 'rgba(34,160,107,0.85)', color: '#fff', borderWidth: 0 },
      close: { backgroundColor: 'rgba(186,117,23,0.85)', color: '#fff', borderWidth: 0 },
      miss: dark
        ? {
            backgroundColor: 'rgba(100,100,120,0.45)',
            color: 'rgba(232,234,246,0.65)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: StyleSheet.hairlineWidth,
          }
        : {
            backgroundColor: 'rgba(180,178,169,0.55)',
            color: 'rgba(26,26,46,0.7)',
            borderColor: 'rgba(255,255,255,0.6)',
            borderWidth: StyleSheet.hairlineWidth,
          },
    },
    keyMiss: dark
      ? {
          backgroundColor: 'rgba(80,80,100,0.4)',
          color: 'rgba(232,234,246,0.35)',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: StyleSheet.hairlineWidth,
        }
      : {
          backgroundColor: 'rgba(180,178,169,0.4)',
          color: 'rgba(26,26,46,0.4)',
          borderColor: 'rgba(255,255,255,0.5)',
          borderWidth: StyleSheet.hairlineWidth,
        },
    legendMiss: dark ? 'rgba(100,100,120,0.45)' : 'rgba(180,178,169,0.55)',
    activeTileBorder: dark ? 'rgba(255,255,255,0.35)' : 'rgba(83,74,183,0.5)',
    emptySwatch: dark ? 'rgba(255,255,255,0.06)' : 'rgba(180,178,169,0.3)',
    modalBackdrop: 'rgba(0,0,0,0.5)',
    winText: '#22a06b',
    lossText: '#e2483d',
  };
}

export type AppTheme = ReturnType<typeof getTheme>;
