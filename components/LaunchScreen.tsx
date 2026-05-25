import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEFAULT_THEME_MODE, getTheme, GRADIENT_COLORS } from '@/constants/theme';

const LOGO_SIZE = 153;

type LaunchScreenProps = {
  onLayout?: () => void;
};

export default function LaunchScreen({ onLayout }: LaunchScreenProps) {
  const theme = getTheme(DEFAULT_THEME_MODE);
  const insets = useSafeAreaInsets();
  const creditOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(creditOpacity, {
      toValue: 1,
      duration: 500,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [creditOpacity]);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <LinearGradient
        colors={[...GRADIENT_COLORS[DEFAULT_THEME_MODE]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.logoArea}>
        <View style={styles.logoGroup}>
          <Image
            source={require('@/assets/images/hexli-logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Hexli logo"
          />
          <Animated.Text
            style={[
              styles.title,
              { color: theme.textPrimary, opacity: creditOpacity },
            ]}
          >
            HEXLI
          </Animated.Text>
        </View>
      </View>
      <Animated.Text
        style={[
          styles.credit,
          {
            color: theme.textMuted,
            bottom: insets.bottom + 24,
            opacity: creditOpacity,
          },
        ]}
      >
        Made by Mayra
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoGroup: {
    alignItems: 'center',
    transform: [{ translateY: 20 }],
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  title: {
    marginTop: 16,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 6,
  },
  credit: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
