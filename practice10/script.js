/**
 * Комп'ютерний практикум №10
 * Варіант 2: Портфоліо фотографа/дизайнера
 * Крок 1: Обраний фреймворк — Vue 3 (через легкість підключення по CDN без Babel).
 */
console.log('Vue 3 script connected!');

// Крок 7: Явно закоментовано ручний DOM-код.
// Функція renderProjects більше не потрібна, рендерингом карток керує Vue!
/*
function renderProjects(works) {
  const existingCards = galleryContainer.querySelectorAll('.card');
  existingCards.forEach(card => card.remove());
  // ... document.createElement ...
}
*/

// Крок 4: Створюємо окремий компонент картки
const PortfolioItem = {
  // Приймаємо дані від батьківського списку через props
  props: ['title', 'year', 'category', 'thumbnailUrl'],
  
  // Крок 6: Локальний реактивний стан (прапорець expanded для Варіанта 2)
  data() {
    return {
      expanded: false // За замовчуванням опис згорнуто
    };
  },
  
  // Шаблон компонента (v-if для умовного рендеру, @click для зміни стану)
  template: `
    <article class="card" @click="expanded = !expanded" style="cursor: pointer; transition: 0.3s; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
      <img :src="thumbnailUrl" :alt="title" style="max-width: 100%; border-radius: 4px;">
      <h3>{{ title }}</h3>
      <p>Рік: {{ year }} | Категорія: {{ category }}</p>
      
      <!-- Цей блок з'являється/ховається автоматично завдяки реактивності Vue -->
      <div v-if="expanded" style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee; color: #555;">
        <p><strong>Детальний опис:</strong> Це додатковий текст для проєкту "{{ title }}", який розгорнуто по кліку завдяки локальному стану Vue без жодного ручного innerHTML чи querySelector.</p>
      </div>
    </article>
  `
};

// Крок 3: Створюємо Vue-додаток та переносимо дані в реактивний стан
const app = Vue.createApp({
  components: {
    'portfolio-item': PortfolioItem
  },
  data() {
    return {
      // Масив, що передається в компонент (надходить з API)
      currentProjects: [] 
    };
  },
  methods: {
    // Отримання даних з API (як у 9-й лабі)
    async loadPortfolioFromAPI() {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/photos?albumId=1');
        if (!response.ok) throw new Error('Помилка завантаження');
        const data = await response.json();

        // Оновлюємо масив. Vue сам миттєво перемалює інтерфейс! (Крок 8)
        this.currentProjects = data.slice(0, 6).map((item, index) => ({
          id: item.id,
          title: item.title,
          image: item.thumbnailUrl,
          year: 2026 - (index % 4),
          category: item.id % 2 === 0 ? 'Фото' : 'Дизайн'
        }));
        
      } catch (error) {
        console.error('Помилка API:', error);
      }
    }
  },
  mounted() {
    // Життєвий цикл Vue: викликається автоматично при старті
    this.loadPortfolioFromAPI();
    
    // Зв'язуємо стару кнопку HTML з новим методом Vue
    const refreshBtn = document.querySelector('#refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadPortfolioFromAPI());
    }
  }
});

// Монтуємо наш додаток у контейнер <div id="app">
app.mount('#app');