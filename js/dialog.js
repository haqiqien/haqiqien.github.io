import { projects } from './data.js';

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function appendField(container, label, value) {
  if (typeof value !== 'string' || !value.trim()) return;
  const section = document.createElement('section');
  section.className = 'case-dialog__section';
  section.append(textElement('h3', 'case-dialog__label', label));
  section.append(textElement('p', 'case-dialog__text', value));
  container.append(section);
}

function renderCaseStudy(project, title, content) {
  title.textContent = project.title;
  content.replaceChildren();
  const study = project.caseStudy || {};
  appendField(content, 'Tantangan', study.problem);
  appendField(content, 'Solusi', study.solution);

  const decisions = Array.isArray(study.decisions)
    ? study.decisions.filter((decision) => typeof decision === 'string' && decision.trim())
    : [];
  if (decisions.length) {
    const section = document.createElement('section');
    section.className = 'case-dialog__section';
    section.append(textElement('h3', 'case-dialog__label', 'Keputusan penting'));
    const list = document.createElement('ul');
    list.className = 'case-dialog__decisions';
    for (const decision of decisions) list.append(textElement('li', '', decision));
    section.append(list);
    content.append(section);
  }

  appendField(content, 'Hasil', study.result);
  appendField(content, 'Yang akan saya ubah', study.retrospective);
}

export function init() {
  const dialog = document.querySelector('[data-case-dialog]');
  const projectList = document.querySelector('[data-projects]');
  const title = dialog?.querySelector('[data-case-dialog-title]');
  const content = dialog?.querySelector('[data-case-dialog-content]');
  const closeButton = dialog?.querySelector('[data-dialog-close]');
  if (!dialog || !projectList || !title || !content || !closeButton || typeof dialog.showModal !== 'function') {
    return () => {};
  }

  let opener = null;
  let previousOverflow = '';

  const onProjectClick = (event) => {
    const button = event.target.closest('[data-case-study]');
    if (!button || !projectList.contains(button)) return;
    const project = projects.find((item) => item.id === button.dataset.caseStudy);
    if (!project || project.placeholder) return;

    opener = button;
    previousOverflow = document.body.style.overflow;
    renderCaseStudy(project, title, content);
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    closeButton.focus();
  };

  const onCloseClick = () => dialog.close();
  const onDialogClick = (event) => {
    if (event.target === dialog) dialog.close();
  };
  const onClose = () => {
    document.body.style.overflow = previousOverflow;
    opener?.focus();
    opener = null;
  };

  projectList.addEventListener('click', onProjectClick);
  closeButton.addEventListener('click', onCloseClick);
  dialog.addEventListener('click', onDialogClick);
  dialog.addEventListener('close', onClose);

  return function destroy() {
    projectList.removeEventListener('click', onProjectClick);
    closeButton.removeEventListener('click', onCloseClick);
    dialog.removeEventListener('click', onDialogClick);
    dialog.removeEventListener('close', onClose);
    if (dialog.open) dialog.close();
    document.body.style.overflow = previousOverflow;
  };
}
