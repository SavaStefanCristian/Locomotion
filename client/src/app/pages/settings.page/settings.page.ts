import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SettingsService } from '../../services/settings.service';
import { MusicService } from '../../services/music.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss'
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
