import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SettingsService } from '../services/settings.service';
import { MusicService } from '../services/music.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      main {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 24px 12px;
        box-sizing: border-box;
        background: radial-gradient(circle at top, #1f2933 0, #020617 52%, #000 100%);
        color: #e5e7eb;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .panel {
        width: 100%;
        max-width: 720px;
        background: rgba(15, 23, 42, 0.96);
        border-radius: 20px;
        padding: 20px 18px;
        box-shadow: 0 18px 45px rgba(0, 0, 0, 0.6);
        border: 1px solid rgba(148, 163, 184, 0.18);
        display: grid;
        gap: 18px;
      }

      h1 {
        margin: 0;
        font-size: 24px;
        letter-spacing: 0.04em;
      }

      .subtitle {
        margin: 0;
        opacity: 0.8;
        font-size: 14px;
      }

      .section {
        padding: 14px 12px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.2);
        display: grid;
        gap: 10px;
      }

      .sectionTitle {
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        opacity: 0.9;
      }

      .fieldRow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      label {
        font-size: 14px;
        opacity: 0.9;
      }

      input[type='number'],
      input[type='range'] {
        font: inherit;
      }

      .numberInput {
        min-width: 120px;
        padding: 6px 8px;
        border-radius: 8px;
        border: 1px solid rgba(148, 163, 184, 0.4);
        background: rgba(15, 23, 42, 0.9);
        color: #e5e7eb;
        outline: none;
      }

      .numberInput:focus {
        border-color: rgba(56, 189, 248, 0.8);
        box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.4);
      }

      .hint {
        font-size: 12px;
        opacity: 0.7;
        margin-top: 4px;
      }

      .musicRow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }

      .musicControls {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .rangeWrap {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .rangeLabel {
        font-size: 12px;
        opacity: 0.75;
      }

      input[type='range'] {
        width: 150px;
      }

      .footerRow {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
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
        border-color: rgba(56, 189, 248, 0.9);
        background: radial-gradient(circle at top left, #0ea5e9, #0369a1);
        color: #f9fafb;
      }

      .btn.danger {
        border-color: rgba(248, 113, 113, 0.8);
        color: #fecaca;
      }

      .btn.ghost {
        border-color: transparent;
        background: transparent;
        opacity: 0.8;
      }

      .btn:active {
        transform: translateY(1px);
      }

      .msg {
        font-size: 13px;
        opacity: 0.85;
      }

      .msg.ok {
        color: #bbf7d0;
      }

      .msg.warn {
        color: #fed7aa;
      }

      @media (max-width: 600px) {
        .panel {
          padding: 16px 12px;
        }

        input[type='range'] {
          width: 120px;
        }
      }
    `,
  ],
  template: `
    <main>
      <div class="panel">
        <div>
          <h1>Settings</h1>
          <p class="subtitle">Adjust game length and music. Region is chosen on the main menu.</p>
        </div>

        <!-- Game section -->
        <section class="section">
          <div class="sectionTitle">Game</div>

          <div class="fieldRow">
            <label for="rounds">Rounds per game</label>
            <div>
              <input
                id="rounds"
                type="number"
                class="numberInput"
                [(ngModel)]="rounds"
                min="1"
                max="20"
              />
              <div class="hint">Between 1 and 20.</div>
            </div>
          </div>

          <div class="fieldRow">
            <label for="seconds">Seconds per round</label>
            <div>
              <input
                id="seconds"
                type="number"
                class="numberInput"
                [(ngModel)]="secondsPerRound"
                min="30"
                max="300"
                step="10"
              />
              <div class="hint">Between 30 and 300 seconds.</div>
            </div>
          </div>
        </section>

        <!-- Music section -->
        <section class="section">
          <div class="sectionTitle">Music</div>

          <div class="musicRow">
            <div class="musicControls">
              <button class="btn" type="button" (click)="toggleMusic()">
                {{ music.enabled() ? 'Music: On' : 'Music: Off' }}
              </button>
            </div>

            <div class="rangeWrap">
              <span class="rangeLabel">
                Volume (current: {{ music.volume() * 100 | number : '1.0-0' }}%)
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                [ngModel]="music.volume()"
                (ngModelChange)="onVolumeChange($event)"
                [disabled]="!music.enabled()"
              />
            </div>
          </div>

          <div class="hint">Changes are saved locally on this device.</div>
        </section>

        <!-- Footer -->
        <div class="footerRow">
          <div style="display:flex; gap:8px; align-items:center;">
            <button class="btn ghost" type="button" (click)="back()">← Back</button>
            <button class="btn danger" type="button" (click)="reset()">Reset defaults</button>
          </div>

          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
            <button class="btn primary" type="button" (click)="save()">Save</button>
            <div class="msg" [ngClass]="{ ok: msgKind === 'ok', warn: msgKind === 'warn' }">
              {{ msg }}
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
})
export class SettingsPage {
  rounds = 5;
  secondsPerRound = 90;

  msg = '';
  msgKind: 'ok' | 'warn' | '' = '';

  constructor(
    private settings: SettingsService,
    public music: MusicService,
    private router: Router
  ) {
    const v = this.settings.value;
    this.rounds = v.rounds;
    this.secondsPerRound = v.secondsPerRound;
  }

  save(): void {
    this.settings.setAll({
      rounds: this.rounds,
      secondsPerRound: this.secondsPerRound,
    });

    this.msg = 'Settings saved.';
    this.msgKind = 'ok';
  }

  reset(): void {
    this.settings.resetDefaults();
    const v = this.settings.value;
    this.rounds = v.rounds;
    this.secondsPerRound = v.secondsPerRound;

    this.msg = 'Defaults restored.';
    this.msgKind = 'warn';
  }

  toggleMusic(): void {
    if (this.music.enabled()) this.music.disable();
    else this.music.enable();
  }

  onVolumeChange(v: number): void {
    this.music.setVolume(Number(v));
  }

  back(): void {
    this.router.navigateByUrl('/');
  }
}
