import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const shortest = Math.min(width, height);
    const isCompact = width < 375;
    const isShort = height < 720;
    const isWide = width >= 430;
    const pagePadding = Math.round(clamp(shortest * 0.05, 16, 24));
    const cardGap = Math.round(clamp(shortest * 0.025, 8, 14));
    const heroPadding = Math.round(clamp(shortest * 0.052, 16, 22));
    const titleSize = Math.round(clamp(width * 0.072, 24, 32));
    const largeTitleSize = Math.round(clamp(width * 0.088, 30, 40));
    const badgeSize = Math.round(clamp(width * 0.13, 46, 62));
    const contentMaxWidth = Math.min(width - pagePadding * 2, 560);

    return {
      width,
      height,
      isCompact,
      isShort,
      isWide,
      pagePadding,
      cardGap,
      heroPadding,
      titleSize,
      largeTitleSize,
      badgeSize,
      contentMaxWidth,
      centerContent: {
        width: '100%' as const,
        maxWidth: contentMaxWidth,
        alignSelf: 'center' as const,
      },
    };
  }, [width, height]);
}
