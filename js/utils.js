export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function prefersReducedMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}
