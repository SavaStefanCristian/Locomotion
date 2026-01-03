import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConquestLeaderboardService, ConquestResult } from '../../services/conquest-leaderboard.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conquest-results.page.html',
  styleUrls: ['./conquest-results.page.scss']
})
export class ConquestResultsPage implements OnInit {
  score = 0;
  timeLabel = '--:--';
  timestamp = 0;

  top: ConquestResult[] = [];

  constructor(
    private router: Router,
    private lb: ConquestLeaderboardService
  ) {
    const nav = this.router.currentNavigation();
    if (nav?.extras.state) {
      this.score = nav.extras.state['score'] || 0;
      this.timeLabel = nav.extras.state['timeLabel'] || '00:00';
      this.timestamp = Date.now();

      this.lb.record({
        timestamp: this.timestamp,
        score: this.score,
        timeLabel: this.timeLabel,
        timeSeconds: this.parseTime(this.timeLabel)
      });
    }
  }

  ngOnInit(): void {
    this.top = this.lb.top(10);
  }

  private parseTime(label: string): number {
    const parts = label.split(':');
    if (parts.length !== 2) return 0;
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  playAgain(): void {
    this.router.navigateByUrl('/conquest');
  }

  backHome(): void {
    this.router.navigateByUrl('/');
  }

  clearLeaderboard(): void {
    this.lb.clear();
    this.top = [];
  }

  formatDate(ts: number): string {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return '';
    }
  }
}
