
export function calculatePopRisk(currentAltitude: number, popThreshold: number): boolean {
  const riskLevel = currentAltitude / popThreshold;
  return Math.random() < riskLevel * 0.01;
}

export function getRandomPopThreshold(min: number = 100, max: number = 200): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function interpolateColor(color1: number, color2: number, factor: number): number {
  const r1 = (color1 >> 16) & 0xFF;
  const g1 = (color1 >> 8) & 0xFF;
  const b1 = color1 & 0xFF;

  const r2 = (color2 >> 16) & 0xFF;
  const g2 = (color2 >> 8) & 0xFF;
  const b2 = color2 & 0xFF;

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return (r << 16) | (g << 8) | b;
}