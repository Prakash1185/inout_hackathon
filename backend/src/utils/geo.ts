interface Coordinate {
  latitude: number;
  longitude: number;
}

export function calculateDistanceKm(points: Coordinate[]): number {
  if (points.length < 2) {
    return 0;
  }

  let totalMeters = 0;

  for (let i = 1; i < points.length; i += 1) {
    totalMeters += haversineMeters(points[i - 1], points[i]);
  }

  return totalMeters / 1000;
}

export function approximatePolygonAreaSqMeters(points: Coordinate[]): number {
  if (points.length < 3) {
    return 0;
  }

  const latRef =
    (points.reduce((sum, point) => sum + point.latitude, 0) / points.length) *
    (Math.PI / 180);
  const metersPerDegLat = 111_132;
  const metersPerDegLng = 111_320 * Math.cos(latRef);

  const planar = points.map((point) => ({
    x: point.longitude * metersPerDegLng,
    y: point.latitude * metersPerDegLat,
  }));

  let area = 0;

  for (let i = 0; i < planar.length; i += 1) {
    const current = planar[i];
    const next = planar[(i + 1) % planar.length];
    area += current.x * next.y - next.x * current.y;
  }

  return Math.abs(area / 2);
}

function haversineMeters(a: Coordinate, b: Coordinate): number {
  const r = 6371e3;
  const phi1 = (a.latitude * Math.PI) / 180;
  const phi2 = (b.latitude * Math.PI) / 180;
  const deltaPhi = ((b.latitude - a.latitude) * Math.PI) / 180;
  const deltaLambda = ((b.longitude - a.longitude) * Math.PI) / 180;

  const h =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return r * c;
}
