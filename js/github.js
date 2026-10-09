import { config } from './config.js';
import { prefersReducedMotion } from './utils.js';

const CACHE_KEY = 'portfolio-github-cache';
const CACHE_TTL = 30 * 60 * 1000;
const REQUEST_TIMEOUT = 8000;

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function safeHttpsUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function readCache(username) {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    if (cached?.username === username && Date.now() - cached.ts < CACHE_TTL && cached.profile && Array.isArray(cached.repos)) {
      return { profile: cached.profile, repos: cached.repos };
    }
  } catch {
    // A broken or unavailable cache should fall through to the network request.
  }
  return null;
}

function writeCache(username, data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ username, ts: Date.now(), ...data }));
  } catch {
    // Live data is still rendered when session storage is blocked or full.
  }
}

async function fetchJson(url, signal) {
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json' },
      signal
    });
    if (!response.ok) throw new Error('GitHub response was not successful.');
    return await response.json();
  } catch {
    throw new Error('GitHub data could not be loaded.');
  }
}

function sortedRepos(repos) {
  return repos
    .filter((repo) => repo && !repo.fork && !repo.archived)
    .sort((a, b) => {
      const stars = (Number(b.stargazers_count ?? b.stars) || 0) - (Number(a.stargazers_count ?? a.stars) || 0);
      if (stars) return stars;
      return (Date.parse(b.pushed_at || '') || 0) - (Date.parse(a.pushed_at || '') || 0);
    });
}

function showSkeleton(container) {
  container.setAttribute('aria-busy', 'true');
  const cards = Array.from({ length: 4 }, () => {
    const card = document.createElement('article');
    card.className = 'github-card github-card--skeleton';
    card.setAttribute('aria-hidden', 'true');
    card.append(document.createElement('span'), document.createElement('span'), document.createElement('span'));
    return card;
  });
  container.replaceChildren(...cards);
}

function renderStats(profile, container, countTargets) {
  const stats = document.createElement('dl');
  stats.className = 'github-stats';
  const values = [
    ['Repositori publik', profile.public_repos],
    ['Pengikut', profile.followers]
  ];

  for (const [label, rawValue] of values) {
    const row = document.createElement('div');
    row.className = 'github-stats__item';
    const term = textElement('dt', 'github-stats__label', label);
    const definition = document.createElement('dd');
    definition.className = 'github-stats__value';
    const value = Number.isFinite(Number(rawValue)) && rawValue !== null ? Math.max(0, Number(rawValue)) : null;
    const number = textElement('span', '', value === null ? '—' : prefersReducedMotion() ? String(value) : '0');
    if (value !== null && !prefersReducedMotion()) {
      number.dataset.countTo = String(value);
      countTargets.push(number);
    }
    definition.append(number);
    row.append(term, definition);
    stats.append(row);
  }
  container.append(stats);
}

function renderProfile(profile, container, countTargets) {
  const identity = document.createElement('div');
  identity.className = 'github-profile__identity';
  const avatarUrl = safeHttpsUrl(profile.avatar_url || profile.avatarUrl);
  if (avatarUrl) {
    const avatar = document.createElement('img');
    avatar.className = 'github-profile__avatar';
    avatar.setAttribute('src', avatarUrl);
    avatar.width = 64;
    avatar.height = 64;
    avatar.loading = 'lazy';
    avatar.alt = '';
    identity.append(avatar);
  }

  const name = textElement('h3', 'github-profile__name', profile.name || profile.displayName || profile.login || 'Profil GitHub');
  identity.append(name);
  if (profile.login) identity.append(textElement('p', 'github-profile__login', `@${profile.login}`));
  const profileUrl = safeHttpsUrl(profile.html_url || profile.url);
  if (profileUrl) {
    const link = textElement('a', 'github-profile__link', 'Buka profil GitHub');
    link.setAttribute('href', profileUrl);
    link.rel = 'noopener noreferrer';
    identity.append(link);
  }
  container.replaceChildren(identity);
  renderStats(profile, container, countTargets);
}

function renderRepos(repos, container) {
  const selected = sortedRepos(repos).slice(0, 6);
  if (!selected.length) {
    container.replaceChildren(textElement('p', 'github__empty', 'Belum ada data repositori untuk ditampilkan.'));
    container.removeAttribute('aria-busy');
    return;
  }

  const cards = selected.map((repo) => {
    const card = document.createElement('article');
    card.className = 'github-card';
    const title = textElement('h3', 'github-card__title', repo.name || 'Repositori');
    const url = safeHttpsUrl(repo.html_url || repo.url);
    if (url) {
      const link = textElement('a', '', repo.name || 'Repositori');
      link.setAttribute('href', url);
      link.rel = 'noopener noreferrer';
      title.replaceChildren(link);
    }
    card.append(title);
    card.append(textElement('p', 'github-card__description', repo.description || 'Tidak ada deskripsi.'));
    const metadata = document.createElement('p');
    metadata.className = 'github-card__meta';
    const language = repo.language || 'Bahasa tidak dicantumkan';
    const stars = Math.max(0, Number(repo.stargazers_count ?? repo.stars) || 0);
    metadata.textContent = `${language} · ★ ${stars}`;
    card.append(metadata);
    return card;
  });
  container.replaceChildren(...cards);
  container.removeAttribute('aria-busy');
}

function languageSummary(repos, container) {
  const counts = new Map();
  for (const repo of repos) {
    const language = repo.language;
    if (language) counts.set(language, (counts.get(language) || 0) + 1);
  }
  const ranked = [...counts].sort((a, b) => b[1] - a[1]);
  if (!ranked.length) {
    container.replaceChildren();
    return;
  }

  const total = ranked.reduce((sum, [, count]) => sum + count, 0);
  const visible = ranked.slice(0, 5);
  const remaining = ranked.slice(5).reduce((sum, [, count]) => sum + count, 0);
  if (remaining) visible.push(['Lainnya', remaining]);

  const bar = document.createElement('div');
  bar.className = 'language-bar';
  bar.setAttribute('aria-hidden', 'true');
  for (const [, count] of visible) {
    const segment = document.createElement('span');
    segment.className = 'language-bar__segment';
    segment.style.flexBasis = `${(count / total) * 100}%`;
    bar.append(segment);
  }

  const legend = document.createElement('ul');
  legend.className = 'language-legend';
  legend.setAttribute('aria-label', 'Distribusi bahasa repositori');
  for (const [language, count] of visible) {
    const item = textElement('li', 'language-legend__item', `${language}: ${Math.round((count / total) * 100)}%`);
    legend.append(item);
  }
  container.replaceChildren(textElement('h3', 'github__subheading', 'Bahasa repositori'), bar, legend);
}

function runCountUp(targets) {
  if (!targets.length) return () => {};
  let observer = null;
  const frames = new Map();
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const animateTarget = (target) => {
    const finalValue = Number(target.dataset.countTo);
    if (!Number.isFinite(finalValue)) return;
    if (motionPreference.matches) {
      target.textContent = String(finalValue);
      return;
    }
    const startTime = performance.now();
    const duration = 700;
    const update = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      target.textContent = String(Math.round(finalValue * progress));
      if (progress < 1) frames.set(target, requestAnimationFrame(update));
      else frames.delete(target);
    };
    frames.set(target, requestAnimationFrame(update));
  };

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries, activeObserver) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        animateTarget(entry.target);
        activeObserver.unobserve(entry.target);
      }
    }, { threshold: .5 });
    targets.forEach((target) => observer.observe(target));
  } else {
    targets.forEach(animateTarget);
  }

  const onMotionChange = (event) => {
    if (!event.matches) return;
    for (const target of targets) {
      const frame = frames.get(target);
      if (frame) cancelAnimationFrame(frame);
      target.textContent = target.dataset.countTo;
    }
    frames.clear();
    observer?.disconnect();
  };
  motionPreference.addEventListener('change', onMotionChange);

  return function destroyCountUp() {
    observer?.disconnect();
    motionPreference.removeEventListener('change', onMotionChange);
    for (const frame of frames.values()) cancelAnimationFrame(frame);
    frames.clear();
  };
}

export function init() {
  const profileContainer = document.querySelector('[data-github-profile]');
  const reposContainer = document.querySelector('[data-github-repos]');
  const languagesContainer = document.querySelector('[data-github-languages]');
  const notice = document.querySelector('[data-github-notice]');
  if (!profileContainer || !reposContainer || !languagesContainer || !notice) return () => {};

  const fallback = config.githubFallback || {};
  const username = String(config.githubUsername || '').trim();
  let destroyed = false;
  let timeoutId = 0;
  let controller = null;
  let destroyCountUp = () => {};
  let countTargets = [];

  const render = (profile, repos, message = '') => {
    if (destroyed) return;
    destroyCountUp();
    countTargets = [];
    notice.textContent = message;
    renderProfile(profile || fallback, profileContainer, countTargets);
    renderRepos(Array.isArray(repos) ? repos : fallback.repos || [], reposContainer);
    languageSummary(Array.isArray(repos) ? repos : fallback.repos || [], languagesContainer);
    destroyCountUp = runCountUp(countTargets);
  };

  if (!username) {
    render(fallback, fallback.repos || [], 'Username GitHub belum diisi. Tambahkan username pada js/config.js untuk menampilkan data langsung.');
    return () => {
      destroyed = true;
      destroyCountUp();
    };
  }

  const cached = readCache(username);
  if (cached) {
    render(cached.profile, cached.repos);
    return () => {
      destroyed = true;
      destroyCountUp();
    };
  }

  showSkeleton(reposContainer);
  notice.textContent = 'Memuat aktivitas publik dari GitHub…';
  controller = new AbortController();
  timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  const encodedUsername = encodeURIComponent(username);
  Promise.all([
    fetchJson(`https://api.github.com/users/${encodedUsername}`, controller.signal),
    fetchJson(`https://api.github.com/users/${encodedUsername}/repos?per_page=100&sort=updated`, controller.signal)
  ]).then(([profile, repos]) => {
    const normalizedRepos = sortedRepos(repos).map((repo) => ({ ...repo }));
    const data = { profile, repos: normalizedRepos };
    writeCache(username, data);
    render(profile, normalizedRepos);
  }).catch(() => {
    render(fallback, fallback.repos || [], 'Data GitHub langsung tidak dapat dimuat. Menampilkan data cadangan jika tersedia.');
  }).finally(() => {
    window.clearTimeout(timeoutId);
    reposContainer.removeAttribute('aria-busy');
  });

  return function destroy() {
    destroyed = true;
    controller?.abort();
    window.clearTimeout(timeoutId);
    destroyCountUp();
  };
}
