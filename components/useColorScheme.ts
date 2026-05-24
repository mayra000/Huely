import { useColorScheme as useColorSchemeCore } from 'react-native';
import { DEFAULT_THEME_MODE } from '@/constants/theme';

export const useColorScheme = () => {
  const coreScheme = useColorSchemeCore();
  return coreScheme === 'unspecified' || !coreScheme ? DEFAULT_THEME_MODE : coreScheme;
};
