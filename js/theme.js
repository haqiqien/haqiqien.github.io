const THEME_KEY = 'portfolio-theme';

function getSystemTheme() {
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getSavedTheme() {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    return theme === 'light' || theme === 'dark' ? theme : null;
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // The theme still works for this visit if storage is unavailable.
  }
}

export function init() {
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return () => {};

  const systemPreference = matchMedia('(prefers-color-scheme: light)');
  let hasSavedChoice = Boolean(getSavedTheme());

  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    button.textContent = theme === 'dark' ? 'Mode terang' : 'Mode gelap';
    button.setAttribute('aria-label', theme === 'dark' ? 'Mode terang — ganti tema' : 'Mode gelap — ganti tema');
    document.dispatchEvent(new CustomEvent('portfolio:theme-changed', { detail: { theme } }));
  };

  applyTheme(getSavedTheme() || getSystemTheme());

  const onClick = () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    hasSavedChoice = true;
    saveTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const onSystemChange = (event) => {
    if (!hasSavedChoice) applyTheme(event.matches ? 'light' : 'dark');
  };

  button.addEventListener('click', onClick);
  systemPreference.addEventListener('change', onSystemChange);

  return function destroy() {
    button.removeEventListener('click', onClick);
    systemPreference.removeEventListener('change', onSystemChange);
  };
}
