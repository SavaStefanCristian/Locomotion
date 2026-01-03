import { Injectable, signal } from '@angular/core';

export interface ConquestResult {
  id: string;
  timestamp: number;
  score: number;
  timeLabel: string; // "14:23"
  timeSeconds: number; // for sorting
}

@Injectable({ providedIn: 'root' })
export class ConquestLeaderboardService {
  private readonly KEY = 'gg_conquest_leaderboard_v1';

  private state = signal<ConquestResult[]>(this.load());

  results(): ConquestResult[] {
    const list = [...this.state()];
    // Sort by Score (Desc), then Time (Asc)
    list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeSeconds - b.timeSeconds;
    });
    return list;
  }

  top(n: number): ConquestResult[] {
    return this.results().slice(0, n);
  }

  record(data: Omit<ConquestResult, 'id'>): void {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const entry: ConquestResult = { id, ...data };
    const next = [entry, ...this.state()];
    this.state.set(next);
    this.save(next);
  }

  clear(): void {
    this.state.set([]);
    this.save([]);
  }

  private load(): ConquestResult[] {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return [];
      return JSON.parse(raw) as ConquestResult[];
    } catch {
      return [];
    }
  }

  private save(list: ConquestResult[]): void {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(list));
    } catch {}
  }
}
