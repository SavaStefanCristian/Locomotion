import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { GameService } from '../services/game.service';
import { SettingsService, Region } from '../services/settings.service';
import { MusicService } from '../services/music.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      main {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px 12px;
        box-sizing: border-box;
        background: radial-gradient(circle at top, #1f2937 0, #020617 52%, #000 100%);
        color: #e5e7eb;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .card {
        width: 100%;
        max-width: 720px;
        background: rgba(15, 23, 42, 0.96);
        border-radius: 22px;
        padding: 24px 20px;
        box-shadow: 0 22px 50px rgba(0, 0, 0, 0.7);
        border: 1px solid rgba(148, 163, 184, 0.22);
        display: grid;
        gap: 20px;
      }

      h1 {
        margin: 0;
        font-size: 26px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .sub {
        margin: 4px 0 0 0;
        font-size: 14px;
        opacity: 0.85;
      }

      .sectionTitle {
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        opacity: 0.85;
        margin-bottom: 6px;
      }

      .regionRow {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .regionBtn {
        flex: 1 1 120px;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.6);
        padding: 8px 12px;
        background: rgba(15, 23, 42, 0.9);
        color: #e5e7eb;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        text-align: left;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .regionBtn span.label {
        font-size: 13px;
      }

      .regionBtn span.desc {
        font-size: 11px;
        opacity: 0.7;
      }

      .regionBtn.active {
        border-color: rgba(56, 189, 248, 0.95);
        background: radial-gradient(circle at top left, #0ea5e9, #0369a1);
        color: #f9fafb;
      }

      .primaryRow {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        justify-content: space-between;
      }

      .btn {
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.7);
        background: rgba(15, 23, 42, 0.9);
        color: #e5e7eb;
        padding: 10px 18px;
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

      .btn.secondary {
        opacity: 0.9;
      }

      .btn:active {
        transform: translateY(1px);
      }

      .linksRow {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        font-size: 13px;
        opacity: 0.85;
      }

      .link {
        cursor: pointer;
        text-decoration: underline;
        text-decoration-style: dotted;
      }

      @media (max-width: 600px) {
        .card {
          padding: 20px 14px;
        }
      }
    `,
  ],
  template: `
    <main>
      <div class="card">
        <header>
          <h1>GeoGuessr</h1>
          <p class="sub">Guess the location from Google Street View.</p>
        </header>

        <section>
          <div class="sectionTitle">Region</div>
          <div class="regionRow">
            <button
              type="button"
              class="regionBtn"
              [class.active]="region === 'capitals'"
              (click)="chooseRegion('capitals')"
            >
              <span class="label">Big cities</span>
              <span class="desc">World capitals & major cities. Easier game.</span>
            </button>

            <button
              type="button"
              class="regionBtn"
              [class.active]="region === 'world'"
              (click)="chooseRegion('world')"
            >
              <span class="label">World</span>
              <span class="desc">Anywhere on Earth with Street View coverage.</span>
            </button>

            <button
              type="button"
              class="regionBtn"
              [class.active]="region === 'europe'"
              (click)="chooseRegion('europe')"
            >
              <span class="label">Europe</span>
              <span class="desc">Only locations roughly inside Europe.</span>
            </button>
          </div>
        </section>

        <section class="primaryRow">
          <button class="btn primary" type="button" (click)="start()">▶ Start game</button>

          <div class="linksRow">
            <span class="link" (click)="goKey()">API key</span>
            <span>·</span>
            <span class="link" (click)="goSettings()">Settings</span>
            <span>·</span>
            <span class="link" (click)="goTutorial()">Tutorial</span>
          </div>
        </section>
      </div>
    </main>
  `,
})
export class HomePage {
  region: Region = 'world';

  constructor(
    private router: Router,
    private game: GameService,
    private settings: SettingsService,
    private music: MusicService
  ) {
    this.region = this.settings.region();
  }

  chooseRegion(r: Region): void {
    this.region = r;
    this.settings.setRegion(r);
  }

  start(): void {
    this.game.reset();
    this.settings.setRegion(this.region);
    void this.music.startFromGesture();
    this.router.navigateByUrl('/play');
  }

  goKey(): void {
    this.router.navigateByUrl('/key');
  }

  goSettings(): void {
    this.router.navigateByUrl('/settings');
  }

  goTutorial(): void {
    this.router.navigateByUrl('/tutorial');
  }
}
