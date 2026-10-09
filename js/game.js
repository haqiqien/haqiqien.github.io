const DURATION = 30;
const BEST_KEY = 'portfolio-bug-catcher-best';

export function init() {
  const dialog = document.querySelector('[data-bug-game]');
  const canvas = dialog?.querySelector('[data-game-board]');
  const context = canvas?.getContext('2d');
  const closeButton = dialog?.querySelector('[data-game-close]');
  const catchButton = dialog?.querySelector('[data-game-catch]');
  const restartButton = dialog?.querySelector('[data-game-restart]');
  const scoreOutput = dialog?.querySelector('[data-game-score]');
  const timeOutput = dialog?.querySelector('[data-game-time]');
  const bestOutput = dialog?.querySelector('[data-game-best]');
  const status = dialog?.querySelector('[data-game-status]');
  if (!dialog || !canvas || !context || !closeButton || !catchButton || !restartButton || !scoreOutput || !timeOutput || !bestOutput || !status) return () => {};

  const returnFocus = document.querySelector('[data-palette-trigger]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motion.matches;
  let visible = !('IntersectionObserver' in window);
  let width = 0;
  let height = 0;
  let score = 0;
  let best = 0;
  let elapsed = 0;
  let lastFrame = 0;
  let lastSpawn = 0;
  let lastSecond = DURATION;
  let frame = 0;
  let bugs = [];
  let active = false;

  try {
    best = Math.max(0, Number(localStorage.getItem(BEST_KEY)) || 0);
  } catch {
    best = 0;
  }
  bestOutput.textContent = String(best);

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    width = bounds.width;
    height = bounds.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  };

  const draw = () => {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    context.font = '28px system-ui, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    bugs.forEach((bug) => context.fillText('🐛', bug.x, bug.y));
  };

  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const spawn = (initial = false) => {
    if (bugs.length >= 8) return;
    bugs.push({
      x: initial || reducedMotion ? 24 + Math.random() * Math.max(1, width - 48) : -24,
      y: 20 + Math.random() * Math.max(1, height - 40),
      speed: 55 + Math.random() * 65
    });
  };

  const finish = () => {
    stop();
    active = false;
    if (score > best) {
      best = score;
      bestOutput.textContent = String(best);
      try {
        localStorage.setItem(BEST_KEY, String(best));
      } catch {
        // The score remains available for this page view if storage is blocked.
      }
    }
    status.textContent = `Waktu habis. Skor akhir ${score}; rekor ${best}.`;
  };

  const tick = (now) => {
    frame = 0;
    if (!active || !dialog.open || document.visibilityState === 'hidden' || !visible) return;
    const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.1) : 0;
    lastFrame = now;
    elapsed += delta;
    if (!reducedMotion) {
      bugs.forEach((bug) => { bug.x += bug.speed * delta; });
      bugs = bugs.filter((bug) => bug.x < width + 28);
      if (elapsed - lastSpawn >= .8) {
        spawn();
        lastSpawn = elapsed;
      }
    }
    draw();
    const remaining = Math.max(0, DURATION - Math.floor(elapsed));
    if (remaining !== lastSecond) {
      lastSecond = remaining;
      timeOutput.textContent = String(remaining);
    }
    if (elapsed >= DURATION) finish();
    else frame = requestAnimationFrame(tick);
  };

  const sync = () => {
    if (!dialog.open || !active || document.visibilityState === 'hidden' || !visible) stop();
    else if (!frame) {
      lastFrame = 0;
      frame = requestAnimationFrame(tick);
    }
  };

  const start = () => {
    stop();
    resize();
    score = 0;
    elapsed = 0;
    lastFrame = 0;
    lastSpawn = 0;
    lastSecond = DURATION;
    bugs = [];
    for (let index = 0; index < 4; index += 1) spawn(true);
    scoreOutput.textContent = '0';
    timeOutput.textContent = String(DURATION);
    status.textContent = reducedMotion ? 'Permainan dimulai. Bug tidak bergerak karena pengaturan reduced motion.' : 'Permainan dimulai. Tangkap bug sebelum keluar dari kanvas.';
    active = true;
    sync();
  };

  const catchBug = (bug) => {
    const index = bugs.indexOf(bug);
    if (index < 0) return;
    bugs.splice(index, 1);
    score += 1;
    scoreOutput.textContent = String(score);
    status.textContent = `Bug tertangkap. Skor ${score}.`;
    draw();
  };

  const onBoardPointer = (event) => {
    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const target = bugs.reduce((closest, bug) => {
      const distance = Math.hypot(bug.x - x, bug.y - y);
      return distance < closest.distance ? { bug, distance } : closest;
    }, { bug: null, distance: 30 });
    if (target.bug) catchBug(target.bug);
  };

  const onCatch = () => {
    if (bugs.length) catchBug(bugs[0]);
    else status.textContent = 'Tidak ada bug di kanvas. Tunggu bug berikutnya.';
  };
  const onCloseClick = () => dialog.close();
  const onOpen = () => {
    if (!dialog.open) {
      dialog.showModal();
    }
    start();
    catchButton.focus();
  };
  const onClose = () => {
    active = false;
    stop();
    returnFocus?.focus();
  };
  const onVisibility = () => sync();
  const onMotionChange = () => {
    reducedMotion = motion.matches;
    if (reducedMotion) bugs.forEach((bug) => { bug.x = Math.max(24, Math.min(width - 24, bug.x)); });
    draw();
  };
  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); })
    : null;
  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
  observer?.observe(canvas);
  resizeObserver?.observe(canvas);
  closeButton.addEventListener('click', onCloseClick);
  catchButton.addEventListener('click', onCatch);
  restartButton.addEventListener('click', start);
  canvas.addEventListener('pointerdown', onBoardPointer, { passive: true });
  dialog.addEventListener('close', onClose);
  document.addEventListener('visibilitychange', onVisibility);
  motion.addEventListener('change', onMotionChange);
  document.addEventListener('portfolio:game-open', onOpen);
  resize();

  return () => {
    stop();
    if (dialog.open) dialog.close();
    observer?.disconnect();
    resizeObserver?.disconnect();
    closeButton.removeEventListener('click', onCloseClick);
    catchButton.removeEventListener('click', onCatch);
    restartButton.removeEventListener('click', start);
    canvas.removeEventListener('pointerdown', onBoardPointer);
    dialog.removeEventListener('close', onClose);
    document.removeEventListener('visibilitychange', onVisibility);
    motion.removeEventListener('change', onMotionChange);
    document.removeEventListener('portfolio:game-open', onOpen);
  };
}
