import { config } from './config.js';

const SECTIONS = [
  ['hero', 'Beranda', 'Beranda, hero, awal'],
  ['projects', 'Proyek', 'Karya, proyek'],
  ['github', 'Aktivitas GitHub', 'GitHub, repositori, kode'],
  ['skills', 'Keahlian', 'Skill, teknologi'],
  ['about', 'Tentang Saya', 'Profil, tentang, pendidikan'],
  ['hobbies', 'Hobi', 'Fotografi, hobi'],
  ['contact', 'Kontak', 'Hubungi, email, kontak']
];

function isEditable(element) {
  return element instanceof HTMLElement
    && (element.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName));
}

export function init() {
  const dialog = document.querySelector('[data-palette]');
  const input = dialog?.querySelector('[role="combobox"]');
  const list = dialog?.querySelector('[role="listbox"]');
  const closeButton = dialog?.querySelector('[data-palette-close]');
  const status = dialog?.querySelector('[data-palette-status]');
  const themeButton = document.querySelector('[data-theme-toggle]');
  if (!dialog || !input || !list || !closeButton || !status) return () => {};
  const terminalEnabled = config.features.terminal
    && typeof HTMLDialogElement !== 'undefined'
    && typeof HTMLDialogElement.prototype.showModal === 'function';

  const commands = [
    ...SECTIONS.map(([id, label, keywords]) => ({
      id: `go-${id}`,
      label: `Buka ${label}`,
      keywords,
      hint: 'Bagian',
      run: () => {
        const section = document.getElementById(id);
        if (section) window.location.hash = id;
      }
    })),
    {
      id: 'toggle-theme', label: 'Ganti tema terang atau gelap', keywords: 'tema tampilan terang gelap', hint: 'Tampilan',
      run: () => themeButton?.click()
    },
    {
      id: 'open-github', label: 'Buka aktivitas GitHub', keywords: 'github profil repositori kode', hint: 'GitHub',
      run: () => {
        if (config.githubUsername) window.open(`https://github.com/${encodeURIComponent(config.githubUsername)}`, '_blank', 'noopener,noreferrer');
        else window.location.hash = 'github';
      }
    },
    {
      id: 'copy-email', label: 'Salin alamat email', keywords: 'salin copy email kontak', hint: config.email,
      run: async () => {
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(config.email);
          } else {
            throw new Error('Clipboard API tidak tersedia');
          }
        } catch {
          let copied = false;
          const temporary = document.createElement('textarea');
          temporary.value = config.email;
          temporary.setAttribute('readonly', '');
          temporary.style.position = 'fixed';
          temporary.style.opacity = '0';
          document.body.append(temporary);
          try {
            temporary.select();
            copied = document.execCommand('copy');
          } catch {
            copied = false;
          } finally {
            temporary.remove();
          }
          if (!copied) throw new Error('Gagal menyalin email');
        }
        status.textContent = 'Alamat email berhasil disalin.';
      }
    },
    ...(terminalEnabled ? [{
      id: 'open-terminal', label: 'Buka terminal interaktif', keywords: 'terminal easter egg perintah', hint: 'Eksperimen',
      run: () => document.dispatchEvent(new Event('portfolio:open-terminal'))
    }] : [])
  ];

  let filtered = commands;
  let activeIndex = 0;
  let returnFocus = null;

  const selectActive = (index) => {
    if (!filtered.length) {
      input.removeAttribute('aria-activedescendant');
      return;
    }
    activeIndex = (index + filtered.length) % filtered.length;
    [...list.querySelectorAll('[role="option"]')].forEach((option, optionIndex) => {
      const selected = optionIndex === activeIndex;
      option.setAttribute('aria-selected', String(selected));
      if (selected) input.setAttribute('aria-activedescendant', option.id);
    });
    list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  };

  const render = () => {
    const query = input.value.trim().toLocaleLowerCase('id');
    filtered = commands.filter((command) => `${command.label} ${command.keywords} ${command.hint}`.toLocaleLowerCase('id').includes(query));
    activeIndex = 0;
    list.replaceChildren();
    input.removeAttribute('aria-activedescendant');
    if (!filtered.length) {
      const empty = document.createElement('li');
      empty.className = 'palette__empty';
      empty.textContent = 'Tidak ada perintah yang cocok.';
      empty.setAttribute('role', 'option');
      empty.setAttribute('aria-selected', 'false');
      list.append(empty);
      input.removeAttribute('aria-activedescendant');
      return;
    }

    filtered.forEach((command, index) => {
      const item = document.createElement('li');
      const option = document.createElement('button');
      const label = document.createElement('span');
      const hint = document.createElement('span');
      item.setAttribute('role', 'presentation');
      option.type = 'button';
      option.className = 'palette__option';
      option.id = `palette-option-${command.id}`;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');
      option.tabIndex = -1;
      label.textContent = command.label;
      hint.className = 'palette__option-hint';
      hint.textContent = command.hint;
      option.append(label, hint);
      option.addEventListener('click', () => execute(index));
      item.append(option);
      list.append(item);
    });
    selectActive(activeIndex);
  };

  const close = () => {
    if (dialog.open) dialog.close();
  };

  const execute = async (index = activeIndex) => {
    const command = filtered[index];
    if (!command) return;
    const keepOpen = command.id === 'copy-email';
    let closed = null;
    if (!keepOpen) {
      if (command.id === 'open-terminal') {
        closed = new Promise((resolve) => dialog.addEventListener('close', resolve, { once: true }));
      }
      close();
    }
    try {
      if (closed) await closed;
      await command.run();
      if (!keepOpen) status.textContent = '';
    } catch {
      status.textContent = 'Tindakan gagal. Coba lagi atau gunakan tautan di halaman.';
    }
  };

  const onInput = () => render();
  const onKeydown = (event) => {
    if (!dialog.open) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectActive(activeIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      selectActive(activeIndex - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      execute();
    } else if (event.key === 'Tab') {
      const focusable = [input, closeButton];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };
  const onOpenRequest = () => {
    if (!dialog.open) {
      returnFocus = document.activeElement;
      dialog.showModal();
    }
    input.setAttribute('aria-expanded', 'true');
    input.value = '';
    status.textContent = '';
    render();
    input.focus();
  };
  const onClose = () => {
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    if (returnFocus instanceof HTMLElement && returnFocus.isConnected) returnFocus.focus();
  };

  input.addEventListener('input', onInput);
  dialog.addEventListener('keydown', onKeydown);
  dialog.addEventListener('close', onClose);
  closeButton.addEventListener('click', close);
  document.addEventListener('portfolio:palette-open', onOpenRequest);

  return function destroy() {
    input.removeEventListener('input', onInput);
    dialog.removeEventListener('keydown', onKeydown);
    dialog.removeEventListener('close', onClose);
    closeButton.removeEventListener('click', close);
    document.removeEventListener('portfolio:palette-open', onOpenRequest);
    if (dialog.open) dialog.close();
    list.replaceChildren();
  };
}
