import { router, usePathname } from 'expo-router';
import { type ReactNode, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

const TAB_PATHS = ['/', '/test', '/history', '/reminders', '/profile'] as const;

function normalizePath(pathname: string) {
  return pathname.replace(/\/$/, '') || '/';
}

export function SwipeableTabsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const normalizedPath = normalizePath(pathname);
  const currentIndex = TAB_PATHS.indexOf(normalizedPath as (typeof TAB_PATHS)[number]);
  const isTabRoute = currentIndex >= 0;

  const navigateBySwipe = useCallback((direction: 'next' | 'previous') => {
    if (!isTabRoute) {
      return;
    }

    const nextIndex = direction === 'next'
      ? Math.min(currentIndex + 1, TAB_PATHS.length - 1)
      : Math.max(currentIndex - 1, 0);

    if (nextIndex !== currentIndex) {
      router.navigate(TAB_PATHS[nextIndex] as never);
    }
  }, [currentIndex, isTabRoute]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isTabRoute)
        .activeOffsetX([-52, 52])
        .failOffsetY([-36, 36])
        .onEnd((event) => {
          const isIntentionalSwipe = Math.abs(event.translationX) > 72 || Math.abs(event.velocityX) > 720;

          if (!isIntentionalSwipe) {
            return;
          }

          if (event.translationX < 0) {
            runOnJS(navigateBySwipe)('next');
          } else {
            runOnJS(navigateBySwipe)('previous');
          }
        }),
    [isTabRoute, navigateBySwipe],
  );

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>{children}</View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
