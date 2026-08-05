import { Component, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, Radius } from '@/constants/theme';
import { captureException } from '@/lib/monitoring';

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Uygulama genelinde render hatalarını yakalar; beyaz ekran/çökme yerine
 * kurtarma ekranı gösterir ve hatayı izleme katmanına bildirir.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    captureException(error, { componentStack: info.componentStack });
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>😕</Text>
        <Text style={styles.title}>Bir şeyler ters gitti</Text>
        <Text style={styles.text}>
          Beklenmedik bir hata oluştu. Tekrar denemek için aşağıdaki düğmeye dokun.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={this.handleRetry}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>Tekrar dene</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: Palette.background,
  },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: Palette.text, textAlign: 'center' },
  text: {
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  button: {
    marginTop: 24,
    backgroundColor: Palette.primary,
    borderRadius: Radius.large,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  buttonPressed: { opacity: 0.75 },
  buttonText: { color: Palette.white, fontSize: 16, fontWeight: '700' },
});
