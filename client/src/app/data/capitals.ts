import { Center } from './centers';

/*
 * Approximate coordinates for world capital cities.
 * Only using lat/lng;
 */
export const CAPITALS: Center[] = [
  // Europe
  { lat: 51.5074, lng: -0.1278 }, // London
  { lat: 48.8566, lng: 2.3522 }, // Paris
  { lat: 52.52, lng: 13.405 }, // Berlin
  { lat: 41.9028, lng: 12.4964 }, // Rome
  { lat: 40.4168, lng: -3.7038 }, // Madrid
  { lat: 38.7223, lng: -9.1393 }, // Lisbon
  { lat: 50.8503, lng: 4.3517 }, // Brussels
  { lat: 52.3676, lng: 4.9041 }, // Amsterdam
  { lat: 48.2082, lng: 16.3738 }, // Vienna
  { lat: 50.0755, lng: 14.4378 }, // Prague
  { lat: 52.2297, lng: 21.0122 }, // Warsaw
  { lat: 47.4979, lng: 19.0402 }, // Budapest
  { lat: 37.9838, lng: 23.7275 }, // Athens
  { lat: 53.3498, lng: -6.2603 }, // Dublin
  { lat: 55.6761, lng: 12.5683 }, // Copenhagen
  { lat: 59.3293, lng: 18.0686 }, // Stockholm
  { lat: 59.9139, lng: 10.7522 }, // Oslo
  { lat: 60.1699, lng: 24.9384 }, // Helsinki
  { lat: 44.4268, lng: 26.1025 }, // Bucharest

  // Americas
  { lat: 38.9072, lng: -77.0369 }, // Washington, D.C.
  { lat: 45.4215, lng: -75.6972 }, // Ottawa
  { lat: 19.4326, lng: -99.1332 }, // Mexico City
  { lat: -15.8267, lng: -47.9218 }, // Brasília
  { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
  { lat: -33.4489, lng: -70.6693 }, // Santiago
  { lat: -12.0464, lng: -77.0428 }, // Lima
  { lat: 4.711, lng: -74.0721 }, // Bogotá

  // Africa / Middle East
  { lat: 30.0444, lng: 31.2357 }, // Cairo
  { lat: -1.2921, lng: 36.8219 }, // Nairobi
  { lat: -25.7479, lng: 28.2293 }, // Pretoria
  { lat: 24.7136, lng: 46.6753 }, // Riyadh
  { lat: 24.4539, lng: 54.3773 }, // Abu Dhabi
  { lat: 39.9334, lng: 32.8597 }, // Ankara

  // Asia
  { lat: 35.6895, lng: 139.6917 }, // Tokyo
  { lat: 39.9042, lng: 116.4074 }, // Beijing
  { lat: 37.5665, lng: 126.978 }, // Seoul
  { lat: 13.7563, lng: 100.5018 }, // Bangkok
  { lat: -6.2088, lng: 106.8456 }, // Jakarta
  { lat: 1.3521, lng: 103.8198 }, // Singapore
  { lat: 28.6139, lng: 77.209 }, // New Delhi
  { lat: 33.6844, lng: 73.0479 }, // Islamabad

  // Oceania
  { lat: -35.2809, lng: 149.13 }, // Canberra
  { lat: -41.2865, lng: 174.7762 }, // Wellington
  { lat: -33.8688, lng: 151.2093 }, // Sydney (big city, not capital)
];
