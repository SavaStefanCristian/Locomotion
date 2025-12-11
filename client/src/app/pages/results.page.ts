import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { GameService } from '../services/game.service';
import { SettingsService, Region } from '../services/settings.service';
import { LeaderboardService, GameResult } from '../services/leaderboard.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      main {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 24px 12px;
        box-sizing: border-box;
        background: radial-gradient(circle at top, #1f2937 0, #020617 52%, #000 100%);
        color: #e5e7eb;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .panel {
        width: 100%;
        max-width: 820px;
        background: rgba(15, 23, 42, 0.96);
        border-radius: 22px;
        padding: 22px 18px;
        box-shadow: 0 20px 48px rgba(0, 0, 0, 0.65);
        border: 1px solid rgba(148, 163, 184, 0.24);
        display: grid;
        gap: 18px;
      }

      h1 {
        margin: 0;
        font-size: 26px;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .subtitle {
        margin: 2px 0 0 0;
        font-size: 14px;
        opacity: 0.85;
      }

      .summaryRow {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .pill {
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.4);
        font-size: 13px;
        background: rgba(15, 23, 42, 0.85);
      }

      .pill strong {
        font-weight: 700;
      }

      .scoreBadge {
        font-size: 30px;
        font-weight: 800;
        letter-spacing: 0.06em;
      }

      .sectionTitle {
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        opacity: 0.9;
        margin-bottom: 6px;
      }

      .section {
        padding: 12px 10px;
        border-radius: 16px;
        background: rgba(15, 23, 42, 0.96);
        border: 1px solid rgba(148, 163, 184, 0.2);
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }

      th,
      td {
        padding: 6px 8px;
        text-align: left;
        white-space: nowrap;
      }

      th {
        font-weight: 600;
        opacity: 0.85;
        border-bottom: 1px solid rgba(148, 163, 184, 0.3);
      }

      td {
        border-bottom: 1px solid rgba(30, 41, 59, 0.7);
      }

      tr:last-child td {
        border-bottom: none;
      }

      .muted {
        opacity: 0.7;
        font-size: 12px;
      }

      .footerRow {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 10px;
      }

      .btn {
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.7);
        background: rgba(15, 23, 42, 0.9);
        color: #e5e7eb;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .btn.primary {
        border-color: rgba(56, 189, 248, 0.95);
        background: radial-gradient(circle at top left, #0ea5e9, #0369a1);
        color: #f9fafb;
      }

      .btn.danger {
        border-color: rgba(248, 113, 113, 0.85);
        color: #fecaca;
      }

      .btn.ghost {
        border-color: transparent;
        background: transparent;
        opacity: 0.85;
      }

      .btn:active {
        transform: translateY(1px);
      }

      @media (max-width: 640px) {
        .panel {
          padding: 18px 12px;
        }

        table {
          font-size: 12px;
        }

        th,
        td {
          padding: 4px 6px;
        }
      }
    `,
  ],
  template: `
    <main>
      <div class="panel">
        <header>
          <h1>Results</h1>
          <p class="subtitle">
            Game finished. Here is your score and the high scores on this device.
          </p>
        </header>

        <!-- This game summary -->
        <section class="section">
          <div class="sectionTitle">This game</div>

          <div class="summaryRow">
            <div class="pill">
              Score:
              <span class="scoreBadge">{{ score }}</span>
            </div>
            <div class="pill">
              Rounds:
              <strong>{{ rounds }}</strong>
            </div>
            <div class="pill">
              Time per round:
              <strong>{{ secondsPerRound }}s</strong>
            </div>
            <div class="pill">
              Region:
              <strong>{{ regionLabel(region) }}</strong>
            </div>
          </div>

          <p class="muted" style="margin-top:8px;">Recorded at {{ formatDate(timestamp) }}.</p>
        </section>

        <!-- Leaderboard -->
        <section class="section">
          <div class="sectionTitle">High scores (this browser)</div>

          <ng-container *ngIf="top && top.length > 0; else noScores">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Score</th>
                  <th>Region</th>
                  <th>Rounds</th>
                  <th>Time/round</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of top; index as i">
                  <td>{{ i + 1 }}</td>
                  <td>{{ r.score }}</td>
                  <td>{{ regionLabel(r.region) }}</td>
                  <td>{{ r.rounds }}</td>
                  <td>{{ r.secondsPerRound }}s</td>
                  <td class="muted">{{ formatDate(r.timestamp) }}</td>
                </tr>
              </tbody>
            </table>

            <p class="muted" style="margin-top:6px;">
              Scores are stored locally in your browser (no server).
            </p>
          </ng-container>

          <ng-template #noScores>
            <p class="muted">No previous scores yet. Finish a game to build your leaderboard.</p>
          </ng-template>
        </section>

        <!-- Footer buttons -->
        <div class="footerRow">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn primary" type="button" (click)="playAgain()">▶ Play again</button>
            <button class="btn ghost" type="button" (click)="backHome()">← Back to menu</button>
          </div>

          <button class="btn danger" type="button" (click)="clearLeaderboard()">
            Clear high scores
          </button>
        </div>
      </div>
    </main>
  `,
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
