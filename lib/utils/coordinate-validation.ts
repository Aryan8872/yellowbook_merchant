/**
 * Coordinate validation utility
 * Validates latitude/longitude values and ensures coordinates are within valid geographic bounds.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Strict Nepal geographic boundary box: [Southwest [lng, lat], Northeast [lng, lat]]
 * Southwest: Mahakali / Kanchanpur margin ~ 80.05° E, 26.34° N
 * Northeast: Taplejung / Jhapa margin ~ 88.20° E, 30.45° N
 * Padded slightly so borders and neighboring roads remain visible.
 */
export const NEPAL_BOUNDS: [[number, number], [number, number]] = [
  [79.8, 26.0], // Southwest [lng, lat]
  [88.5, 30.8], // Northeast [lng, lat]
];

export const NEPAL_DEFAULT_CENTER: [number, number] = [85.324, 27.7172]; // Kathmandu [lng, lat]

/**
 * Checks whether given latitude and longitude are valid finite numbers within bounds.
 * Latitude: [-90, 90]
 * Longitude: [-180, 180]
 * Rejects (0, 0) if strictly configured (as (0, 0) in the Atlantic Ocean is almost always default/uninitialized dummy data).
 */
export function isValidCoordinate(
  lat: any,
  lng: any,
  options: { rejectZeroZero?: boolean } = { rejectZeroZero: true }
): boolean {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return false;
  }

  const numLat = typeof lat === 'number' ? lat : Number(lat);
  const numLng = typeof lng === 'number' ? lng : Number(lng);

  if (Number.isNaN(numLat) || Number.isNaN(numLng) || !Number.isFinite(numLat) || !Number.isFinite(numLng)) {
    return false;
  }

  if (numLat < -90 || numLat > 90) {
    return false;
  }

  if (numLng < -180 || numLng > 180) {
    return false;
  }

  if (options.rejectZeroZero && numLat === 0 && numLng === 0) {
    return false;
  }

  return true;
}

/**
 * Formats coordinates for MapLibre setLngLat strictly in [longitude, latitude] order.
 * Returns null if coordinates fail validation.
 */
export function toMapLibreLngLat(
  lat: any,
  lng: any,
  options?: { rejectZeroZero?: boolean }
): [number, number] | null {
  if (!isValidCoordinate(lat, lng, options)) {
    return null;
  }
  return [Number(lng), Number(lat)];
}
