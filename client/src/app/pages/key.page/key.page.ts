import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { KeyService } from '../../services/key.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './key.page.html',
  styleUrl: './key.page.scss'
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
