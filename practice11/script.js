/**
 * Комп'ютерний практикум №11 (Частина 2: IndexedDB + міграція з localStorage)
 * Варіант 2: Портфоліо фотографа/дизайнера
 * Модель даних: { id, title, imageUrl, category, description }
 * Сховище IndexedDB: база "PortfolioDB", object store "works", keyPath: "id"
 */

const STORAGE_KEY = 'portfolioWorks';
const MIGRATED_KEY = 'portfolioMigrated';
const DB_NAME = 'PortfolioDB';
const DB_VERSION = 1;
const STORE_NAME = 'works';

const galleryContainer = document.querySelector('#gallery');
const countElement = document.querySelector('#projects-count');
const categoryFilter = document.querySelector('#category-filter');
const addProjectForm = document.querySelector('#add-project-form');
const storageErrorBox = document.querySelector('#storage-error');

const defaultWorks = [
  {
    id: 1,
    title: 'Портретна фотосесія «Місто в об’єктиві»',
    imageUrl: 'https://picsum.photos/400/250?random=1',
    category: 'Фото',
    description: 'Серія вуличних портретів з акцентом на природне денне світло.'
  },
  {
    id: 2,
    title: 'Фірмовий стиль для кав’ярні «Espresso Hub»',
    imageUrl: 'https://picsum.photos/400/250?random=2',
    category: 'Дизайн',
    description: 'Комплексний дизайн айдентики: логотип, палітра та поліграфія.'
  }
];

// Виведення помилки роботи зі сховищем (Крок 11)
function showStorageError(message) {
  if (!storageErrorBox) return;
  if (message) {
    storageErrorBox.textContent = message;
    storageErrorBox.classList.remove('hidden');
  } else {
    storageErrorBox.textContent = '';
    storageErrorBox.classList.add('hidden');
  }
}

// Завантаження даних із localStorage для міграції (Крок 2)
function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Пошкоджені дані в localStorage:', error);
    return [];
  }
}

// Крок 6: Асинхронне відкриття бази IndexedDB та створення сховища "works"
function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB не підтримується вашим браузером.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Крок 7 (Create / Update): Додавання або оновлення роботи через put()
async function saveWork(work) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(work);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Крок 7 (Read): Отримання всіх робіт із сховища "works"
async function getAllWorks() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Крок 7 (Delete): Видалення роботи за id
async function deleteWork(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Крок 8: Одноразова міграція даних із localStorage в IndexedDB
async function migrateFromLocalStorage() {
  const isMigrated = localStorage.getItem(MIGRATED_KEY) === 'true';
  if (isMigrated) return;

  const existingInDB = await getAllWorks();
  if (existingInDB.length === 0) {
    const localWorks = loadFromLocalStorage();
    const initialData = localWorks.length > 0 ? localWorks : defaultWorks;

    for (const work of initialData) {
      await saveWork(work);
    }
  }

  localStorage.setItem(MIGRATED_KEY, 'true');
}

// Крок 9: Оновлення списку на екрані з IndexedDB
async function refreshWorksFromDB() {
  const works = await getAllWorks();
  renderWorks(works);
  applyCategoryFilter();
}

// Рендер карток у DOM
function renderWorks(list) {
  galleryContainer.innerHTML = '';

  list.forEach(work => {
    const card = document.createElement('article');
    card.classList.add('card');
    card.dataset.category = work.category;

    const img = document.createElement('img');
    img.src = work.imageUrl;
    img.alt = work.title;

    const title = document.createElement('h3');
    title.textContent = work.title;

    const category = document.createElement('p');
    category.innerHTML = `<strong>Категорія:</strong> ${work.category}`;

    const desc = document.createElement('p');
    desc.textContent = work.description;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Видалити';
    deleteBtn.addEventListener('click', async () => {
      try {
        await deleteWork(work.id);
        await refreshWorksFromDB();
      } catch (error) {
        console.error('Помилка видалення з IndexedDB:', error);
        showStorageError('Не вдалося видалити роботу з бази даних.');
      }
    });

    card.append(img, title, category, desc, deleteBtn);
    galleryContainer.append(card);
  });

  if (countElement) {
    countElement.textContent = `Усього проєктів у портфоліо: ${list.length}`;
  }
}

// Фільтрація за категорією
function applyCategoryFilter() {
  if (!categoryFilter) return;
  const selected = categoryFilter.value;
  const cards = galleryContainer.querySelectorAll('.card');

  cards.forEach(card => {
    const isHidden = selected !== 'all' && card.dataset.category !== selected;
    card.classList.toggle('hidden', isHidden);
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener('change', applyCategoryFilter);
}

// Додавання нової роботи через форму в IndexedDB
if (addProjectForm) {
  addProjectForm.addEventListener('submit', async event => {
    event.preventDefault();

    const title = document.querySelector('#project-title').value.trim();
    const category = document.querySelector('#project-category').value;
    const imageInput = document.querySelector('#project-image').value.trim();
    const description = document.querySelector('#project-description').value.trim();

    const newWork = {
      id: Date.now(),
      title,
      imageUrl: imageInput || `https://picsum.photos/400/250?random=${Date.now()}`,
      category,
      description
    };

    try {
      await saveWork(newWork);
      await refreshWorksFromDB();
      addProjectForm.reset();
    } catch (error) {
      console.error('Помилка збереження в IndexedDB:', error);
      showStorageError('Не вдалося зберегти роботу в базу даних.');
    }
  });
}

// Старт застосунку: міграція + завантаження з IndexedDB (Кроки 8, 9, 11)
async function initApp() {
  try {
    showStorageError(null);
    await migrateFromLocalStorage();
    await refreshWorksFromDB();
  } catch (error) {
    console.error('Помилка відкриття IndexedDB:', error);
    showStorageError('Не вдалося відкрити локальну базу даних IndexedDB. Можливо, увімкнено приватний режим браузера.');
  }
}

initApp();