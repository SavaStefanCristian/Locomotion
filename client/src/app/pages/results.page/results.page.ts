import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { GameService } from '../../services/game.service';
import { SettingsService, Region } from '../../services/settings.service';
import { LeaderboardService, GameResult } from '../../services/leaderboard.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.page.html',
  styleUrl: './results.page.scss'
})
export class ResultsPage implements OnInit {
  score = 0;
  rounds = 0;
  secondsPerRound = 0;
  region: Region = 'world';
  timestamp = 0;

  top: GameResult[] = [];

  constructor(
    private router: Router,
    private game: GameService,
    private settings: SettingsService,
    private lb: LeaderboardService
  ) {}

  ngOnInit(): void {
    this.score = this.game.score();
    this.rounds = this.settings.rounds();
    this.secondsPerRound = this.settings.secondsPerRound();
    this.region = this.settings.region();
    this.timestamp = Date.now();

    this.lb.record({
      timestamp: this.timestamp,
      score: this.score,
      rounds: this.rounds,
      secondsPerRound: this.secondsPerRound,
      region: this.region,
    });

    this.top = this.lb.top(10);
  }

  playAgain(): void {
    this.game.reset();
    this.router.navigateByUrl('/play');
  }

  backHome(): void {
    this.router.navigateByUrl('/');
  }

  clearLeaderboard(): void {
    this.lb.clear();
    this.top = [];
  }

  regionLabel(r: Region): string {
    switch (r) {
      case 'capitals':
        return 'Big cities / capitals';
      case 'europe':
        return 'Europe';
      case 'world':
      default:
        return 'World';
    }
  }

  formatDate(ts: number): string {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return '';
    }
  }
}
