import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_THEME_MODE, ThemeMode } from '@/constants/theme';
import { loadTheme, saveTheme } from '@/utils/storage';

type ThemeContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(DEFAULT_THEME_MODE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadTheme().then((mode) => {
      setThemeModeState(mode);
      setReady(true);
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    saveTheme(mode);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, ready }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return ctx;
}
