import { Injectable, signal } from '@angular/core';

export type Region = 'world' | 'europe' | 'capitals';

export interface Settings {
  rounds: number;
  secondsPerRound: number;
  region: Region;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly KEY = 'gg_settings_v3';

  private state = signal<Settings>(this.load());

  get value(): Settings {
    return this.state();
  }

  rounds(): number {
    return this.state().rounds;
  }

  secondsPerRound(): number {
    return this.state().secondsPerRound;
  }

  region(): Region {
    return this.state().region;
  }

  setAll(opts: { rounds: number; secondsPerRound: number; region?: Region }): void {
    const current = this.state();

    const next: Settings = {
      ...current,
      rounds: this.clampRounds(opts.rounds),
      secondsPerRound: this.clampSeconds(opts.secondsPerRound),
      region: opts.region ?? current.region,
    };

    this.state.set(next);
    this.save(next);
  }

  setRegion(region: Region): void {
    const next: Settings = { ...this.state(), region };
    this.state.set(next);
    this.save(next);
  }

  resetDefaults(): void {
    const d = this.defaultSettings();
    this.state.set(d);
    this.save(d);
  }

  private defaultSettings(): Settings {
    return {
      rounds: 5,
      secondsPerRound: 90,
      region: 'world',
    };
  }

  private clampRounds(r: number): number {
    const n = Math.round(Number(r));
    if (!Number.isFinite(n)) return this.defaultSettings().rounds;
    return Math.min(20, Math.max(1, n));
  }

  private clampSeconds(s: number): number {
    const n = Math.round(Number(s));
    if (!Number.isFinite(n)) return this.defaultSettings().secondsPerRound;
    return Math.min(300, Math.max(30, n));
  }

  private load(): Settings {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this.defaultSettings();

      const obj = JSON.parse(raw) as Partial<Settings>;
      const d = this.defaultSettings();

      const rounds = typeof obj.rounds === 'number' ? this.clampRounds(obj.rounds) : d.rounds;

      const seconds =
        typeof obj.secondsPerRound === 'number'
          ? this.clampSeconds(obj.secondsPerRound)
          : d.secondsPerRound;

      const region: Region =
        obj.region === 'world' || obj.region === 'europe' || obj.region === 'capitals'
          ? obj.region
          : d.region;

      return { rounds, secondsPerRound: seconds, region };
    } catch {
      return this.defaultSettings();
    }
  }

  private save(v: Settings): void {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(v));
    } catch {}
  }
}
