import type { Coordinate } from "@/shared/types";

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

  const avgLat =
    (points.reduce((sum, p) => sum + p.latitude, 0) / points.length) *
    (Math.PI / 180);
  const metersPerDegLat = 111_132;
  const metersPerDegLng = 111_320 * Math.cos(avgLat);

  const planar = points.map((p) => ({
    x: p.longitude * metersPerDegLng,
    y: p.latitude * metersPerDegLat,
  }));

  let area = 0;
  for (let i = 0; i < planar.length; i += 1) {
    const c = planar[i];
    const n = planar[(i + 1) % planar.length];
    area += c.x * n.y - n.x * c.y;
  }

  return Math.abs(area / 2);
}

function haversineMeters(a: Coordinate, b: Coordinate): number {
  const r = 6371e3;
  const phi1 = (a.latitude * Math.PI) / 180;
  const phi2 = (b.latitude * Math.PI) / 180;
  const dPhi = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLambda = ((b.longitude - a.longitude) * Math.PI) / 180;

  const h =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(dLambda / 2) *
      Math.sin(dLambda / 2);

  return 2 * r * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
