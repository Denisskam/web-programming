console.log('JS successfully connected !');

const Portfolioworks = [
    {title: 'Редизайн корпоративного сайту', year: 2025, category: 'Дизайн'},
    { title: 'Фотозйомка весілля', year: 2022, category: 'Фото' },
    { title: 'Логотип для центру', year: 2026, category: 'Дизайн' },
    { title: 'Репортаж з IT-конференції', year: 2023, category: 'Фото' },
    { title: ' comerciales макет мобільного додатку', year: 2021, category: 'Дизайн' }

];
function showWorksByCategory(works, targetCategory){
    console.log(`--- Роботи в категорії "${targetCategory}": ---`);

    for(const work of works){
        if(work.category === targetCategory){
           console.log(`• ${work.title} (${work.year} рік)`);
        }
    }
} 
showWorksByCategory(Portfolioworks, 'Фото');

showWorksByCategory(Portfolioworks, 'Дизайн');

function isRecent(year){
    return(2026 - year) <= 2;
}

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