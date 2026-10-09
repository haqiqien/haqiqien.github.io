import { hobbies, projects, skills } from './data.js';

function createTextElement(tag, className, text) {
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

function hasCaseStudy(caseStudy = {}) {
  return [caseStudy.problem, caseStudy.solution, caseStudy.result, caseStudy.retrospective]
    .some((value) => typeof value === 'string' && value.trim())
    || (Array.isArray(caseStudy.decisions) && caseStudy.decisions.some((value) => typeof value === 'string' && value.trim()));
}

function createProjectCard(project) {
  const card = document.createElement('article');
  card.className = 'project-card';
  card.dataset.tilt = '';
  card.dataset.cursor = 'View';
  if (project.image?.startsWith('assets/images/') && project.imageAlt) {
    const image = document.createElement('img');
    image.className = 'project-card__image';
    image.setAttribute('src', project.image);
    image.setAttribute('width', '1200');
    image.setAttribute('height', '750');
    image.setAttribute('loading', 'lazy');
    image.setAttribute('decoding', 'async');
    image.setAttribute('alt', project.imageAlt);
    card.append(image);
  }
  card.append(createTextElement('h3', 'project-card__title', project.title));
  card.append(createTextElement('p', 'project-card__summary', project.summary));

  if (project.tags?.length) {
    const tags = document.createElement('ul');
    tags.className = 'chip-list project-card__tags';
    tags.setAttribute('aria-label', 'Teknologi proyek');
    for (const tag of project.tags) {
      const item = document.createElement('li');
      item.className = 'chip';
      item.textContent = tag;
      tags.append(item);
    }
    card.append(tags);
  }

  const actions = document.createElement('div');
  actions.className = 'project-card__actions';
  const liveUrl = safeHttpsUrl(project.liveUrl);
  const repoUrl = safeHttpsUrl(project.repoUrl);
  if (liveUrl) {
    const link = createTextElement('a', 'button button--small button--primary', 'Demo langsung');
    link.setAttribute('href', liveUrl);
    actions.append(link);
  }
  if (repoUrl) {
    const link = createTextElement('a', 'button button--small button--secondary', 'Kode sumber');
    link.setAttribute('href', repoUrl);
    actions.append(link);
  }

  if (actions.childElementCount) {
    card.append(actions);
  } else {
    card.append(createTextElement('p', 'project-card__status', 'Tautan demo dan kode sumber belum tersedia.'));
  }

  const dialogSupported = typeof HTMLDialogElement !== 'undefined'
    && typeof HTMLDialogElement.prototype.showModal === 'function';
  if (dialogSupported && !project.placeholder && hasCaseStudy(project.caseStudy)) {
    const caseStudyButton = createTextElement('button', 'button button--small button--secondary project-card__case-study', 'Studi kasus');
    caseStudyButton.type = 'button';
    caseStudyButton.dataset.caseStudy = project.id;
    caseStudyButton.setAttribute('aria-label', `Buka studi kasus: ${project.title}`);
    card.append(caseStudyButton);
  }

  return card;
}

function renderProjects(container) {
  const cards = projects.map(createProjectCard);
  container.replaceChildren(...cards);
}

const skillIconPaths = {
  code: 'M8 8 4 12l4 4m8-8 4 4-4 4m-5-11-2 14',
  web: 'M3 4h18v16H3zM3 9h18m-13-3h.01m3 0h.01',
  analysis: 'M3 12h4l3-8 4 16 3-8h4'
};

function createSkillIcon(type) {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.classList.add('skill-group__icon');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', skillIconPaths[type] || skillIconPaths.code);
  icon.append(path);
  return icon;
}

function renderSkills(container) {
  const groups = skills.map((group) => {
    const section = document.createElement('section');
    section.className = 'skill-group';
    const heading = document.createElement('div');
    heading.className = 'skill-group__heading';
    heading.append(createSkillIcon(group.icon), createTextElement('h3', 'skill-group__title', group.group));
    section.append(heading);
    const items = document.createElement('ul');
    items.className = 'chip-list';
    for (const skill of group.items) {
      const item = document.createElement('li');
      item.className = 'chip';
      item.textContent = skill;
      items.append(item);
    }
    section.append(items);
    return section;
  });
  container.replaceChildren(...groups);
}

function createHobbyCard(hobby) {
  const card = document.createElement('article');
  card.className = 'hobby-card';
  card.dataset.stickerCard = hobby.id;

  const inner = document.createElement('div');
  inner.className = 'hobby-card__inner';
  const sticker = document.createElement('button');
  sticker.className = 'hobby-card__sticker';
  sticker.type = 'button';
  sticker.dataset.sticker = '';
  sticker.setAttribute('aria-pressed', 'false');
  sticker.setAttribute('aria-label', `${hobby.label}. Enter atau Spasi untuk membuka cerita. Gunakan tombol panah untuk menggeser.`);
  sticker.append(createTextElement('span', 'hobby-card__icon', hobby.icon));
  sticker.append(createTextElement('span', 'hobby-card__title', hobby.label));

  const back = document.createElement('div');
  back.className = 'hobby-card__back';
  back.hidden = true;
  back.append(createTextElement('h3', 'hobby-card__title', hobby.label));
  back.append(createTextElement('p', 'hobby-card__story', hobby.story));

  const url = safeHttpsUrl(hobby.url);
  if (url) {
    const link = createTextElement('a', 'hobby-card__link', 'Lihat foto di Instagram');
    link.setAttribute('href', url);
    link.setAttribute('rel', 'noopener noreferrer');
    back.append(link);
  }

  const backButton = createTextElement('button', 'button button--small button--secondary hobby-card__back-button', 'Kembali');
  backButton.type = 'button';
  backButton.dataset.stickerBack = '';
  back.append(backButton);
  inner.append(sticker, back);
  card.append(inner);
  return card;
}

function renderHobbies(container) {
  container.replaceChildren(...hobbies.map(createHobbyCard));
}

export function init() {
  const projectsContainer = document.querySelector('[data-projects]');
  const skillsContainer = document.querySelector('[data-skills]');
  const hobbiesContainer = document.querySelector('[data-hobbies]');

  if (projectsContainer) renderProjects(projectsContainer);
  if (skillsContainer) renderSkills(skillsContainer);
  if (hobbiesContainer) renderHobbies(hobbiesContainer);

  return function destroy() {};
}
