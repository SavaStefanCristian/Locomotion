import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlagCountry } from '../../data/flag-countries';
import { CountryFilterPipe } from '../../common/country-filter-pipe';

@Component({
  selector: 'app-flag-picker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CountryFilterPipe],
  providers: [CountryFilterPipe],
  templateUrl: './flag-picker-modal.html',
  styleUrls: ['./flag-picker-modal.scss']
})
export class FlagPickerModalComponent implements AfterViewInit {
  @Input() countries: FlagCountry[] = [];
  @Input() solvedIds = new Set<string>();

  @Output() select = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchQuery = '';

  constructor(private filterPipe: CountryFilterPipe) {}

  ngAfterViewInit(): void {
    // Focus the input immediately when the modal opens
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 50);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close.emit();
  }

  onEnter() {
    const filtered = this.filterPipe.transform(this.countries, this.searchQuery, this.solvedIds);
    if (filtered.length === 1) {
      this.select.emit(filtered[0].id);
    }
  }

  onSelect(id: string) {
    this.select.emit(id);
  }

  onOverlayClick() {
    this.close.emit();
  }
}
