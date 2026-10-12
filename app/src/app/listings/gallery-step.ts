// Bildet som vises etter at man blar i galleriet (#156). Rundtur: etter siste bilde kommer det første, og før det første
// kommer det siste. Tomt galleri gir 0.
export function stepIndex(current: number, delta: 1 | -1, count: number): number {
  if (count <= 0) return 0;
  return (current + delta + count) % count;
}

// Et sveip er en tydelig sidelengs bevegelse: lengre enn terskelen, og mer sidelengs enn opp og ned, så vanlig rulling
// på siden ikke bytter bilde. Gir retningen (1 = neste, -1 = forrige) eller null.
export const SWIPE_MIN_PX = 40;

export function swipeDirection(dx: number, dy: number): 1 | -1 | null {
  if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) <= Math.abs(dy) * 1.5) return null;
  return dx < 0 ? 1 : -1;
}
