import { config } from './config.js';
import { prefersReducedMotion } from './utils.js';

export function init() {
  if (!config.features.cursor || prefersReducedMotion() || !matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return () => {};
  }

  const root = document.querySelector('[data-custom-cursor]');
  const dot = root?.querySelector('.cursor__dot');
  const ring = root?.querySelector('.cursor__ring');
  const label = root?.querySelector('.cursor__label');
  if (!root || !dot || !ring || !label) return () => {};

  let pointerX = 0;
  let pointerY = 0;
  let ringX = 0;
  let ringY = 0;
  let frameId = 0;

  const animate = () => {
    frameId = 0;
    ringX += (pointerX - ringX) * .15;
    ringY += (pointerY - ringY) * .15;
    dot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    root.classList.add('cursor--visible');
    if (Math.abs(pointerX - ringX) > .5 || Math.abs(pointerY - ringY) > .5) {
      frameId = window.requestAnimationFrame(animate);
    }
  };

  const onPointerMove = (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!frameId) frameId = window.requestAnimationFrame(animate);
  };

  const onPointerOver = (event) => {
    const target = event.target.closest('[data-cursor]');
    if (!target) return;
    label.textContent = target.dataset.cursor;
    ring.classList.add('cursor__ring--labelled');
  };

  const onPointerOut = (event) => {
    const previous = event.target.closest('[data-cursor]');
    const next = event.relatedTarget instanceof Element ? event.relatedTarget.closest('[data-cursor]') : null;
    if (!previous || previous === next) return;
    if (next) label.textContent = next.dataset.cursor;
    else {
      label.textContent = '';
      ring.classList.remove('cursor__ring--labelled');
    }
  };

  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerover', onPointerOver, { passive: true });
  document.addEventListener('pointerout', onPointerOut, { passive: true });

  return function destroy() {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerover', onPointerOver);
    document.removeEventListener('pointerout', onPointerOut);
    if (frameId) window.cancelAnimationFrame(frameId);
    root.classList.remove('cursor--visible');
    ring.classList.remove('cursor__ring--labelled');
    label.textContent = '';
    dot.style.removeProperty('transform');
    ring.style.removeProperty('transform');
  };
}
