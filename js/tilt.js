import { config } from './config.js';
import { prefersReducedMotion } from './utils.js';

const MAX_TILT = 8;

export function init() {
  if (!config.features.tilt || prefersReducedMotion() || !matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return () => {};
  }

  const cards = [...document.querySelectorAll('[data-tilt]')];
  const cleanups = [];

  for (const card of cards) {
    let bounds = null;
    let pointerX = 0;
    let pointerY = 0;
    let frameId = 0;

    const onEnter = () => {
      bounds = card.getBoundingClientRect();
    };

    const applyTilt = () => {
      frameId = 0;
      if (!bounds) return;
      const xRatio = (pointerX - bounds.left) / bounds.width;
      const yRatio = (pointerY - bounds.top) / bounds.height;
      const rotateY = (xRatio - .5) * MAX_TILT * 2;
      const rotateX = (.5 - yRatio) * MAX_TILT * 2;
      card.style.setProperty('--tilt-x', `${rotateY.toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${rotateX.toFixed(2)}deg`);
      card.style.setProperty('--mx', `${(xRatio * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(yRatio * 100).toFixed(1)}%`);
    };

    const onMove = (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frameId) frameId = window.requestAnimationFrame(applyTilt);
    };

    const onLeave = () => {
      bounds = null;
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    };

    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointermove', onMove, { passive: true });
    card.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      onLeave();
      card.removeEventListener('pointerenter', onEnter);
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
    });
  }

  return function destroy() {
    cleanups.forEach((cleanup) => cleanup());
  };
}
