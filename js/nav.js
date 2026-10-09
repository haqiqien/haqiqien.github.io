export function init() {
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('#primary-navigation');
  const navLinks = [...document.querySelectorAll('[data-nav-link]')];
  const progress = document.querySelector('[data-scroll-progress] > span');
  if (!header || !nav || !toggle || !menu) return () => {};

  nav.classList.add('nav--enhanced');

  const closeMenu = ({ restoreFocus = false } = {}) => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Buka menu navigasi');
    if (restoreFocus) toggle.focus();
  };

  const onToggle = () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Buka menu navigasi' : 'Tutup menu navigasi');
    menu.classList.toggle('is-open', !isOpen);
  };

  const onMenuClick = (event) => {
    if (event.target.closest('a')) closeMenu();
  };

  const onKeydown = (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu({ restoreFocus: true });
    }
  };

  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 12);

  let progressFrame = 0;
  const updateProgress = () => {
    progressFrame = 0;
    if (!progress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const amount = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    progress.style.transform = `scaleX(${amount})`;
  };
  const onScroll = () => {
    updateHeader();
    if (!progressFrame) progressFrame = window.requestAnimationFrame(updateProgress);
  };

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  const visibleSections = new Set();
  const sectionObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleSections.add(entry.target);
        else visibleSections.delete(entry.target);
      }
      const headerLine = header.getBoundingClientRect().bottom;
      const activeSection = [...visibleSections].sort((a, b) => {
        const distanceA = Math.abs(a.getBoundingClientRect().top - headerLine);
        const distanceB = Math.abs(b.getBoundingClientRect().top - headerLine);
        return distanceA - distanceB;
      })[0];
      const activeId = activeSection?.id;
      for (const link of navLinks) {
        if (link.hash === `#${activeId}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 })
    : null;

  sections.forEach((section) => sectionObserver?.observe(section));

  toggle.addEventListener('click', onToggle);
  menu.addEventListener('click', onMenuClick);
  document.addEventListener('keydown', onKeydown);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateHeader();
  updateProgress();

  return function destroy() {
    toggle.removeEventListener('click', onToggle);
    menu.removeEventListener('click', onMenuClick);
    document.removeEventListener('keydown', onKeydown);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    if (progressFrame) window.cancelAnimationFrame(progressFrame);
    sectionObserver?.disconnect();
    nav.classList.remove('nav--enhanced');
    closeMenu();
  };
}
