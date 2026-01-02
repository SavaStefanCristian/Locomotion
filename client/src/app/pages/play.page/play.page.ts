/// <reference types="google.maps" />

import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import L from 'leaflet';

import { GameService } from '../../services/game.service';
import { KeyService } from '../../services/key.service';
import { SettingsService } from '../../services/settings.service';
import { MusicService } from '../../services/music.service';
import { CENTERS, Center } from '../../data/centers';
import { CAPITALS } from '../../data/capitals';

let googleMapsLoadPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (googleMapsLoadPromise) return googleMapsLoadPromise;

  googleMapsLoadPromise = new Promise<void>((resolve, reject) => {
    if ((window as any).google?.maps) {
      resolve();
      return;
    }

    const cbName = '__gmaps_cb_' + Math.random().toString(36).slice(2);
    (window as any)[cbName] = () => {
      try {
        delete (window as any)[cbName];
      } catch {}
      resolve();
    };

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    script.src =
      `https://maps.googleapis.com/maps/api/js` +
      `?key=${encodeURIComponent(apiKey)}` +
      `&v=weekly` +
      `&callback=${encodeURIComponent(cbName)}`;

    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './play.page.html',
  styleUrl: './play.page.scss'
})
export class PlayPage implements AfterViewInit, OnDestroy {
  private readonly TRANSITION_MS = 420;

  // Timer
  private readonly ROUND_SECONDS = 90;
  timeLeft = this.ROUND_SECONDS;
  timeLabel = '01:30';
  private timerId?: number;

  // UX
  statusText = 'Loading…';
  submitted = false;
  mapExpanded = false;

  // Reveal stats
  hadGuess = false;
  lastDistanceKm = 0;
  lastPoints = 0;

  // Leaflet
  private map?: L.Map;
  private guessMarker?: L.CircleMarker;
  private guessLatLng?: L.LatLng;
  private revealLayer?: L.LayerGroup;

  // Google Street View
  private sv?: google.maps.StreetViewService;
  private pano?: google.maps.StreetViewPanorama;

  private trueLatLng?: L.LatLng;
  private panoId?: string;

  private usedPanos = new Set<string>();
  private usedCenterIdx = new Set<number>();
  private usedCapitalIdx = new Set<number>();

  private pendingRound?: {
    panoId: string;
    trueLat: number;
    trueLng: number;
    guessLat: number;
    guessLng: number;
    distanceKm: number;
    points: number;
  };

  private onWindowResize = () => {
    this.refreshMapSize();
    this.kickStreetView(false);
  };

  constructor(
    private router: Router,
    public game: GameService,
    private keys: KeyService,
    private settings: SettingsService,
    private music: MusicService
  ) {}

  ensureMusic(): void {
    if (!this.music.enabled()) return;
    if (this.music.playing()) return;
    void this.music.startFromGesture();
  }

  async ngAfterViewInit(): Promise<void> {
    const key = this.keys.get();
    if (!key) {
      this.router.navigateByUrl('/key');
      return;
    }

    this.map = L.map('guessMap', { zoomControl: true }).setView([20, 0], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(this.map);

    this.disableMapInteraction();

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.submitted) return;
      this.guessLatLng = e.latlng;

      if (!this.guessMarker) {
        this.guessMarker = L.circleMarker(e.latlng, {
          radius: 9,
          color: '#1d4ed8',
          fillColor: '#1d4ed8',
          fillOpacity: 0.9,
          weight: 2,
        }).addTo(this.map!);
      } else {
        this.guessMarker.setLatLng(e.latlng);
      }

      this.statusText = 'Guess placed. Submit when ready.';
    });

    await loadGoogleMaps(key);

    this.sv = new google.maps.StreetViewService();
    window.addEventListener('resize', this.onWindowResize);

    await this.loadRound();
  }

  // ---------- Timer ----------
  private startTimer(): void {
    this.stopTimer();
    this.timeLeft = this.settings.secondsPerRound();
    this.timeLabel = this.formatTime(this.timeLeft);

    this.timerId = window.setInterval(() => {
      if (this.submitted) return;

      this.timeLeft -= 1;
      if (this.timeLeft < 0) this.timeLeft = 0;
      this.timeLabel = this.formatTime(this.timeLeft);

      if (this.timeLeft % 5 === 0) this.kickStreetView(false);
      if (this.timeLeft === 0) void this.onTimeout();
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerId !== undefined) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }

  private formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  private async onTimeout(): Promise<void> {
    if (this.submitted) return;

    if (this.guessLatLng) {
      await this.submitGuess();
      return;
    }

    if (!this.trueLatLng || !this.panoId) return;

    this.hadGuess = false;
    this.lastPoints = 0;
    this.lastDistanceKm = 0;

    this.pendingRound = {
      panoId: this.panoId,
      trueLat: this.trueLatLng.lat,
      trueLng: this.trueLatLng.lng,
      guessLat: Number.NaN,
      guessLng: Number.NaN,
      distanceKm: Number.POSITIVE_INFINITY,
      points: 0,
    };

    this.clearReveal();
    this.revealLayer = L.layerGroup().addTo(this.map!);

    L.circleMarker(this.trueLatLng, {
      radius: 10,
      color: '#16a34a',
      fillColor: '#16a34a',
      fillOpacity: 0.95,
      weight: 2,
    }).addTo(this.revealLayer);

    this.submitted = true;
    this.enableMapInteraction();
    this.refreshMapSize();

    setTimeout(() => {
      this.map?.invalidateSize();
      this.map?.setView(this.trueLatLng!, 6);
    }, this.TRANSITION_MS + 40);

    this.statusText = 'Time is up.';
    this.stopTimer();
  }

  // ---------- Map expand ----------
  toggleMap(ev?: Event): void {
    ev?.stopPropagation();
    if (this.submitted) return;

    if (this.mapExpanded) this.collapseMap();
    else this.expandMap();
  }

  expandMap(): void {
    if (this.submitted) return;
    this.mapExpanded = true;
    this.enableMapInteraction();
    this.refreshMapSize();
    this.kickStreetView(false);
  }

  collapseMap(): void {
    if (this.submitted) return;
    this.mapExpanded = false;
    this.disableMapInteraction();
    this.refreshMapSize();
    this.kickStreetView(false);
  }

  private enableMapInteraction(): void {
    if (!this.map) return;
    this.map.dragging.enable();
    this.map.scrollWheelZoom.enable();
    this.map.doubleClickZoom.enable();
    this.map.boxZoom.enable();
    this.map.keyboard.enable();
    this.map.touchZoom.enable();
  }

  private disableMapInteraction(): void {
    if (!this.map) return;
    this.map.dragging.disable();
    this.map.scrollWheelZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();
    this.map.touchZoom.disable();
  }

  private refreshMapSize(): void {
    if (!this.map) return;

    this.map.invalidateSize({ animate: false });

    const start = performance.now();
    const duration = this.TRANSITION_MS + 200;

    const tick = () => {
      this.map?.invalidateSize({ animate: false });
      if (performance.now() - start < duration) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  // ---------- Street View mitigation ----------
  private recreatePanorama(): void {
    const el = document.getElementById('gsv');
    if (!el) return;

    el.innerHTML = '';

    this.pano = new google.maps.StreetViewPanorama(el as HTMLElement, {
      addressControl: false,
      fullscreenControl: false,
      panControl: false,
      enableCloseButton: false,
      showRoadLabels: false,
      linksControl: true,
      zoomControl: true,
      disableDefaultUI: true,
    });

    this.pano.addListener('pano_changed', () => this.kickStreetView(false));
    this.pano.addListener('visible_changed', () => this.kickStreetView(false));
  }

  private kickStreetView(hard: boolean): void {
    if (!this.pano) return;

    const doKick = () => {
      try {
        google.maps.event.trigger(this.pano!, 'resize');
        const pov = this.pano!.getPov();
        this.pano!.setPov({ ...pov });
      } catch {}
    };

    setTimeout(doKick, 0);
    setTimeout(doKick, this.TRANSITION_MS + 60);

    if (hard) {
      setTimeout(() => {
        try {
          this.pano!.setVisible(false);
          google.maps.event.trigger(this.pano!, 'resize');
          this.pano!.setVisible(true);
          google.maps.event.trigger(this.pano!, 'resize');
        } catch {}
      }, 120);
    }
  }

  // ---------- Variety helpers ----------
  private pickRandomCenterIndex(exclude: Set<number>, max: number): number {
    // if we exhausted most of them, recycle
    if (exclude.size > Math.floor(max * 0.85)) {
      exclude.clear();
    }

    for (let i = 0; i < 400; i++) {
      const idx = Math.floor(Math.random() * max);
      if (!exclude.has(idx)) return idx;
    }
    // fallback (rare)
    return Math.floor(Math.random() * max);
  }

  private jitter(c: Center): google.maps.LatLng {
    const d = 0.015;
    return new google.maps.LatLng(
      c.lat + (Math.random() * 2 - 1) * d,
      c.lng + (Math.random() * 2 - 1) * d
    );
  }

  private isInEurope(c: Center): boolean {
    const lat = c.lat;
    const lng = c.lng;
    // Rough bounding box for Europe. Good enough for a region filter.
    return lat >= 30 && lat <= 72 && lng >= -25 && lng <= 45;
  }

  private isCenterAllowed(c: Center): boolean {
    // Default: whole world
    const region = this.settings.region();

    if (region === 'world') return true;

    if (region === 'europe') {
      // Rough bounding box for Europe; not perfect, but good enough for a mode.
      const lat = c.lat;
      const lng = c.lng;
      return lat >= 30 && lat <= 72 && lng >= -25 && lng <= 45;
    }

    return true;
  }

  private loadPanoramaAt(
    loc: google.maps.LatLng,
    radius: number
  ): Promise<{ ok: boolean; panoId?: string; latLng?: google.maps.LatLng }> {
    return new Promise((resolve) => {
      this.sv!.getPanorama(
        { location: loc, radius, preference: google.maps.StreetViewPreference.NEAREST },
        (data: google.maps.StreetViewPanoramaData | null, status: google.maps.StreetViewStatus) => {
          if (
            status !== google.maps.StreetViewStatus.OK ||
            !data?.location?.latLng ||
            !data.location.pano
          ) {
            resolve({ ok: false });
            return;
          }
          resolve({ ok: true, panoId: data.location.pano, latLng: data.location.latLng });
        }
      );
    });
  }

  private clearReveal(): void {
    if (this.revealLayer) {
      this.revealLayer.remove();
      this.revealLayer = undefined;
    }
  }

  private resetGuessUI(): void {
    this.guessLatLng = undefined;
    if (this.guessMarker) {
      this.map?.removeLayer(this.guessMarker);
      this.guessMarker = undefined;
    }
    this.map?.setView([20, 0], 2);
  }

  private async loadRound(): Promise<void> {
    this.stopTimer();

    this.submitted = false;
    this.mapExpanded = false;
    this.disableMapInteraction();
    this.refreshMapSize();

    this.pendingRound = undefined;
    this.lastDistanceKm = 0;
    this.lastPoints = 0;
    this.hadGuess = false;

    this.statusText = 'Loading round…';
    this.clearReveal();
    this.resetGuessUI();

    // Recreate panorama every round to kill the intermittent “black” state
    this.recreatePanorama();

    this.trueLatLng = undefined;
    this.panoId = undefined;

    const region = this.settings.region();
    const centers = region === 'capitals' ? CAPITALS : CENTERS;
    const usedIdx = region === 'capitals' ? this.usedCapitalIdx : this.usedCenterIdx;

    if (centers.length === 0) {
      this.statusText = 'No seed centers available for this region.';
      return;
    }

    // Try harder now that we have many centers
    for (let attempt = 1; attempt <= 60; attempt++) {
      const idx = this.pickRandomCenterIndex(usedIdx, centers.length);
      const center = centers[idx];

      if (region === 'europe' && !this.isInEurope(center)) {
        // Skip non-European seeds when Europe mode is on
        continue;
      }

      const loc = this.jitter(center);

      const a = await this.loadPanoramaAt(loc, 500);
      const b = a.ok ? a : await this.loadPanoramaAt(loc, 1500);
      const c = b.ok ? b : await this.loadPanoramaAt(loc, 5000);

      if (!c.ok || !c.panoId || !c.latLng) {
        continue; // IMPORTANT: do NOT mark idx used on failure
      }

      if (this.usedPanos.has(c.panoId)) {
        continue;
      }

      // Success: now mark both used
      usedIdx.add(idx);
      this.usedPanos.add(c.panoId);

      this.panoId = c.panoId;
      const ll = c.latLng;
      this.trueLatLng = L.latLng(ll.lat(), ll.lng());

      // Set pano + position to help stability
      this.pano!.setVisible(true);
      this.pano!.setPano(c.panoId);
      this.pano!.setPosition(ll);

      // hard repaint right after swapping pano
      this.kickStreetView(true);

      this.statusText = 'Click on the map to place your guess.';
      this.startTimer();
      return;
    }

    this.statusText = 'Could not load Street View (try refresh / check quotas / restrictions).';
  }

  async submitGuess(): Promise<void> {
    if (this.submitted) return;

    if (!this.trueLatLng || !this.panoId) {
      this.statusText = 'Not ready yet.';
      return;
    }

    if (!this.guessLatLng) {
      await this.onTimeout();
      return;
    }

    this.hadGuess = true;

    const km = this.haversineKm(
      this.trueLatLng.lat,
      this.trueLatLng.lng,
      this.guessLatLng.lat,
      this.guessLatLng.lng
    );

    const points = Math.max(0, Math.round(5000 * Math.exp(-km / 2000)));

    this.lastDistanceKm = km;
    this.lastPoints = points;

    this.pendingRound = {
      panoId: this.panoId,
      trueLat: this.trueLatLng.lat,
      trueLng: this.trueLatLng.lng,
      guessLat: this.guessLatLng.lat,
      guessLng: this.guessLatLng.lng,
      distanceKm: km,
      points,
    };

    this.clearReveal();
    this.revealLayer = L.layerGroup().addTo(this.map!);

    const guess = this.guessLatLng;
    const truth = this.trueLatLng;

    L.circleMarker(guess, {
      radius: 10,
      color: '#1d4ed8',
      fillColor: '#1d4ed8',
      fillOpacity: 0.95,
      weight: 2,
    }).addTo(this.revealLayer);

    L.circleMarker(truth, {
      radius: 10,
      color: '#16a34a',
      fillColor: '#16a34a',
      fillOpacity: 0.95,
      weight: 2,
    }).addTo(this.revealLayer);

    L.polyline([guess, truth], {
      weight: 3,
      color: '#111827',
      opacity: 0.85,
      dashArray: '6 8',
    }).addTo(this.revealLayer);

    this.submitted = true;
    this.enableMapInteraction();
    this.refreshMapSize();

    setTimeout(() => {
      this.map?.invalidateSize();
      this.map?.fitBounds(L.latLngBounds([guess, truth]).pad(0.35));
    }, this.TRANSITION_MS + 40);

    this.statusText = 'Revealed.';
    this.stopTimer();
  }

  async nextAfterReveal(): Promise<void> {
    if (!this.pendingRound) return;

    this.game.addRound(this.pendingRound);
    this.pendingRound = undefined;

    if (this.game.finished()) {
      this.router.navigateByUrl('/results');
      return;
    }

    this.submitted = false;
    this.disableMapInteraction();
    this.refreshMapSize();

    this.kickStreetView(true);

    await new Promise<void>((r) => setTimeout(() => r(), this.TRANSITION_MS + 80));

    await this.loadRound();
  }

  quit(): void {
    this.stopTimer();
    this.music.stop();
    this.router.navigateByUrl('/');
  }

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.music.stop();
    window.removeEventListener('resize', this.onWindowResize);
    this.map?.remove();
  }
}
