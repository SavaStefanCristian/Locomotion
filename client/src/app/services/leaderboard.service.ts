import { Injectable, signal } from '@angular/core';
import { Region } from './settings.service';

export interface GameResult {
  id: string;
  timestamp: number;
  score: number;
  rounds: number;
  secondsPerRound: number;
  region: Region;
}

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private readonly KEY = 'gg_leaderboard_v1';

  private state = signal<GameResult[]>(this.load());

  results(): GameResult[] {
    const list = [...this.state()];
    list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.timestamp - a.timestamp;
    });
    return list;
  }

  top(n: number): GameResult[] {
    return this.results().slice(0, n);
  }

  record(data: Omit<GameResult, 'id'>): void {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const entry: GameResult = { id, ...data };
    const next = [entry, ...this.state()];
    this.state.set(next);
    this.save(next);
  }

  clear(): void {
    this.state.set([]);
    this.save([]);
  }

  private load(): GameResult[] {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as any[];
      if (!Array.isArray(parsed)) return [];
      return parsed.map((x) => this.coerce(x)).filter((x): x is GameResult => x !== null);
    } catch {
      return [];
    }
  }

  private save(list: GameResult[]): void {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(list));
    } catch {}
  }

  private coerce(x: any): GameResult | null {
    if (!x || typeof x !== 'object') return null;

    const score = Number(x.score);
    const rounds = Number(x.rounds);
    const seconds = Number(x.secondsPerRound);
    const ts = Number(x.timestamp);
    const region = x.region as Region;

    if (!Number.isFinite(score) || !Number.isFinite(rounds) || !Number.isFinite(seconds)) {
      return null;
    }
    if (!Number.isFinite(ts)) return null;
    if (region !== 'world' && region !== 'europe' && region !== 'capitals') {
      return null;
    }

    return {
      id: typeof x.id === 'string' ? x.id : `${ts}_${Math.random().toString(36).slice(2, 8)}`,
      score,
      rounds,
      secondsPerRound: seconds,
      timestamp: ts,
      region,
    };
  }
}
