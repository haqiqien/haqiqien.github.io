import { config } from './config.js';
import { hobbies, projects, skills } from './data.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function createDialog() {
  const dialog = element('dialog', 'terminal');
  dialog.dataset.terminal = '';
  dialog.setAttribute('aria-labelledby', 'terminal-title');
  dialog.setAttribute('aria-describedby', 'terminal-description');

  const panel = element('div', 'terminal__panel');
  const header = element('header', 'terminal__header');
  const heading = element('h2', 'terminal__title', 'Terminal portofolio');
  heading.id = 'terminal-title';
  const closeButton = element('button', 'button button--small button--secondary', 'Tutup');
  closeButton.type = 'button';
  closeButton.dataset.terminalClose = '';
  header.append(heading, closeButton);

  const description = element('p', 'terminal__description', 'Jalankan perintah untuk menjelajahi informasi di halaman ini. Ketik help untuk bantuan.');
  description.id = 'terminal-description';
  const output = element('div', 'terminal__output');
  output.setAttribute('role', 'log');
  output.setAttribute('aria-live', 'polite');
  output.setAttribute('aria-relevant', 'additions text');
  output.setAttribute('aria-label', 'Keluaran terminal');

  const form = element('form', 'terminal__form');
  const label = element('label', 'terminal__label', 'Perintah');
  label.htmlFor = 'terminal-command';
  const inputRow = element('div', 'terminal__input-row');
  const prompt = element('span', 'terminal__prompt', '$');
  prompt.setAttribute('aria-hidden', 'true');
  const input = element('input', 'terminal__input');
  input.id = 'terminal-command';
  input.name = 'command';
  input.type = 'text';
  input.autocomplete = 'off';
  input.autocapitalize = 'off';
  input.spellcheck = false;
  inputRow.append(prompt, input);
  const submit = element('button', 'button button--primary terminal__submit', 'Jalankan');
  submit.type = 'submit';
  form.append(label, inputRow, submit);

  panel.append(header, description, output, form);
  dialog.append(panel);
  return { dialog, closeButton, input, form, output };
}

const knownCommands = 'help, whoami, about, projects, skills, hobbies, contact, theme dark|light, clear, exit';

export function init() {
  if (typeof HTMLDialogElement === 'undefined' || typeof HTMLDialogElement.prototype.showModal !== 'function') return () => {};

  const { dialog, closeButton, input, form, output } = createDialog();
  document.body.append(dialog);
  let returnFocus = null;

  const write = (text, className = '') => {
    const line = element('p', `terminal__line${className ? ` ${className}` : ''}`, text);
    output.append(line);
    output.scrollTop = output.scrollHeight;
  };

  const open = () => {
    if (!dialog.open) {
      returnFocus = document.activeElement;
      dialog.showModal();
      if (!output.childElementCount) write('Terminal siap. Ketik help untuk melihat perintah.', 'terminal__line--system');
    }
    input.focus();
  };

  const close = () => {
    if (dialog.open) dialog.close();
  };

  const run = (rawCommand) => {
    const tokens = rawCommand.trim().split(/\s+/).filter(Boolean);
    const command = tokens[0]?.toLocaleLowerCase('id') || '';
    const argument = tokens[1]?.toLocaleLowerCase('id') || '';
    if (!command) return;

    write(`$ ${rawCommand}`, 'terminal__line--command');
    switch (command) {
      case 'help':
        write(`Perintah tersedia: ${knownCommands}`);
        break;
      case 'whoami':
        write(`${config.name} — ${config.role}`);
        break;
      case 'about': {
        const paragraphs = [...document.querySelectorAll('#about .about__copy p')]
          .map((paragraph) => paragraph.textContent.trim())
          .filter(Boolean);
        write(paragraphs.join('\n\n') || 'Informasi tentang saya belum tersedia.');
        break;
      }
      case 'projects': {
        const available = projects.filter((project) => !project.placeholder);
        write(available.length
          ? available.map((project) => `${project.title}: ${project.summary}`).join('\n')
          : 'Belum ada proyek yang dilengkapi.');
        break;
      }
      case 'skills':
        write(skills.map((group) => `${group.group}: ${group.items.join(', ')}`).join('\n'));
        break;
      case 'hobbies':
        write(hobbies.map((hobby) => `${hobby.label}: ${hobby.story}`).join('\n'));
        break;
      case 'contact':
        write(`Email: ${config.email}\nLinkedIn: ${config.linkedinUrl}\nInstagram: ${config.instagramUrl}`);
        break;
      case 'theme': {
        if (!['dark', 'light'].includes(argument)) {
          write('Gunakan: theme dark atau theme light.');
          break;
        }
        if (document.documentElement.dataset.theme !== argument) {
          document.querySelector('[data-theme-toggle]')?.click();
        }
        write(`Tema ${argument} aktif.`);
        break;
      }
      case 'clear':
        output.replaceChildren();
        break;
      case 'exit':
        close();
        break;
      default:
        write(`Perintah “${command}” tidak dikenali. Ketik help untuk melihat daftar.`);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const command = input.value.trim();
    input.value = '';
    run(command);
    if (dialog.open) input.focus();
  };

  const onKeydown = (event) => {
    if (!dialog.open || event.key !== 'Tab') return;
    const focusable = [closeButton, input, form.querySelector('button[type="submit"]')];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onOpenRequest = () => open();
  const onClose = () => {
    if (returnFocus instanceof HTMLElement && returnFocus.isConnected) returnFocus.focus();
    returnFocus = null;
  };

  form.addEventListener('submit', onSubmit);
  dialog.addEventListener('keydown', onKeydown);
  dialog.addEventListener('close', onClose);
  closeButton.addEventListener('click', close);
  document.addEventListener('portfolio:terminal-open', onOpenRequest);

  return function destroy() {
    form.removeEventListener('submit', onSubmit);
    dialog.removeEventListener('keydown', onKeydown);
    dialog.removeEventListener('close', onClose);
    closeButton.removeEventListener('click', close);
    document.removeEventListener('portfolio:terminal-open', onOpenRequest);
    if (dialog.open) dialog.close();
    dialog.remove();
  };
}
