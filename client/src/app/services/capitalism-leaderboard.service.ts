import { Injectable, signal } from '@angular/core';

export interface CapitalismResult {
  id: string;
  timestamp: number;
  score: number;
  timeLabel: string;
  timeSeconds: number;
}

@Injectable({ providedIn: 'root' })
export class CapitalismLeaderboardService {
  private readonly KEY = 'gg_capitalism_leaderboard_v1';

  private state = signal<CapitalismResult[]>(this.load());

  results(): CapitalismResult[] {
    const list = [...this.state()];
    list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeSeconds - b.timeSeconds;
    });
    return list;
  }

  top(n: number): CapitalismResult[] {
    return this.results().slice(0, n);
  }

  record(data: Omit<CapitalismResult, 'id'>): void {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const entry: CapitalismResult = { id, ...data };
    const next = [entry, ...this.state()];
    this.state.set(next);
    this.save(next);
  }

  clear(): void {
    this.state.set([]);
    this.save([]);
  }

  private load(): CapitalismResult[] {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return [];
      return JSON.parse(raw) as CapitalismResult[];
    } catch {
      return [];
    }
  }

  private save(list: CapitalismResult[]): void {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(list));
    } catch {}
  }
}
