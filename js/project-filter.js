import { projects } from './data.js';

export function init() {
  const filters = document.querySelector('[data-project-filters]');
  const list = document.querySelector('[data-projects]');
  const status = document.querySelector('[data-project-filter-status]');
  if (!filters || !list || !status) return () => {};

  const tags = [...new Set(projects
    .filter((project) => !project.placeholder)
    .flatMap((project) => project.tags || [])
    .map((tag) => tag.trim())
    .filter(Boolean))];
  if (!tags.length) return () => {};

  const cards = [...list.children];
  const options = ['', ...tags];
  const buttons = options.map((tag) => {
    const button = document.createElement('button');
    button.className = 'button button--small button--secondary project-filter';
    button.type = 'button';
    button.dataset.projectFilter = tag;
    button.setAttribute('aria-pressed', String(!tag));
    button.textContent = tag || 'Semua';
    filters.append(button);
    return button;
  });

  const apply = (tag = '') => {
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.projectFilter === tag)));
    let count = 0;
    projects.forEach((project, index) => {
      const card = cards[index];
      const matches = !tag || project.tags?.includes(tag);
      card.hidden = !matches;
      if (matches) count += 1;
    });
    status.textContent = `${count} proyek.`;
  };
  const onClick = (event) => {
    const button = event.target.closest('[data-project-filter]');
    if (button) apply(button.dataset.projectFilter);
  };

  filters.addEventListener('click', onClick);
  filters.hidden = false;

  return () => {
    filters.removeEventListener('click', onClick);
    filters.replaceChildren();
    filters.hidden = true;
    cards.forEach((card) => { card.hidden = false; });
    status.textContent = '';
  };
}
