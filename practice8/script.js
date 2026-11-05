/**
 * Комп'ютерний практикум №8
 * Варіант 2: Портфоліо фотографа/дизайнера
 * Тема: Обробка подій та форми, клієнтська валідація
 */
console.log('JS successfully connected !');

const Portfolioworks = [
  { title: 'Редизайн корпоративного сайту', year: 2025, category: 'Дизайн', image: 'https://picsum.photos/400/250?random=1' },
  { title: 'Фотозйомка весілля', year: 2022, category: 'Фото', image: 'https://picsum.photos/400/250?random=2' },
  { title: 'Логотип для центру', year: 2026, category: 'Дизайн', image: 'https://picsum.photos/400/250?random=3' },
  { title: 'Репортаж з IT-конференції', year: 2023, category: 'Фото', image: 'https://picsum.photos/400/250?random=4' },
  { title: 'Макет мобільного додатку', year: 2021, category: 'Дизайн', image: 'https://picsum.photos/400/250?random=5' }
];

function showWorksByCategory(works, targetCategory) {
  console.log(`--- Роботи в категорії "${targetCategory}": ---`);
  for (const work of works) {
    if (work.category === targetCategory) {
      console.log(`• ${work.title} (${work.year} рік)`);
    }
  }
}

showWorksByCategory(Portfolioworks, 'Фото');
showWorksByCategory(Portfolioworks, 'Дизайн');

const isRecent = year => (2026 - year) <= 2;

for (const work of Portfolioworks) {
  const age = 2026 - work.year;
  let status = '';

  if (isRecent(work.year)) {
    status = 'Нова робота (актуальна)';
  } else if (age > 3) {
    status = 'Архівна (старша 3 років)';
  } else {
    status = 'Робота середньої давності';
  }

  console.log(`Проєкт: "${work.title}" | Рік: ${work.year} (${age} р. тому) -> [${status}]`);
}

const galleryContainer = document.querySelector('#gallery');
const countElement = document.querySelector('#projects-count');

function renderProjects(works) {
  const existingCards = galleryContainer.querySelectorAll('.card');
  existingCards.forEach(card => card.remove());

  works.forEach(work => {
    const card = document.createElement('article');
    card.classList.add('card');
    card.dataset.category = work.category;

    const img = document.createElement('img');
    img.src = work.image;
    img.alt = work.title;

    const title = document.createElement('h3');
    title.textContent = work.title;

    const meta = document.createElement('p');
    meta.textContent = `Рік: ${work.year} | Категорія: ${work.category}`;

    if (isRecent(work.year)) {
      card.classList.add('recent');
    }

    card.append(img, title, meta);
    galleryContainer.append(card);
  });

  if (countElement) {
    countElement.textContent = `Усього проєктів у портфоліо: ${works.length}`;
  }
}

renderProjects(Portfolioworks);

const addProjectForm = document.querySelector('#add-project-form');
const yearInput = document.querySelector('#project-year');
const categoryFilter = document.querySelector('#category-filter');

if (yearInput) {
  yearInput.addEventListener('input', () => {
    const currentYear = 2026;
    const inputYear = Number(yearInput.value);

    if (inputYear > currentYear) {
      yearInput.setCustomValidity('Рік не може бути в майбутньому');
    } else {
      yearInput.setCustomValidity('');
    }
  });
}

function applyCategoryFilter() {
  if (!categoryFilter) return;

  const selectedCategory = categoryFilter.value;
  const cards = galleryContainer.querySelectorAll('.card');

  cards.forEach(card => {
    if (selectedCategory === 'all') {
      card.classList.remove('hidden');
    } else {
      const isMismatch = card.dataset.category !== selectedCategory;
      card.classList.toggle('hidden', isMismatch);
    }
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener('change', applyCategoryFilter);
}

if (addProjectForm) {
  addProjectForm.addEventListener('submit', event => {
    event.preventDefault();

    const titleInput = document.querySelector('#project-title');
    const categorySelect = document.querySelector('#project-category');

    const titleValue = titleInput.value.trim();
    const yearValue = Number(yearInput.value);
    const categoryValue = categorySelect.value;

    const newProject = {
      title: titleValue,
      year: yearValue,
      category: categoryValue,
      image: `https://picsum.photos/400/250?random=${Date.now()}`
    };

    Portfolioworks.push(newProject);

    renderProjects(Portfolioworks);

    applyCategoryFilter();

    addProjectForm.reset();
  });
}