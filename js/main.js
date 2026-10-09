import { init as initTheme } from './theme.js';
import { init as initNav } from './nav.js';
import { init as initRender } from './render.js';
import { init as initReveal } from './reveal.js';
import { init as initRoles } from './roles.js';
import { init as initHeroCanvas } from './hero-canvas.js';
import { init as initCursor } from './cursor.js';
import { init as initMagnetic } from './magnetic.js';
import { init as initTilt } from './tilt.js';
import { config } from './config.js';
import { init as initGithub } from './github.js';
import { init as initDialog } from './dialog.js';
import { init as initStickers } from './stickers.js';
import { init as initContact } from './contact.js';

initTheme();
initRender();
initNav();
const destroyContact = initContact();
window.addEventListener('pagehide', destroyContact, { once: true });
const KONAMI_SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;
let terminalModulePromise;
let destroyTerminal = null;
let gameModulePromise;
let destroyGame = null;
const terminalSupported = typeof HTMLDialogElement !== 'undefined'
  && typeof HTMLDialogElement.prototype.showModal === 'function';
const requestTerminal = async () => {
  if (!config.features.terminal || !terminalSupported) return;
  try {
    const terminal = await (terminalModulePromise ||= import('./terminal.js'));
    if (!destroyTerminal) {
      destroyTerminal = terminal.init();
      window.addEventListener('pagehide', destroyTerminal, { once: true });
    }
    document.dispatchEvent(new Event('portfolio:terminal-open'));
  } catch {
    // The rest of the page remains usable if the optional module cannot load.
  }
};
const onTerminalRequest = () => requestTerminal();
const requestGame = async () => {
  if (!config.features.game || !terminalSupported) return;
  try {
    const game = await (gameModulePromise ||= import('./game.js'));
    if (!destroyGame) {
      destroyGame = game.init();
      window.addEventListener('pagehide', destroyGame, { once: true });
    }
    document.dispatchEvent(new Event('portfolio:game-open'));
  } catch {
    // Optional game failure must not affect the rest of the page.
  }
};
if (config.features.game && terminalSupported) {
  document.addEventListener('portfolio:open-game', requestGame);
  window.addEventListener('pagehide', () => document.removeEventListener('portfolio:open-game', requestGame), { once: true });
}
const onKonamiKey = (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLElement
    && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
  if (isTyping || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (key === KONAMI_SEQUENCE[konamiIndex]) konamiIndex += 1;
  else konamiIndex = key === KONAMI_SEQUENCE[0] ? 1 : 0;
  if (konamiIndex === KONAMI_SEQUENCE.length) {
    konamiIndex = 0;
    document.dispatchEvent(new Event('portfolio:open-terminal'));
  }
};
if (config.features.terminal && terminalSupported) {
  document.addEventListener('portfolio:open-terminal', onTerminalRequest);
  document.addEventListener('keydown', onKonamiKey);
  window.addEventListener('pagehide', () => {
    document.removeEventListener('portfolio:open-terminal', onTerminalRequest);
    document.removeEventListener('keydown', onKonamiKey);
  }, { once: true });
}
let paletteModulePromise;
let destroyPalette = null;
const requestPalette = async () => {
  if (!config.features.palette) return;
  if (typeof HTMLDialogElement === 'undefined' || typeof HTMLDialogElement.prototype.showModal !== 'function') return;
  try {
    const palette = await (paletteModulePromise ||= import('./palette.js'));
    if (!destroyPalette) {
      destroyPalette = palette.init();
      window.addEventListener('pagehide', destroyPalette, { once: true });
    }
    document.dispatchEvent(new Event('portfolio:palette-open'));
  } catch {
    // The rest of the page remains usable if the optional module cannot load.
  }
};
const paletteTrigger = document.querySelector('[data-palette-trigger]');
const onPaletteTrigger = () => requestPalette();
const onPaletteShortcut = (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLElement
    && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
  const commandShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
  const slashShortcut = event.key === '/' && !isTyping && !event.ctrlKey && !event.metaKey && !event.altKey;
  if (!commandShortcut && !slashShortcut) return;
  event.preventDefault();
  requestPalette();
};
if (config.features.palette) {
  paletteTrigger?.addEventListener('click', onPaletteTrigger);
  document.addEventListener('keydown', onPaletteShortcut);
  window.addEventListener('pagehide', () => {
    paletteTrigger?.removeEventListener('click', onPaletteTrigger);
    document.removeEventListener('keydown', onPaletteShortcut);
  }, { once: true });
}
if (config.features.stickers) {
  const destroyStickers = initStickers();
  window.addEventListener('pagehide', destroyStickers, { once: true });
}
const destroyDialog = initDialog();
window.addEventListener('pagehide', destroyDialog, { once: true });
const destroyGithub = initGithub();
window.addEventListener('pagehide', destroyGithub, { once: true });
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let destroyReveal = () => {};
let destroyRoles = () => {};
let destroyHeroCanvas = () => {};
let destroyPointerEffects = () => {};

const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

const configurePointerEffects = () => {
  destroyPointerEffects();
  destroyPointerEffects = () => {};
  if (reducedMotion.matches || !finePointer.matches) return;

  const cleanups = [];
  if (config.features.cursor) cleanups.push(initCursor());
  if (config.features.magnetic) cleanups.push(initMagnetic());
  if (config.features.tilt) cleanups.push(initTilt());
  destroyPointerEffects = () => cleanups.forEach((destroy) => destroy());
};

const configureMotion = () => {
  destroyReveal();
  destroyRoles();
  destroyHeroCanvas();
  destroyReveal = () => {};
  destroyRoles = () => {};
  destroyHeroCanvas = initHeroCanvas({ reducedMotion: reducedMotion.matches });
  if (!reducedMotion.matches) {
    destroyReveal = initReveal();
    destroyRoles = initRoles();
  }
};

configureMotion();
configurePointerEffects();
reducedMotion.addEventListener('change', () => {
  configureMotion();
  configurePointerEffects();
});
finePointer.addEventListener('change', configurePointerEffects);
