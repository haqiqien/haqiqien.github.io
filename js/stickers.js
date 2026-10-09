const DRAG_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 768px)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function init() {
  const playground = document.querySelector('[data-hobbies]');
  if (!playground) return () => {};

  const dragMedia = matchMedia(DRAG_QUERY);
  const reducedMedia = matchMedia(REDUCED_QUERY);
  const cards = [...playground.querySelectorAll('[data-sticker-card]')];
  const states = new Map();
  let dragging = null;
  let frame = 0;
  let dragEnabled = false;
  let inView = true;
  let destroyed = false;
  let measuredWidth = 0;

  const stopFrame = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  const paint = (card, state) => {
    card.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) rotate(${state.rotation + state.angle}deg)`;
  };

  const bounds = (state) => {
    const maxX = Math.max(0, playground.clientWidth - state.width);
    const maxY = Math.max(0, playground.clientHeight - state.height);
    state.x = clamp(state.x, 0, maxX);
    state.y = clamp(state.y, 0, maxY);
  };

  const measureGrid = () => {
    playground.classList.remove('hobby-grid--playground');
    for (const card of cards) card.removeAttribute('style');
    const host = playground.getBoundingClientRect();
    const rects = cards.map((card) => card.getBoundingClientRect());
    const height = Math.max(0, ...rects.map((rect) => rect.bottom - host.top));
    playground.style.height = `${height}px`;
    playground.classList.add('hobby-grid--playground');
    cards.forEach((card, index) => {
      const rect = rects[index];
      const state = states.get(card);
      state.width = rect.width;
      state.height = rect.height;
      state.x = rect.left - host.left;
      state.y = rect.top - host.top;
      state.vx = 0;
      state.vy = 0;
      card.style.left = `${state.x}px`;
      card.style.top = `${state.y}px`;
      card.style.width = `${state.width}px`;
      card.style.height = `${state.height}px`;
      paint(card, state);
    });
    measuredWidth = playground.getBoundingClientRect().width;
  };

  const restoreGrid = () => {
    playground.classList.remove('hobby-grid--playground');
    playground.style.removeProperty('height');
    for (const card of cards) {
      card.removeAttribute('style');
      const state = states.get(card);
      state.x = 0;
      state.y = 0;
      state.vx = 0;
      state.vy = 0;
    }
  };

  const animate = () => {
    frame = 0;
    if (destroyed || !inView || document.hidden || !dragEnabled) return;
    let moving = false;
    for (const [card, state] of states) {
      if (dragging?.card === card) continue;
      state.vx *= 0.92;
      state.vy *= 0.92;
      if (Math.abs(state.vx) < 0.08) state.vx = 0;
      if (Math.abs(state.vy) < 0.08) state.vy = 0;
      if (!state.vx && !state.vy) continue;
      state.x += state.vx;
      state.y += state.vy;
      const oldX = state.x;
      const oldY = state.y;
      bounds(state);
      if (oldX !== state.x) state.vx *= -0.35;
      if (oldY !== state.y) state.vy *= -0.35;
      paint(card, state);
      if (state.vx || state.vy) moving = true;
    }
    if (moving) frame = requestAnimationFrame(animate);
  };

  const schedule = () => {
    if (!frame && !document.hidden && inView && dragEnabled) frame = requestAnimationFrame(animate);
  };

  const flip = (card, open) => {
    const front = card.querySelector('[data-sticker]');
    const back = card.querySelector('.hobby-card__back');
    if (!front || !back || (back.hidden === !open)) return;
    front.hidden = open;
    back.hidden = !open;
    front.setAttribute('aria-pressed', String(open));
    card.classList.toggle('hobby-card--flipped', open);
    (open ? card.querySelector('[data-sticker-back]') : front)?.focus();
  };

  const onClick = (event) => {
    const front = event.target.closest('[data-sticker]');
    const back = event.target.closest('[data-sticker-back]');
    if (front) flip(front.closest('[data-sticker-card]'), true);
    if (back) flip(back.closest('[data-sticker-card]'), false);
  };

  const onKeydown = (event) => {
    const front = event.target.closest('[data-sticker]');
    const card = event.target.closest('[data-sticker-card]');
    if (!card) return;
    if (event.key === 'Escape' && card.classList.contains('hobby-card--flipped')) {
      event.preventDefault();
      flip(card, false);
      return;
    }
    if (!front || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const state = states.get(card);
    const step = 12;
    if (dragEnabled) {
      state.x += event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
      state.y += event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
      bounds(state);
      paint(card, state);
    } else {
      state.x = clamp(state.x + (event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0), -step * 4, step * 4);
      state.y = clamp(state.y + (event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0), -step * 4, step * 4);
      card.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
    }
  };

  const onPointerDown = (event) => {
    if (!dragEnabled || event.button !== 0) return;
    const front = event.target.closest('[data-sticker]');
    const card = front?.closest('[data-sticker-card]');
    if (!card) return;
    stopFrame();
    const state = states.get(card);
    dragging = { card, state, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastY: event.clientY, moved: false };
    state.vx = state.vy = 0;
    front.setPointerCapture(event.pointerId);
    card.classList.add('hobby-card--dragging');
  };

  const onPointerMove = (event) => {
    if (!dragging || event.pointerId !== dragging.pointerId) return;
    const { card, state } = dragging;
    const dx = event.clientX - dragging.lastX;
    const dy = event.clientY - dragging.lastY;
    if (Math.abs(event.clientX - dragging.startX) + Math.abs(event.clientY - dragging.startY) > 5) dragging.moved = true;
    state.x += dx;
    state.y += dy;
    state.vx = dx;
    state.vy = dy;
    bounds(state);
    dragging.lastX = event.clientX;
    dragging.lastY = event.clientY;
    paint(card, state);
  };

  const onPointerUp = (event) => {
    if (!dragging || event.pointerId !== dragging.pointerId) return;
    const { card, state, moved } = dragging;
    dragging = null;
    card.classList.remove('hobby-card--dragging');
    if (moved) {
      state.skipClick = true;
      requestAnimationFrame(() => { state.skipClick = false; });
      schedule();
    }
  };

  const onClickCapture = (event) => {
    const front = event.target.closest('[data-sticker]');
    const state = front && states.get(front.closest('[data-sticker-card]'));
    if (state?.skipClick) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  const onVisibility = () => {
    if (document.hidden) stopFrame();
    else schedule();
  };

  const updateMode = () => {
    const next = dragMedia.matches && !reducedMedia.matches;
    if (next === dragEnabled) return;
    dragEnabled = next;
    stopFrame();
    if (dragEnabled) measureGrid();
    else restoreGrid();
  };

  cards.forEach((card, index) => states.set(card, { x: 0, y: 0, vx: 0, vy: 0, width: 0, height: 0, rotation: [-4, 3, -2, 5][index % 4], angle: 0 }));
  playground.addEventListener('click', onClick);
  playground.addEventListener('click', onClickCapture, true);
  playground.addEventListener('keydown', onKeydown);
  playground.addEventListener('pointerdown', onPointerDown);
  playground.addEventListener('pointermove', onPointerMove, { passive: true });
  playground.addEventListener('pointerup', onPointerUp);
  playground.addEventListener('pointercancel', onPointerUp);
  document.addEventListener('visibilitychange', onVisibility);
  dragMedia.addEventListener('change', updateMode);
  reducedMedia.addEventListener('change', updateMode);
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (!inView) stopFrame();
    else schedule();
  }) : null;
  observer?.observe(playground);
  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(([entry]) => {
    const width = entry.contentRect.width;
    // Measuring changes the playground's height; only a width change needs a new layout.
    if (dragEnabled && !dragging && Math.abs(width - measuredWidth) > 0.5) measureGrid();
  }) : null;
  resizeObserver?.observe(playground);
  updateMode();

  return function destroy() {
    destroyed = true;
    stopFrame();
    observer?.disconnect();
    resizeObserver?.disconnect();
    playground.removeEventListener('click', onClick);
    playground.removeEventListener('click', onClickCapture, true);
    playground.removeEventListener('keydown', onKeydown);
    playground.removeEventListener('pointerdown', onPointerDown);
    playground.removeEventListener('pointermove', onPointerMove);
    playground.removeEventListener('pointerup', onPointerUp);
    playground.removeEventListener('pointercancel', onPointerUp);
    document.removeEventListener('visibilitychange', onVisibility);
    dragMedia.removeEventListener('change', updateMode);
    reducedMedia.removeEventListener('change', updateMode);
    restoreGrid();
  };
}
