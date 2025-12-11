import { Injectable } from '@angular/core';

const STORAGE_KEY = 'byok_google_maps_api_key';

@Injectable({ providedIn: 'root' })
export class KeyService {
  get(): string | null {
    const k = localStorage.getItem(STORAGE_KEY);
    return k && k.trim().length ? k.trim() : null;
  }
  set(key: string): void {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
