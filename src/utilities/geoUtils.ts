export type DistanceUnit = 'm' | 'km' | 'mi' | 'ft';

const EARTH_RADIUS_M = 6371008.8; // mean Earth radius in meters

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Calculate great-circle distance (Haversine) between two coordinates.
 * @param a [lat, lon] in decimal degrees
 * @param b [lat, lon] in decimal degrees
 * @param unit output unit: 'm' (default), 'km', 'mi', or 'ft'
 * @returns distance in the chosen unit (number)
 */
export function distanceBetweenCoords(
  a: [number, number],
  b: [number, number],
  unit: DistanceUnit = 'm'
): number {
  const [lat1, lon1] = a;
  const [lat2, lon2] = b;

  // Guard against invalid inputs
  if (
    [lat1, lon1, lat2, lon2].some(
      (v) => typeof v !== 'number' || Number.isNaN(v) || !Number.isFinite(v)
    )
  ) {
    return NaN;
  }

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const aHarv =
    sinDLat * sinDLat + Math.cos(rLat1) * Math.cos(rLat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(aHarv), Math.sqrt(1 - aHarv));
  const meters = EARTH_RADIUS_M * c;

  switch (unit) {
    case 'km':
      return meters / 1000;
    case 'mi':
      return meters / 1609.344;
    case 'ft':
      return meters * 3.280839895;
    case 'm':
    default:
      return meters;
  }
}

/** Convenience converters from meters */
export function metersTo(valueInMeters: number, unit: DistanceUnit): number {
  return distanceBetweenCoords([0, 0], [0, valueInMeters / EARTH_RADIUS_M], unit); // reuse conversion logic
}
