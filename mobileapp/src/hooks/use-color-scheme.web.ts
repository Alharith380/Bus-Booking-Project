import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const subscribe = () => () => {};

export function useColorScheme() {
  const colorScheme = useRNColorScheme();

  return useSyncExternalStore(
    subscribe,
    () => colorScheme ?? 'light',
    () => 'light',
  );
}
