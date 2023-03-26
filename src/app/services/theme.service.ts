import { Injectable } from '@angular/core';
import { Store } from 'tauri-plugin-store-api';
import { SETTINGS_FILE } from '../globals';

type ThemingMode = 'SYSTEM' | 'LIGHT' | 'DARK';

interface ThemingSettings {
  mode: ThemingMode;
}

const THEMING_SETTINGS_DEFAULT: ThemingSettings = {
  mode: 'DARK',
};
const SETTINGS_KEY_THEMING_SETTINGS = 'THEMING_SETTINGS';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private store = new Store(SETTINGS_FILE);
  private _settings: ThemingSettings = { ...THEMING_SETTINGS_DEFAULT };
  public get settings(): ThemingSettings {
    return { ...this._settings };
  }

  public async init() {
    await this.loadSettings();
    this.applyTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this._settings.mode === 'SYSTEM') this.applyTheme();
    });
  }

  public async setMode(mode: ThemingMode): Promise<void> {
    this._settings.mode = mode;
    await this.saveSettings();
    await this.applyTheme();
  }

  private applyTheme() {
    let darkMode: boolean;
    switch (this._settings.mode) {
      case 'SYSTEM':
        darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        break;
      case 'LIGHT':
        darkMode = false;
        break;
      case 'DARK':
        darkMode = true;
        break;
    }
    if (darkMode) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }

  private async loadSettings() {
    const settings: ThemingSettings | null = await this.store.get<ThemingSettings>(
      SETTINGS_KEY_THEMING_SETTINGS
    );
    if (settings) {
      this._settings = { ...settings };
    } else {
      await this.saveSettings();
    }
  }

  private async saveSettings() {
    await this.store.set(SETTINGS_KEY_THEMING_SETTINGS, this.settings);
    await this.store.save();
  }
}
