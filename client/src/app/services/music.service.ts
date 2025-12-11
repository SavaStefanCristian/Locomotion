import { Injectable, signal } from '@angular/core';

type MusicPrefs = { enabled: boolean; volume: number };

@Injectable({ providedIn: 'root' })
export class MusicService {
  private readonly KEY = 'gg_music_v1';
  private readonly audio = new Audio();

  enabled = signal(true);
  volume = signal(0.25);
  playing = signal(false);

  constructor() {
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.audio.src = 'assets/bgm.mp3';

    const prefs = this.load();
    this.enabled.set(prefs.enabled);
    this.volume.set(prefs.volume);
    this.audio.volume = prefs.volume;

    this.audio.addEventListener('loadstart', () =>
      console.log('[Music] loadstart', this.audio.src)
    );
    this.audio.addEventListener('loadedmetadata', () =>
      console.log('[Music] loadedmetadata duration=', this.audio.duration)
    );
    this.audio.addEventListener('canplay', () => console.log('[Music] canplay'));
    this.audio.addEventListener('canplaythrough', () => console.log('[Music] canplaythrough'));
    this.audio.addEventListener('play', () => {
      console.log('[Music] play');
      this.playing.set(true);
    });
    this.audio.addEventListener('pause', () => {
      console.log('[Music] pause');
      this.playing.set(false);
    });
    this.audio.addEventListener('error', () => {
      const err = this.audio.error;
      console.warn('[Music] ERROR event', {
        src: this.audio.src,
        code: err?.code,
        message: (err as any)?.message,
        networkState: this.audio.networkState,
        readyState: this.audio.readyState,
      });
    });
  }

  async startFromGesture(): Promise<void> {
    console.log('[Music] startFromGesture called', {
      enabled: this.enabled(),
      src: this.audio.src,
      volume: this.volume(),
      readyState: this.audio.readyState,
      networkState: this.audio.networkState,
    });

    if (!this.enabled()) return;

    try {
      this.audio.muted = false;
      this.audio.volume = this.volume();
      const p = this.audio.play();
      console.log('[Music] play() returned', p);
      await p;
      console.log('[Music] play() resolved OK');
    } catch (e) {
      console.warn('[Music] play() failed', e);
    }
  }

  stop(): void {
    try {
      this.audio.pause();
      this.audio.currentTime = 0;
    } catch {}
    this.playing.set(false);
  }

  enable(): void {
    this.enabled.set(true);
    this.save();
  }

  disable(): void {
    this.enabled.set(false);
    this.save();
    try {
      this.audio.pause();
    } catch {}
    this.playing.set(false);
  }

  setVolume(v: number): void {
    const vv = Math.max(0, Math.min(1, Number(v)));
    this.volume.set(vv);
    try {
      this.audio.volume = vv;
    } catch {}
    this.save();
  }

  private load(): MusicPrefs {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return { enabled: true, volume: 0.15 };
      const p = JSON.parse(raw) as Partial<MusicPrefs>;
      const enabled = typeof p.enabled === 'boolean' ? p.enabled : true;
      const volume =
        typeof p.volume === 'number' && isFinite(p.volume)
          ? Math.max(0, Math.min(1, p.volume))
          : 0.15;
      return { enabled, volume };
    } catch {
      return { enabled: true, volume: 0.15 };
    }
  }

  private save(): void {
    try {
      localStorage.setItem(
        this.KEY,
        JSON.stringify({ enabled: this.enabled(), volume: this.volume() })
      );
    } catch {}
  }
}
