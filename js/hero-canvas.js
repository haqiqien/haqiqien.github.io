const MAX_PARTICLES = 90;
const MAX_CONNECTION = 120;
const POINTER_RADIUS = 140;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function readColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    muted: styles.getPropertyValue('--text-muted').trim(),
    accent: styles.getPropertyValue('--accent').trim(),
    accent2: styles.getPropertyValue('--accent-2').trim()
  };
}

function createParticle(width, height, color, burst = false, x = randomBetween(0, width), y = randomBetween(0, height)) {
  const angle = randomBetween(0, Math.PI * 2);
  const speed = burst ? randomBetween(1.1, 2.8) : randomBetween(.12, .4);
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: burst ? randomBetween(1.5, 3) : randomBetween(1, 2),
    color,
    life: burst ? 1 : 0,
    burst
  };
}

export function init({ reducedMotion = false } = {}) {
  const canvas = document.querySelector('[data-hero-canvas]');
  const hero = document.querySelector('#hero');
  const context = canvas?.getContext('2d');
  if (!canvas || !hero || !context) return () => {};

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let colors = readColors();
  let pointer = { x: 0, y: 0, active: false, touch: false };
  let visible = false;
  let rafId = 0;
  let resizeTimer = 0;
  let previousTime = 0;
  let destroyed = false;

  const particleTarget = () => {
    const area = width * height;
    const desired = Math.floor(area / 14000);
    const isSmall = matchMedia('(max-width: 767px)').matches;
    return Math.max(12, Math.min(isSmall ? 40 : MAX_PARTICLES, desired));
  };

  const resize = () => {
    const rect = hero.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = particleTarget();
    particles = Array.from({ length: target }, (_, index) => {
      const color = index % 13 === 0 ? colors.accent2 : index % 7 === 0 ? colors.accent : colors.muted;
      return createParticle(width, height, color);
    });
    draw();
  };

  const draw = () => {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j += 1) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);
        if (distance >= MAX_CONNECTION) continue;
        context.globalAlpha = (1 - distance / MAX_CONNECTION) * .18;
        context.strokeStyle = a.color;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
      context.globalAlpha = a.burst ? Math.max(0, a.life) * .8 : .55;
      context.fillStyle = a.color;
      context.beginPath();
      context.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  };

  const animate = (time) => {
    rafId = 0;
    if (destroyed || !visible || document.hidden || reducedMotion) return;
    const delta = previousTime ? Math.min((time - previousTime) / 16.67, 2) : 1;
    previousTime = time;

    for (const particle of particles) {
      if (pointer.active) {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < POINTER_RADIUS) {
          const strength = (1 - distance / POINTER_RADIUS) * (pointer.touch ? -.01 : .025);
          particle.vx += (dx / distance) * strength * delta;
          particle.vy += (dy / distance) * strength * delta;
        }
      }

      particle.vx *= particle.burst ? .985 : .995;
      particle.vy *= particle.burst ? .985 : .995;
      const speed = Math.hypot(particle.vx, particle.vy);
      const maxSpeed = particle.burst ? 3 : .65;
      if (speed > maxSpeed) {
        particle.vx = (particle.vx / speed) * maxSpeed;
        particle.vy = (particle.vy / speed) * maxSpeed;
      }
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      if (particle.x < 0) particle.x += width;
      if (particle.x > width) particle.x -= width;
      if (particle.y < 0) particle.y += height;
      if (particle.y > height) particle.y -= height;
      if (particle.burst) particle.life -= .012 * delta;
    }

    particles = particles.filter((particle) => !particle.burst || particle.life > 0);
    draw();
    rafId = window.requestAnimationFrame(animate);
  };

  const start = () => {
    if (rafId || destroyed || !visible || document.hidden || reducedMotion) return;
    previousTime = 0;
    rafId = window.requestAnimationFrame(animate);
  };

  const stop = () => {
    if (!rafId) return;
    window.cancelAnimationFrame(rafId);
    rafId = 0;
  };

  const setPointer = (event) => {
    const rect = hero.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  };

  const onPointerMove = (event) => {
    if (event.pointerType === 'touch') {
      if (pointer.touch) setPointer(event);
      return;
    }
    setPointer(event);
    pointer.active = true;
    pointer.touch = false;
  };

  const onPointerDown = (event) => {
    if (event.pointerType !== 'touch') return;
    setPointer(event);
    pointer.active = true;
    pointer.touch = true;
  };

  const onPointerEnd = (event) => {
    if (event.pointerType === 'touch') {
      pointer.active = false;
      pointer.touch = false;
    }
  };

  const onPointerLeave = (event) => {
    if (event.pointerType !== 'touch') pointer.active = false;
  };

  const onClick = (event) => {
    if (reducedMotion) return;
    if (event.target.closest('a, button, input, textarea, select')) return;
    setPointer(event);
    const burstColors = [colors.accent, colors.accent2];
    const count = Math.floor(randomBetween(6, 9));
    for (let index = 0; index < count; index += 1) {
      if (particles.length >= MAX_PARTICLES) {
        const baseIndex = particles.findIndex((particle) => !particle.burst);
        if (baseIndex >= 0) particles.splice(baseIndex, 1);
      }
      particles.push(createParticle(width, height, burstColors[index % burstColors.length], true, pointer.x, pointer.y));
    }
    draw();
    start();
  };

  const onVisibilityChange = () => document.hidden ? stop() : start();
  const onThemeChange = () => {
    colors = readColors();
    resize();
  };
  const onWindowResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 120);
  };

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    }, { threshold: 0 })
    : null;
  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(onWindowResize) : null;

  resize();
  observer?.observe(hero);
  resizeObserver?.observe(hero);
  if (!observer) {
    visible = true;
    start();
  }

  hero.addEventListener('pointermove', onPointerMove, { passive: true });
  hero.addEventListener('pointerdown', onPointerDown, { passive: true });
  hero.addEventListener('pointerup', onPointerEnd, { passive: true });
  hero.addEventListener('pointercancel', onPointerEnd, { passive: true });
  hero.addEventListener('pointerleave', onPointerLeave, { passive: true });
  hero.addEventListener('click', onClick);
  document.addEventListener('visibilitychange', onVisibilityChange);
  document.addEventListener('portfolio:theme-changed', onThemeChange);
  if (!resizeObserver) window.addEventListener('resize', onWindowResize, { passive: true });

  return function destroy() {
    destroyed = true;
    stop();
    observer?.disconnect();
    resizeObserver?.disconnect();
    window.clearTimeout(resizeTimer);
    hero.removeEventListener('pointermove', onPointerMove);
    hero.removeEventListener('pointerdown', onPointerDown);
    hero.removeEventListener('pointerup', onPointerEnd);
    hero.removeEventListener('pointercancel', onPointerEnd);
    hero.removeEventListener('pointerleave', onPointerLeave);
    hero.removeEventListener('click', onClick);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    document.removeEventListener('portfolio:theme-changed', onThemeChange);
    window.removeEventListener('resize', onWindowResize);
  };
}
