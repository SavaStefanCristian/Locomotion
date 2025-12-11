export type Center = { lat: number; lng: number };

type RegionBox = {
  name: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  count: number;
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randIn(rng: () => number, min: number, max: number) {
  return min + (max - min) * rng();
}

function clampLat(lat: number) {
  return Math.max(-85, Math.min(85, lat));
}

function wrapLng(lng: number) {
  let x = lng;
  while (x < -180) x += 360;
  while (x > 180) x -= 360;
  return x;
}

const REGIONS: RegionBox[] = [
  // North America
  {
    name: 'USA (contiguous)',
    minLat: 25.0,
    maxLat: 49.0,
    minLng: -124.8,
    maxLng: -66.9,
    count: 180,
  },
  {
    name: 'Canada (south band)',
    minLat: 43.0,
    maxLat: 60.0,
    minLng: -130.0,
    maxLng: -52.0,
    count: 60,
  },
  { name: 'Mexico', minLat: 14.5, maxLat: 32.7, minLng: -117.2, maxLng: -86.7, count: 60 },
  { name: 'Central America', minLat: 7.0, maxLat: 18.5, minLng: -92.5, maxLng: -77.0, count: 30 },
  {
    name: 'Caribbean (PR/DR area)',
    minLat: 17.5,
    maxLat: 20.2,
    minLng: -71.5,
    maxLng: -65.2,
    count: 12,
  },

  // South America
  {
    name: 'Andes North (Col/Ecu/Per)',
    minLat: -5.5,
    maxLat: 12.8,
    minLng: -81.5,
    maxLng: -66.0,
    count: 45,
  },
  { name: 'Brazil (SE/S)', minLat: -33.8, maxLat: -10.0, minLng: -54.5, maxLng: -35.0, count: 55 },
  {
    name: 'Southern Cone (Arg/Uru/Chi)',
    minLat: -55.0,
    maxLat: -20.0,
    minLng: -76.5,
    maxLng: -53.0,
    count: 35,
  },

  // Europe
  { name: 'UK + Ireland', minLat: 50.0, maxLat: 59.0, minLng: -10.8, maxLng: 2.0, count: 40 },
  { name: 'Iberia (ES/PT)', minLat: 36.0, maxLat: 43.9, minLng: -9.6, maxLng: 3.4, count: 40 },
  { name: 'France', minLat: 42.0, maxLat: 51.6, minLng: -5.6, maxLng: 8.2, count: 50 },
  { name: 'Benelux', minLat: 50.6, maxLat: 53.7, minLng: 3.0, maxLng: 7.4, count: 22 },
  { name: 'Germany/CZ/PL belt', minLat: 47.0, maxLat: 54.9, minLng: 5.7, maxLng: 20.9, count: 85 },
  { name: 'Italy', minLat: 37.0, maxLat: 45.2, minLng: 7.0, maxLng: 18.7, count: 45 },
  {
    name: 'Nordics (DK/SE/NO/FI south)',
    minLat: 55.0,
    maxLat: 69.5,
    minLng: 5.0,
    maxLng: 31.5,
    count: 55,
  },
  { name: 'Balkans', minLat: 40.0, maxLat: 46.7, minLng: 13.0, maxLng: 28.6, count: 40 },
  { name: 'Eastern Europe', minLat: 44.0, maxLat: 59.0, minLng: 20.0, maxLng: 40.5, count: 60 },
  { name: 'Greece', minLat: 35.0, maxLat: 41.5, minLng: 19.0, maxLng: 28.8, count: 20 },
  {
    name: 'Turkey (west/central)',
    minLat: 36.0,
    maxLat: 42.8,
    minLng: 26.0,
    maxLng: 41.5,
    count: 30,
  },
  { name: 'Iceland', minLat: 63.2, maxLat: 66.6, minLng: -23.6, maxLng: -13.0, count: 8 },

  // Middle East
  { name: 'Israel/Jordan', minLat: 29.0, maxLat: 33.6, minLng: 34.2, maxLng: 36.9, count: 15 },
  {
    name: 'Gulf (UAE/Qatar/Bahrain region)',
    minLat: 24.0,
    maxLat: 26.9,
    minLng: 50.8,
    maxLng: 55.8,
    count: 12,
  },
  { name: 'Oman (north)', minLat: 21.0, maxLat: 25.8, minLng: 55.0, maxLng: 59.5, count: 10 },

  // Africa
  { name: 'South Africa', minLat: -35.5, maxLat: -22.8, minLng: 16.0, maxLng: 33.2, count: 22 },
  { name: 'Kenya', minLat: -4.6, maxLat: 1.7, minLng: 34.0, maxLng: 41.8, count: 12 },
  { name: 'Morocco', minLat: 30.0, maxLat: 36.2, minLng: -9.8, maxLng: -1.0, count: 10 },
  { name: 'Tunisia', minLat: 33.0, maxLat: 37.5, minLng: 8.0, maxLng: 11.9, count: 6 },
  { name: 'Egypt (lower)', minLat: 26.0, maxLat: 31.6, minLng: 29.0, maxLng: 33.8, count: 7 },
  { name: 'Ghana/Nigeria band', minLat: 5.0, maxLat: 10.6, minLng: -3.6, maxLng: 9.8, count: 12 },

  // Asia
  {
    name: 'India (north/central)',
    minLat: 10.0,
    maxLat: 28.5,
    minLng: 72.0,
    maxLng: 88.8,
    count: 45,
  },
  { name: 'Sri Lanka', minLat: 5.9, maxLat: 9.9, minLng: 79.6, maxLng: 81.9, count: 6 },

  { name: 'Japan', minLat: 31.0, maxLat: 44.7, minLng: 130.0, maxLng: 142.2, count: 55 },
  { name: 'South Korea', minLat: 34.4, maxLat: 38.7, minLng: 126.0, maxLng: 129.9, count: 28 },
  { name: 'Taiwan', minLat: 21.8, maxLat: 25.3, minLng: 120.0, maxLng: 122.1, count: 18 },
  { name: 'Hong Kong / Macau', minLat: 22.1, maxLat: 22.6, minLng: 113.8, maxLng: 114.4, count: 6 },

  { name: 'Singapore', minLat: 1.2, maxLat: 1.47, minLng: 103.6, maxLng: 104.1, count: 6 },
  {
    name: 'Malaysia (peninsula)',
    minLat: 1.0,
    maxLat: 6.8,
    minLng: 99.0,
    maxLng: 104.6,
    count: 22,
  },
  { name: 'Thailand', minLat: 7.0, maxLat: 18.7, minLng: 98.0, maxLng: 105.8, count: 22 },
  {
    name: 'Vietnam (main corridor)',
    minLat: 10.0,
    maxLat: 21.5,
    minLng: 105.0,
    maxLng: 109.5,
    count: 16,
  },
  { name: 'Philippines', minLat: 7.0, maxLat: 18.8, minLng: 119.0, maxLng: 126.5, count: 18 },
  {
    name: 'Indonesia (Java/Bali band)',
    minLat: -8.9,
    maxLat: -5.5,
    minLng: 106.4,
    maxLng: 115.9,
    count: 12,
  },

  // Oceania
  {
    name: 'Australia (east)',
    minLat: -38.5,
    maxLat: -24.0,
    minLng: 144.0,
    maxLng: 154.3,
    count: 30,
  },
  {
    name: 'Australia (south/west)',
    minLat: -38.5,
    maxLat: -26.5,
    minLng: 115.0,
    maxLng: 141.0,
    count: 32,
  },
  {
    name: 'New Zealand (north)',
    minLat: -39.6,
    maxLat: -34.2,
    minLng: 174.0,
    maxLng: 178.8,
    count: 10,
  },
  {
    name: 'New Zealand (south)',
    minLat: -46.7,
    maxLat: -41.0,
    minLng: 166.0,
    maxLng: 173.7,
    count: 10,
  },
];

// A few explicit anchors (helps variety in sparse regions)
const ANCHORS: Center[] = [
  { lat: 64.1466, lng: -21.9426 }, // Reykjavik-ish
  { lat: 35.6895, lng: 139.6917 }, // Tokyo-ish
  { lat: 48.8566, lng: 2.3522 }, // Paris-ish
  { lat: 51.5074, lng: -0.1278 }, // London-ish
  { lat: 40.7128, lng: -74.006 }, // NYC-ish
  { lat: 34.0522, lng: -118.2437 }, // LA-ish
  { lat: -33.8688, lng: 151.2093 }, // Sydney-ish
  { lat: -23.5505, lng: -46.6333 }, // São Paulo-ish
  { lat: 19.4326, lng: -99.1332 }, // Mexico City-ish
  { lat: 52.52, lng: 13.405 }, // Berlin-ish
];

function buildCenters(): Center[] {
  const rng = mulberry32(0xc0ffee); // fixed seed for stable list
  const out: Center[] = [];

  for (const r of REGIONS) {
    for (let i = 0; i < r.count; i++) {
      const lat = clampLat(randIn(rng, r.minLat, r.maxLat));
      const lng = wrapLng(randIn(rng, r.minLng, r.maxLng));
      out.push({ lat, lng });
    }
  }

  // Mix in anchors at the front (and avoid duplicates by naive filter)
  const key = (c: Center) => `${c.lat.toFixed(5)},${c.lng.toFixed(5)}`;
  const seen = new Set<string>();
  const merged: Center[] = [];

  for (const a of ANCHORS) {
    const k = key(a);
    if (!seen.has(k)) {
      seen.add(k);
      merged.push(a);
    }
  }
  for (const c of out) {
    const k = key(c);
    if (!seen.has(k)) {
      seen.add(k);
      merged.push(c);
    }
  }

  return merged;
}

export const CENTERS: Center[] = buildCenters();
export const CENTERS_COUNT = CENTERS.length;
