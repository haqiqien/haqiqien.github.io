import { roles } from './data.js';
import { prefersReducedMotion } from './utils.js';

const ROTATION_DELAY = 2500;

export function init() {
  const target = document.querySelector('[data-role-word]');
  if (!target || roles.length < 2 || prefersReducedMotion()) return () => {};

  let index = Math.max(0, roles.indexOf(target.textContent));
  let timeoutId = 0;

  const scheduleNext = () => {
    window.clearTimeout(timeoutId);
    if (document.hidden) return;
    timeoutId = window.setTimeout(() => {
      index = (index + 1) % roles.length;
      target.textContent = roles[index];
      scheduleNext();
    }, ROTATION_DELAY);
  };

  const onVisibilityChange = () => {
    if (document.hidden) window.clearTimeout(timeoutId);
    else scheduleNext();
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  scheduleNext();

  return function destroy() {
    window.clearTimeout(timeoutId);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}
