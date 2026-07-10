import { Injectable, signal } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';

const HAPTICS_KEY = 'jublia_dex_haptics';

@Injectable({ providedIn: 'root' })
export class HapticsService {
  private readonly enabled = signal(true);

  async init(): Promise<void> {
    const { value } = await Preferences.get({ key: HAPTICS_KEY });
    if (value !== null) {
      this.enabled.set(value === 'true');
    }
  }

  isEnabled(): boolean {
    return this.enabled();
  }

  async setEnabled(enabled: boolean): Promise<void> {
    this.enabled.set(enabled);
    await Preferences.set({ key: HAPTICS_KEY, value: String(enabled) });
  }

  async lightImpact(): Promise<void> {
    if (!this.enabled()) {
      return;
    }
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // No-op on web or unsupported platforms.
    }
  }

  async selectionChanged(): Promise<void> {
    if (!this.enabled()) {
      return;
    }
    try {
      await Haptics.selectionChanged();
    } catch {
      // No-op on web or unsupported platforms.
    }
  }
}
