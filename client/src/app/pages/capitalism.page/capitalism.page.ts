import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import L from 'leaflet';

import { CAPITAL_CITIES, CapitalCity } from '../../data/capital-cities';
import { CapitalPickerModalComponent } from '../../components/capital-picker-modal/capital-picker-modal';

@Component({
  standalone: true,
  imports: [CommonModule, CapitalPickerModalComponent],
  templateUrl: './capitalism.page.html',
  styleUrls: ['./capitalism.page.scss']
})
export class CapitalismPage implements AfterViewInit, OnDestroy {
  private map?: L.Map;

  cities = CAPITAL_CITIES;

  solvedIds = new Set<string>();
  cooldownIds = new Set<string>();
  score = 0;

  scoreDelta: { val: string; type: 'gain' | 'loss' } | null = null;
  justSolvedId: string | null = null;

  selectedCity: CapitalCity | null = null;

  timeElapsed = 0;
  timeLabel = '00:00';
  private timerId?: number;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.startTimer();
  }

  private initMap(): void {
    const worldBounds = L.latLngBounds([
      [-85, -180],
      [85, 185]
    ]);

    this.map = L.map('capitalismMap', {
      zoomControl: true,
      center: [20, 0],
      zoom: 2.4,
      minZoom: 2.4,
      maxBounds: worldBounds,
      maxBoundsViscosity: 0.9
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      bounds: worldBounds
    }).addTo(this.map);

    this.refreshMarkers();
  }

  makeGuess(guessedCapital: string) {
    if (!this.selectedCity) return;

    if (guessedCapital === this.selectedCity.capitalName) {
      const id = this.selectedCity.id;
      this.solvedIds.add(id);
      this.updateScore(500);

      this.justSolvedId = id;

      this.closePicker();
      this.refreshMarkers();

      setTimeout(() => {
        if (this.justSolvedId === id) {
          this.justSolvedId = null;
        }
      }, 1000);

      if (this.solvedIds.size === this.cities.length) {
        this.stopTimer();
        this.router.navigate(['/capitalism-results'], {
          state: {
            score: this.score,
            timeLabel: this.timeLabel
          }
        });
      }
    } else {
      this.updateScore(-100);
      this.handleMistake(this.selectedCity);
    }
  }

  updateScore(amount: number) {
    this.score += amount;
    this.scoreDelta = {
      val: amount > 0 ? `+${amount}` : `${amount}`,
      type: amount > 0 ? 'gain' : 'loss'
    };
    setTimeout(() => {
      this.scoreDelta = null;
    }, 1500);
  }

  handleMistake(c: CapitalCity) {
    this.cooldownIds.add(c.id);
    this.closePicker();
    this.refreshMarkers();

    setTimeout(() => {
      this.cooldownIds.delete(c.id);
      this.refreshMarkers();
    }, 15000);
  }

  refreshMarkers(): void {
    if (!this.map) return;

    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) this.map?.removeLayer(layer);
    });

    this.cities.forEach(c => {
      const isSolved = this.solvedIds.has(c.id);
      const isCooldown = this.cooldownIds.has(c.id);
      const isJustSolved = (this.justSolvedId === c.id);

      let iconHtml = `<div class="marker-gray"></div>`;
      let zIndex = 100;
      let className = 'custom-marker-host';

      if (isSolved) {
        const cssClass = isJustSolved ? 'marker-flag marker-success' : 'marker-flag';
        iconHtml = `<div class="${cssClass}" style="background-image: url('https://flagcdn.com/w80/${c.id}.png')"></div>`;
        zIndex = 10;
      } else if (isCooldown) {
        iconHtml = `<div class="marker-error"></div>`;
        zIndex = 200;
      }

      const icon = L.divIcon({
        html: iconHtml,
        className: className,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([c.lat, c.lng], {icon, zIndexOffset: zIndex}).addTo(this.map!);

      marker.on('click', () => {
        if (!isSolved && !isCooldown) {
          this.openPicker(c);
        }
      });
    });
  }

  private startTimer(): void {
    this.timerId = window.setInterval(() => {
      this.timeElapsed++;
      const m = Math.floor(this.timeElapsed / 60).toString().padStart(2, '0');
      const s = (this.timeElapsed % 60).toString().padStart(2, '0');
      this.timeLabel = `${m}:${s}`;
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerId) clearInterval(this.timerId);
  }

  openPicker(c: CapitalCity) {
    this.selectedCity = c;
  }

  closePicker() {
    this.selectedCity = null;
  }

  quit() {
    this.stopTimer();
    this.router.navigateByUrl('/');
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.map?.remove();
  }
}
