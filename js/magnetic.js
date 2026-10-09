import { config } from './config.js';
import { prefersReducedMotion } from './utils.js';

export function init() {
  if (!config.features.magnetic || prefersReducedMotion() || !matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return () => {};
  }

  const buttons = [...document.querySelectorAll('[data-magnetic]')];
  const cleanups = [];

  for (const button of buttons) {
    let bounds = null;
    let pointerX = 0;
    let pointerY = 0;
    let frameId = 0;

    const onEnter = () => {
      bounds = button.getBoundingClientRect();
    };

    const applyPosition = () => {
      frameId = 0;
      if (!bounds) return;
      const offsetX = ((pointerX - bounds.left) / bounds.width - .5) * 16;
      const offsetY = ((pointerY - bounds.top) / bounds.height - .5) * 16;
      button.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
    };

    const onMove = (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frameId) frameId = window.requestAnimationFrame(applyPosition);
    };

    const onLeave = () => {
      bounds = null;
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      button.style.removeProperty('transform');
    };

    button.addEventListener('pointerenter', onEnter);
    button.addEventListener('pointermove', onMove, { passive: true });
    button.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      onLeave();
      button.removeEventListener('pointerenter', onEnter);
      button.removeEventListener('pointermove', onMove);
      button.removeEventListener('pointerleave', onLeave);
    });
  }

  return function destroy() {
    cleanups.forEach((cleanup) => cleanup());
  };
}
