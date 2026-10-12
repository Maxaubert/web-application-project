// Bildet som vises etter at man blar i galleriet (#156). Rundtur: etter siste bilde kommer det første, og før det første
// kommer det siste. Tomt galleri gir 0.
export function stepIndex(current: number, delta: 1 | -1, count: number): number {
  if (count <= 0) return 0;
  return (current + delta + count) % count;
}
