import { Injectable, signal, computed } from '@angular/core';
import { SettingsService } from './settings.service';

export type RoundResult = {
  round: number;
  panoId: string;
  trueLat: number;
  trueLng: number;
  guessLat: number;
  guessLng: number;
  distanceKm: number;
  points: number;
};

@Injectable({ providedIn: 'root' })
export class GameService {
  round = signal(1);
  score = signal(0);
  results = signal<RoundResult[]>([]);

  constructor(private settings: SettingsService) {}

  get totalRounds(): number {
    return this.settings.rounds();
  }

  finished = computed(() => this.round() > this.totalRounds);

  reset(): void {
    this.round.set(1);
    this.score.set(0);
    this.results.set([]);
  }

  addRound(r: Omit<RoundResult, 'round'>): void {
    const rr: RoundResult = { round: this.round(), ...r };
    this.results.set([...this.results(), rr]);
    this.score.set(this.score() + rr.points);
    this.round.set(this.round() + 1);
  }
}
