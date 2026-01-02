import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tutorial.page.html',
  styleUrl: './tutorial.page.scss'
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
