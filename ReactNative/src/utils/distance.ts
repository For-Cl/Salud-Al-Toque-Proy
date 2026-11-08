// Haversine formula to compute great-circle distance between two geographic coordinates
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Approximate coordinate mappings for common healthcare zones in Lima
export const LIMA_LOCATIONS_COORDS: Record<string, { lat: number; lon: number }> = {
  lima: { lat: -12.0464, lon: -77.0428 },
  miraflores: { lat: -12.1217, lon: -77.0297 },
  'san isidro': { lat: -12.0975, lon: -77.0366 },
  surco: { lat: -12.1436, lon: -76.9922 },
  barranco: { lat: -12.1495, lon: -77.0208 },
  'san borja': { lat: -12.0864, lon: -77.0042 },
  molina: { lat: -12.0833, lon: -76.9167 },
};

export function getEstimatedCoords(locationName?: string): { lat: number; lon: number } {
  if (!locationName) return LIMA_LOCATIONS_COORDS['lima'];
  const normalized = locationName.toLowerCase();
  for (const [key, coords] of Object.entries(LIMA_LOCATIONS_COORDS)) {
    if (normalized.includes(key)) return coords;
  }
  return LIMA_LOCATIONS_COORDS['lima'];
}

