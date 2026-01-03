import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { GameService } from '../../services/game.service';
import { SettingsService, Region } from '../../services/settings.service';
import { MusicService } from '../../services/music.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss'
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

  playConquest(): void {
    this.router.navigateByUrl('/conquest');
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
