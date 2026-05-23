import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LaunchScreen from '@/components/LaunchScreen';
import { ThemeProvider, useThemeMode } from '@/components/ThemeContext';
import { useColorScheme } from '@/components/useColorScheme';
import { GRADIENT_COLORS } from '@/constants/theme';

const DevMenuPreferences = requireOptionalNativeModule('DevMenuPreferences');
DevMenuPreferences?.setPreferencesAsync({ showFloatingActionButton: false });

SplashScreen.preventAutoHideAsync();

const LAUNCH_DURATION_MS = 1800;
const TRANSITION_DURATION_MS = 480;

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { themeMode, ready: themeReady } = useThemeMode();
  const statusBarScheme = themeReady ? themeMode : colorScheme;
  const [showLaunch, setShowLaunch] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const backgroundColor = showLaunch || isTransitioning
    ? GRADIENT_COLORS.light[0]
    : GRADIENT_COLORS[colorScheme][0];
  const launchOpacity = useRef(new Animated.Value(1)).current;
  const mainOpacity = useRef(new Animated.Value(0)).current;
  const mainTranslateY = useRef(new Animated.Value(28)).current;

  const hideNativeSplash = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {
      // Native splash may already be hidden.
    });
  }, []);

  const startTransition = useCallback(() => {
    setIsTransitioning(true);

    Animated.parallel([
      Animated.timing(launchOpacity, {
        toValue: 0,
        duration: TRANSITION_DURATION_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(mainOpacity, {
        toValue: 1,
        duration: TRANSITION_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(mainTranslateY, {
        toValue: 0,
        duration: TRANSITION_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setShowLaunch(false);
        setIsTransitioning(false);
      }
    });
  }, [launchOpacity, mainOpacity, mainTranslateY]);

  useEffect(() => {
    hideNativeSplash();

    const timer = setTimeout(startTransition, LAUNCH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [hideNativeSplash, startTransition]);

  const mainVisible = !showLaunch || isTransitioning;

  return (
    <SafeAreaProvider>
      <StatusBar style={statusBarScheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.fullScreen, { backgroundColor }]}>
        <Animated.View
          pointerEvents={showLaunch ? 'none' : 'auto'}
          style={[
            styles.fullScreen,
            {
              opacity: mainVisible ? mainOpacity : 0,
              transform: [{ translateY: mainTranslateY }],
            },
          ]}
        >
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'none',
              contentStyle: { backgroundColor },
            }}
          >
            <Stack.Screen name="index" />
          </Stack>
        </Animated.View>
        {showLaunch && (
          <Animated.View
            pointerEvents={isTransitioning ? 'none' : 'auto'}
            style={[styles.launchOverlay, { opacity: launchOpacity }]}
          >
            <View style={styles.fullScreen}>
              <LaunchScreen onLayout={hideNativeSplash} />
            </View>
          </Animated.View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  launchOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});
