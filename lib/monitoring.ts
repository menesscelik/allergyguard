// Hafif izleme katmanı.
//
// @sentry/react-native kurulu ve EXPO_PUBLIC_SENTRY_DSN tanımlıysa gerçek Sentry'yi
// kullanır; değilse konsola düşer. Böylece paket kurulmadan da uygulama derlenir/çalışır.
//
// Kurulum:
//   npx expo install @sentry/react-native
//   .env -> EXPO_PUBLIC_SENTRY_DSN=...
// (kurduktan sonra app.config / plugin adımları için Sentry dokümanına bak.)

type SentryLike = {
  init: (options: Record<string, unknown>) => void;
  captureException: (error: unknown) => void;
};

let sentry: SentryLike | null = null;

export function initMonitoring() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@sentry/react-native') as SentryLike;
    mod.init({
      dsn,
      // Sürüm bazlı izleme; production'da örnekleme oranını düşürebilirsin.
      tracesSampleRate: 0.2,
      enableAutoSessionTracking: true,
    });
    sentry = mod;
  } catch {
    sentry = null;
  }
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (sentry) {
    sentry.captureException(error);
    return;
  }
  if (__DEV__) {
    console.error('[monitoring]', error, context ?? '');
  }
}
