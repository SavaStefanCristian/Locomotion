import { Component, EventEmitter, HostListener, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CapitalCity } from '../../data/capital-cities';

@Component({
  selector: 'app-capital-picker-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './capital-picker-modal.html',
  styleUrls: ['./capital-picker-modal.scss']
})
export class CapitalPickerModalComponent implements OnInit {
  @Input() selectedCity: CapitalCity | null = null;
  @Input() allCities: CapitalCity[] = [];

  @Output() select = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  options: CapitalCity[] = [];

  ngOnInit() {
    if (this.selectedCity) {
      this.generateOptions();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close.emit();
  }

  private generateOptions() {
    if (!this.selectedCity) return;

    const wrongAnswers = this.allCities
      .filter(c => c.id !== this.selectedCity!.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [...wrongAnswers, this.selectedCity];
    this.options = allOptions.sort(() => Math.random() - 0.5);
  }

  onSelect(capitalName: string) {
    this.select.emit(capitalName);
  }

  onOverlayClick() {
    this.close.emit();
  }
}
