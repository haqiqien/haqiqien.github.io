import { prefersReducedMotion } from './utils.js';

export function init() {
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return () => {};

  const candidates = document.querySelectorAll('.section .container > *, .project-card, .skill-group, .hobby-card');
  const supported = [...candidates].filter((element) => element instanceof HTMLElement);
  if (!supported.length) return () => {};

  const siblingOrder = new Map();
  for (const element of supported) {
    const parent = element.parentElement;
    const order = siblingOrder.get(parent) || 0;
    siblingOrder.set(parent, order + 1);
    element.dataset.reveal = '';
    element.style.setProperty('--reveal-delay', `${Math.min(order, 5) * 60}ms`);
  }

  document.documentElement.classList.add('reveal-ready');

  const observer = new IntersectionObserver((entries, activeObserver) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.dataset.revealed = '';
      activeObserver.unobserve(entry.target);
    }
  }, { threshold: 0.15 });

  for (const element of supported) observer.observe(element);

  return function destroy() {
    observer.disconnect();
    document.documentElement.classList.remove('reveal-ready');
    for (const element of supported) {
      delete element.dataset.reveal;
      delete element.dataset.revealed;
      element.style.removeProperty('--reveal-delay');
    }
  };
}
