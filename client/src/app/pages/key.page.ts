import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { KeyService } from '../services/key.service';

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
        background: radial-gradient(circle at top, #1f2937 0, #020617 52%, #000 100%);
        color: #e5e7eb;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .card {
        width: 100%;
        max-width: 960px;
        background: rgba(15, 23, 42, 0.96);
        border-radius: 24px;
        padding: 24px 20px 22px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
        border: 1px solid rgba(148, 163, 184, 0.3);
        display: grid;
        gap: 18px;
      }

      h1 {
        margin: 0;
        font-size: 30px;
        letter-spacing: 0.06em;
      }

      .subtitle {
        margin: 6px 0 0 0;
        font-size: 14px;
        opacity: 0.9;
      }

      .layout {
        display: grid;
        grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
        gap: 18px;
        align-items: flex-start;
      }

      @media (max-width: 800px) {
        .layout {
          grid-template-columns: minmax(0, 1fr);
        }
      }

      .inputGroup {
        display: grid;
        gap: 10px;
      }

      label {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .keyInput {
        width: 100%;
        border-radius: 999px;
        padding: 12px 16px;
        border: 1px solid rgba(209, 213, 219, 0.7);
        background: rgba(15, 23, 42, 0.9);
        color: #e5e7eb;
        font-size: 15px;
        outline: none;
      }

      .keyInput::placeholder {
        color: rgba(156, 163, 175, 0.9);
      }

      .keyInput:focus {
        border-color: rgba(56, 189, 248, 0.95);
        box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.5);
      }

      .buttonsRow {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 8px;
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

      .btn.ghost {
        border-color: transparent;
        background: rgba(15, 23, 42, 0.7);
      }

      .btn:active {
        transform: translateY(1px);
      }

      .msg {
        margin-top: 6px;
        font-size: 13px;
        opacity: 0.9;
      }

      .msg.ok {
        color: #bbf7d0;
      }

      .msg.error {
        color: #fecaca;
      }

      .hintBox {
        border-radius: 18px;
        padding: 12px 12px 10px;
        background: radial-gradient(
          circle at top left,
          rgba(56, 189, 248, 0.15),
          rgba(15, 23, 42, 0.95)
        );
        border: 1px solid rgba(56, 189, 248, 0.35);
        font-size: 13px;
        line-height: 1.5;
      }

      .hintBox h2 {
        margin: 0 0 6px;
        font-size: 15px;
      }

      .hintBox ol {
        margin: 0 0 6px 18px;
        padding: 0;
      }

      .hintBox li + li {
        margin-top: 4px;
      }

      .hintBox .note {
        opacity: 0.85;
        font-size: 12px;
      }
    `,
  ],
  template: `
    <main>
      <div class="card">
        <header>
          <h1>Google API key</h1>
          <p class="subtitle">
            This key is only stored in your browser and is used to load Google Maps / Street View
            for the game.
          </p>
        </header>

        <div class="layout">
          <!-- Left: input and buttons -->
          <section class="inputGroup">
            <div>
              <label for="apiKey">Paste your Google Maps JavaScript API key</label>
              <input
                id="apiKey"
                class="keyInput"
                type="password"
                [(ngModel)]="key"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
                placeholder="Paste your Google Maps API key here…"
              />
            </div>

            <div class="buttonsRow">
              <button class="btn primary" type="button" (click)="save()">
                Save &amp; Continue
              </button>

              <button class="btn" type="button" (click)="clear()">Clear</button>

              <button class="btn ghost" type="button" (click)="back()">Back</button>
            </div>

            <div class="msg" [ngClass]="{ ok: msgKind === 'ok', error: msgKind === 'error' }">
              {{ msg }}
            </div>
          </section>

          <!-- Right: short tutorial -->
          <section class="hintBox">
            <h2>How to get an API key (short version)</h2>
            <ol>
              <li>Go to the <strong>Google Cloud Console</strong>.</li>
              <li>Create a project (or select an existing one).</li>
              <li>
                Enable the <strong>Maps JavaScript API</strong> and <strong>Street View</strong>.
              </li>
              <li>Go to <em>APIs &amp; Services → Credentials</em> and create an API key.</li>
              <li>Copy the generated key and paste it into the field on the left.</li>
            </ol>
            <p class="note">
              Tip: in the Google Cloud Console you can (and should) restrict the key to your local
              development and the Maps JavaScript API for safety.
            </p>
          </section>
        </div>
      </div>
    </main>
  `,
})
export class KeyPage implements OnInit {
  key = '';
  msg = '';
  msgKind: 'ok' | 'error' | '' = '';

  constructor(private keys: KeyService, private router: Router) {}

  ngOnInit(): void {
    this.key = this.keys.get() ?? '';
  }

  save(): void {
    const k = (this.key ?? '').trim();
    if (!k) {
      this.msg = 'Please paste a valid API key first.';
      this.msgKind = 'error';
      return;
    }

    this.keys.set(k);
    this.msg = 'Key saved. You can start the game from the main menu.';
    this.msgKind = 'ok';

    setTimeout(() => {
      this.router.navigateByUrl('/');
    }, 300);
  }

  clear(): void {
    this.keys.clear();
    this.key = '';
    this.msg = 'Key cleared.';
    this.msgKind = 'ok';
  }

  back(): void {
    this.router.navigateByUrl('/');
  }
}
