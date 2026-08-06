import { Platform } from 'react-native';

import type { Reminder } from './types';

const APP_GROUP = 'group.com.menescelik.allergyguard';

// Native modülü savunmacı yükle: build'e dahil değilse (henüz prebuild yapılmadıysa)
// uygulama çökmesin, sessizce no-op olsun.
let native: { setData?: (json: string, group: string) => void } | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  native = require('../modules/allergy-widget').default;
} catch {
  native = null;
}

type Dose = { time: string; name: string };

// Aktif hatırlatıcılardan önümüzdeki 7 günün ilk 5 dozunu (yakından uzağa) hesapla.
function computeUpcoming(reminders: Reminder[]): Dose[] {
  const now = new Date();
  const items: { when: number; time: string; name: string }[] = [];

  for (let offset = 0; offset < 7; offset++) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const jsDay = date.getDay(); // 0=Paz..6=Cmt
    const ourDay = jsDay === 0 ? 7 : jsDay; // 1=Pzt..7=Paz

    for (const r of reminders) {
      if (!r.is_active) continue;
      if (!r.repeat_days?.includes(ourDay)) continue;
      const times = r.remind_times?.length ? r.remind_times : [r.remind_time];
      for (const t of times) {
        const [h, m] = t.split(':').map((n) => parseInt(n, 10));
        const when = new Date(date);
        when.setHours(h || 0, m || 0, 0, 0);
        if (when.getTime() <= now.getTime()) continue;
        items.push({ when: when.getTime(), time: t.slice(0, 5), name: r.drug_name });
      }
    }
  }

  items.sort((a, b) => a.when - b.when);
  return items.slice(0, 5).map((i) => ({ time: i.time, name: i.name }));
}

export function updateWidget(reminders: Reminder[]) {
  if (Platform.OS !== 'ios' || !native?.setData) return;
  const upcoming = computeUpcoming(reminders);
  const payload = {
    next: upcoming[0] ?? null,
    upcoming: upcoming.slice(0, 3),
    count: upcoming.length,
  };
  try {
    native.setData(JSON.stringify(payload), APP_GROUP);
  } catch {
    // yok say
  }
}
