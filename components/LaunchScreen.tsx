import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTheme } from '@/constants/theme';
import { useColorScheme } from './useColorScheme';

const LOGO_SIZE = 180;

type LaunchScreenProps = {
  onLayout?: () => void;
};

export default function LaunchScreen({ onLayout }: LaunchScreenProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
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
        colors={[...theme.gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.logoArea}>
        <Image
          source={require('@/assets/images/huely-logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Huely logo"
        />
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
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    transform: [{ translateY: -450 }],
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
