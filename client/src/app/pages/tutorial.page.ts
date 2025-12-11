import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';

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
        gap: 16px;
      }

      h1 {
        margin: 0;
        font-size: 26px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .subtitle {
        margin: 4px 0 0 0;
        font-size: 14px;
        opacity: 0.85;
      }

      h2 {
        margin: 12px 0 6px;
        font-size: 18px;
      }

      p {
        margin: 4px 0;
        font-size: 14px;
        line-height: 1.5;
        opacity: 0.92;
      }

      ul {
        margin: 4px 0 0 18px;
        padding: 0;
        font-size: 14px;
        line-height: 1.5;
        opacity: 0.9;
      }

      li + li {
        margin-top: 4px;
      }

      .pillRow {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        font-size: 13px;
      }

      .pill {
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.45);
        background: rgba(15, 23, 42, 0.9);
      }

      .footerRow {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
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

      .btn:active {
        transform: translateY(1px);
      }

      @media (max-width: 640px) {
        .panel {
          padding: 18px 12px;
        }
      }
    `,
  ],
  template: `
    <main>
      <div class="panel">
        <header>
          <h1>Tutorial</h1>
          <p class="subtitle">
            How the game works and what the buttons do.
          </p>
        </header>

        <section>
          <h2>Goal of the game</h2>
          <p>
            You see a random location in Google Street View. Your goal is to guess
            where in the world it is by placing a marker on the small map.
          </p>
        </section>

        <section>
          <h2>Basic flow</h2>
          <ul>
            <li>The game has a fixed number of rounds (set in Settings).</li>
            <li>Each round you get a new Street View panorama.</li>
            <li>You can look around, move on the road (if Street View allows it),
                and search for clues: language, road signs, landscape, etc.</li>
            <li>When you have an idea, click on the small map to place your guess.</li>
            <li>Press <strong>Submit guess</strong> before the timer reaches zero.</li>
          </ul>
        </section>

        <section>
          <h2>Scoring</h2>
          <ul>
            <li>After you submit, the game shows:
              <ul>
                <li>Your guess (blue marker).</li>
                <li>The correct location (green marker).</li>
                <li>A line between them and the distance in kilometers.</li>
              </ul>
            </li>
            <li>Points are higher when your guess is closer to the true location.</li>
            <li>If you do not place a guess before the time ends, you get 0 points for that round.</li>
            <li>Your total score is the sum of all round points.</li>
          </ul>
        </section>

        <section>
          <h2>Regions / game modes</h2>
          <ul>
            <li><strong>Big cities</strong> – world capitals and major cities. Easier to recognise.</li>
            <li><strong>World</strong> – locations from anywhere on Earth with Street View coverage.</li>
            <li><strong>Europe</strong> – locations roughly within Europe.</li>
          </ul>
          <p>
            You pick the region on the main menu before starting the game.
          </p>
        </section>

        <section>
          <h2>Timer and settings</h2>
          <ul>
            <li>You can change:
              <ul>
                <li>Rounds per game</li>
                <li>Seconds per round</li>
                <li>Background music (on/off and volume)</li>
              </ul>
            </li>
            <li>All of these are stored locally in your browser.</li>
          </ul>

          <div class="pillRow">
            <div class="pill">⏱ Adjust time and rounds in Settings.</div>
            <div class="pill">🎵 Music can be muted or turned down there as well.</div>
          </div>
        </section>

        <section>
          <h2>Tips for better guesses</h2>
          <ul>
            <li>Look at road signs, languages, and alphabets.</li>
            <li>Check which side of the road cars drive on.</li>
            <li>Notice vegetation, climate, and road markings.</li>
            <li>In city mode, search for famous monuments or building styles.</li>
          </ul>
        </section>

        <div class="footerRow">
          <button class="btn" type="button" (click)="back()">
            ← Back to menu
          </button>

          <button class="btn primary" type="button" (click)="startGame()">
            ▶ Start a game
          </button>
        </div>
      </div>
    </main>
  `,
})
export class TutorialPage {
  constructor(private router: Router, private game: GameService) {}

  back(): void {
    this.router.navigateByUrl('/');
  }

  startGame(): void {
    this.game.reset();
    this.router.navigateByUrl('/play');
  }
}
