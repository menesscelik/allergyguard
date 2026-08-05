import { useEffect, useRef, useState } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

type Props = {
  value: number;
  style?: StyleProp<TextStyle>;
  prefix?: string;
  suffix?: string;
  duration?: number;
};

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Sayıyı hedefe doğru yumuşakça artıran metin (JS/rAF tabanlı — worklet yok).
 */
export function AnimatedCounter({ value, style, prefix = '', suffix = '', duration = 700 }: Props) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = 0;
    const start = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      setDisplay(Math.round(from + (value - from) * easeOut(p)));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    tick();
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return (
    <Text style={style}>
      {prefix}
      {display}
      {suffix}
    </Text>
  );
}
