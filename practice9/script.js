/**
 * Комп'ютерний практикум №9
 * Варіант 2: Портфоліо фотографа/дизайнера
 * Тема: Клієнт для відомого API (fetch/AJAX, async/await)
 * API: JSONPlaceholder Photos (https://jsonplaceholder.typicode.com/photos?albumId=1)
 */

console.log('JS successfully connected!');

const API_URL = 'https://jsonplaceholder.typicode.com/photos?albumId=1';

const galleryContainer = document.querySelector('#gallery');
const countElement = document.querySelector('#projects-count');
const refreshBtn = document.querySelector('#refresh-btn');
const loadingIndicator = document.querySelector('#loading-indicator');
const errorBox = document.querySelector('#error-message');
const categoryFilter = document.querySelector('#category-filter');
const addProjectForm = document.querySelector('#add-project-form');
const yearInput = document.querySelector('#project-year');

let currentProjects = [];

const isRecent = year => (2026 - year) <= 2;

function setLoading(isLoading) {
  if (isLoading) {
    loadingIndicator.classList.remove('hidden');
    refreshBtn.disabled = true;
  } else {
    loadingIndicator.classList.add('hidden');
    refreshBtn.disabled = false;
  }
}

function setErrorMessage(message) {
  if (message) {
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
  } else {
    errorBox.textContent = '';
    errorBox.classList.add('hidden');
  }
}

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
    meta.textContent = `ID: ${work.id} | Рік: ${work.year} | Категорія: ${work.category}`;

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

async function loadPortfolioFromAPI() {
  setLoading(true);
  setErrorMessage(null);

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Альбом не знайдено');
      } else {
        throw new Error(`Сервер відповів із кодом: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Отримано дані з API:', data);

    currentProjects = data.slice(0, 6).map((item, index) => ({
      id: item.id,
      title: item.title,
      image: item.thumbnailUrl,
      year: 2026 - (index % 4),
      category: item.id % 2 === 0 ? 'Фото' : 'Дизайн'
    }));

    renderProjects(currentProjects);
    applyCategoryFilter();

  } catch (error) {
    console.error('Помилка під час отримання даних:', error);

    if (error.message === 'Альбом не знайдено') {
      setErrorMessage('Альбом не знайдено');
    } else {
      setErrorMessage('Не вдалося завантажити дані. Перевірте з’єднання з інтернетом.');
    }
  } finally {
    setLoading(false);
  }
}

refreshBtn.addEventListener('click', () => {
  loadPortfolioFromAPI();
});

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

categoryFilter.addEventListener('change', applyCategoryFilter);

if (yearInput) {
  yearInput.addEventListener('input', () => {
    const currentYear = 2026;
    if (Number(yearInput.value) > currentYear) {
      yearInput.setCustomValidity('Рік не може бути в майбутньому');
    } else {
      yearInput.setCustomValidity('');
    }
  });
}

if (addProjectForm) {
  addProjectForm.addEventListener('submit', event => {
    event.preventDefault();

    const titleValue = document.querySelector('#project-title').value.trim();
    const yearValue = Number(yearInput.value);
    const categoryValue = document.querySelector('#project-category').value;

    const newProject = {
      id: currentProjects.length + 1,
      title: titleValue,
      year: yearValue,
      category: categoryValue,
      image: `https://picsum.photos/400/250?random=${Date.now()}`
    };

    currentProjects.push(newProject);
    renderProjects(currentProjects);
    applyCategoryFilter();
    addProjectForm.reset();
  });
}

loadPortfolioFromAPI();