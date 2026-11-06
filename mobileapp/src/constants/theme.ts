/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#16231F',
    background: '#F6F8F5',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E5F2EB',
    textSecondary: '#718078',
    primary: '#087F5B',
    primaryDark: '#066648',
    border: '#E4EAE6',
    warning: '#F4A340',
    danger: '#D94F4F',
  },
  dark: {
    text: '#F1F6F3',
    background: '#101713',
    backgroundElement: '#19231D',
    backgroundSelected: '#20382C',
    textSecondary: '#A4B3AA',
    primary: '#39B887',
    primaryDark: '#168A61',
    border: '#2B3931',
    warning: '#F4B552',
    danger: '#F07A7A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const Brand = {
  name: 'درب',
  tagline: 'رحلتك تبدأ بخطوة',
  currency: 'ر.س',
} as const;
