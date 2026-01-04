import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CapitalismLeaderboardService, CapitalismResult } from '../../services/capitalism-leaderboard.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './capitalism-results.page.html',
  styleUrls: ['./capitalism-results.page.scss']
})
export class CapitalismResultsPage implements OnInit {
  score = 0;
  timeLabel = '--:--';
  timestamp = 0;

  top: CapitalismResult[] = [];

  constructor(
    private router: Router,
    private lb: CapitalismLeaderboardService
  ) {
    const nav = this.router.getCurrentNavigation();
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
    this.router.navigateByUrl('/capitalism');
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
