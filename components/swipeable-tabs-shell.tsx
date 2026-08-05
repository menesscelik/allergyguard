import { router, usePathname } from 'expo-router';
import { type ReactNode, useCallback, useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const TAB_PATHS = ['/', '/test', '/family', '/reminders', '/profile'] as const;
const SCREEN_WIDTH = Dimensions.get('window').width;
// Yeni sekme bu kadar içeriden kayarak gelir ("hafif" his için tam ekran değil).
const SLIDE_IN_OFFSET = SCREEN_WIDTH * 0.35;

function normalizePath(pathname: string) {
  return pathname.replace(/\/$/, '') || '/';
}

export function SwipeableTabsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const normalizedPath = normalizePath(pathname);
  const currentIndex = TAB_PATHS.indexOf(normalizedPath as (typeof TAB_PATHS)[number]);
  const isTabRoute = currentIndex >= 0;
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= TAB_PATHS.length - 1;

  const translateX = useSharedValue(0);

  const navigateBySwipe = useCallback(
    (direction: 'next' | 'previous') => {
      if (!isTabRoute) {
        return;
      }

      const nextIndex =
        direction === 'next'
          ? Math.min(currentIndex + 1, TAB_PATHS.length - 1)
          : Math.max(currentIndex - 1, 0);

      if (nextIndex !== currentIndex) {
        router.navigate(TAB_PATHS[nextIndex] as never);
      }
    },
    [currentIndex, isTabRoute],
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isTabRoute)
        .activeOffsetX([-24, 24])
        .failOffsetY([-24, 24])
        .onUpdate((event) => {
          'worklet';
          const goingNext = event.translationX < 0;
          const blocked = (goingNext && isLast) || (!goingNext && isFirst);
          // Kenardaysa daha fazla direnç (rubber-band), değilse parmağı yumuşak takip.
          const factor = blocked ? 0.12 : 0.35;
          translateX.value = event.translationX * factor;
        })
        .onEnd((event) => {
          'worklet';
          const isIntentionalSwipe =
            Math.abs(event.translationX) > 72 || Math.abs(event.velocityX) > 720;
          const goingNext = event.translationX < 0;
          const blocked = (goingNext && isLast) || (!goingNext && isFirst);

          if (isIntentionalSwipe && !blocked) {
            runOnJS(navigateBySwipe)(goingNext ? 'next' : 'previous');
            // Yeni ekran, gidilen yönün tersinden içeri kayarak gelsin.
            translateX.value = (goingNext ? 1 : -1) * SLIDE_IN_OFFSET;
            translateX.value = withTiming(0, {
              duration: 240,
              easing: Easing.out(Easing.cubic),
            });
          } else {
            translateX.value = withTiming(0, {
              duration: 200,
              easing: Easing.out(Easing.cubic),
            });
          }
        }),
    [isTabRoute, isFirst, isLast, navigateBySwipe, translateX],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
