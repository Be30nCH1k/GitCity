const searchInput = document.getElementById('searchInput');
const container = document.getElementById('data-list');
const mochApi = 'https://6729bdac6d5fa4901b6e27f4.mockapi.io/attractions';
const categoryFilter = document.getElementById('categoryFilter');
const sortName = document.getElementById("sortName");
const closeBtn = document.querySelector('.close-btn');
const socialPanelContainer = document.querySelector('.social-panel-container');
const modalSocial = document.querySelector('.obratnuj__zvonok');

const itemOnPage = 10;
let currentPage = 1;
let persone = [];
let filteredPersone = [];
let totalItems;
let totalPages;

addEventListener('load', async () => {
    showLoader();
    const response = await fetch(mochApi);
    persone = await response.json();
    filteredPersone = [...persone];
    totalItems = filteredPersone.length;
    totalPages = Math.ceil(totalItems / itemOnPage);

    // Беру параметр category и добавляю в html categoryFilter уникальные районы
    const uniquecategory = [...new Set(persone.map(person => person.category))];
    populatecategoryFilter(uniquecategory);

    hideLoader();
    loadDataInMochApi(currentPage);
    search();

    // Проверяем, есть ли id в URL
    const url = new URL(window.location.href);
    const pathSegments = url.pathname.split('/');
    const attractionId = pathSegments[pathSegments.length - 1]; // Получаем последний сегмент пути
    if (attractionId && !isNaN(attractionId)) {
        openModalById(attractionId); // Открываем модальное окно сразу после загрузки
    }
});

function populatecategoryFilter(categorys) {
    // Очистка текущий функции
    categoryFilter.innerHTML = '<option value="">Фильтр по категориям</option>';
    categorys.forEach(category => {
        const option = document.createElement('option');
        option.value = category; // Значение для фильтрации
        option.textContent = category; // Отображаемый текст
        categoryFilter.appendChild(option);
    });
}

closeBtn.addEventListener('click', () => {
    socialPanelContainer.classList.remove('visible');
    // Убираем параметр id из URL при закрытии модального окна
    history.pushState({}, '', '/'); // Возвращаемся к корневому пути
});

function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

function loadDataInMochApi(item) {
    showLoader(); // Показываем лоадер перед загрузкой данных
    container.innerHTML = '';
    const start = (item - 1) * itemOnPage;
    const end = Math.min(start + itemOnPage, totalItems);

    for (let i = start; i < end; i++) {
        const t = filteredPersone[i];
        const search = document.createElement('div');
        search.classList.add('info__main');
        search.setAttribute('data-title', t.name);
        search.innerHTML = `
            <img class="info__img" src="${t.img}" alt="картинки ${i + 1}">
            <div class="info__box">
                <div class="info__title">${t.name}</div>
                <button class="info__btn floating-btn" id="btn_${i}">Узнать больше</button>
            </div>`;
        container.append(search);

        let infoBtn = document.getElementById(`btn_${i}`);
        infoBtn.addEventListener('click', () => {
            // Изменяем URL добавляя id достопримечательности через путь
            history.pushState({}, '', `/id/${t.id}`);
            openModalById(t.id); // Открываем модальное окно
        });
    }

    updatePagination();
    hideLoader(); // Скрываем лоадер после загрузки данных
}

function updatePagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.onclick = () => changePage(i);
        paginationContainer.appendChild(pageBtn);
    }
}

function changePage(page) {
    showLoader(); // Показываем лоадер перед загрузкой данных
    currentPage = page;
    loadDataInMochApi(currentPage);
}

async function search() {
    searchInput.addEventListener('input', async function () {
        const query = this.value.trim().toLowerCase();
        const category = categoryFilter.value; // Получаем выбранный категорию

        // Это фильтр для поиска
        filteredPersone = persone.filter(person =>
            person.name.toLowerCase().includes(query) &&
            (category === '' || person.category === category) // Фильтрация по категории
        );

        totalItems = filteredPersone.length;
        totalPages = Math.ceil(totalItems / itemOnPage);
        currentPage = 1;

        loadDataInMochApi(currentPage);
    });
}

categoryFilter.addEventListener('change', async function () {
    const query = searchInput.value.trim().toLowerCase();
    const category = this.value;

    // А это основной фильтр
    filteredPersone = persone.filter(person =>
        person.name.toLowerCase().includes(query) &&
        (category === '' || person.category === category) // Фильтрация по категории
    );

    totalItems = filteredPersone.length;
    totalPages = Math.ceil(totalItems / itemOnPage);
    currentPage = 1;

    loadDataInMochApi(currentPage);
});

function sortData(order) {
    if (order === 'abc') {
        persone.sort((a, b) => a.name.localeCompare(b.name));
    }
    filteredPersone = [...persone];
    loadDataInMochApi(currentPage);
}

document.getElementById('sortName').addEventListener('click', () => {
    sortData('abc');
});

// Функция для открытия модального окна по id
async function openModalById(id) {
    const attraction = persone.find(person => person.id === id);
    if (attraction) {
        socialPanelContainer.classList.add('visible');
        modalSocial.innerHTML = `
            <div class="modal__title">${attraction.name}</div>
            <div class="modal__box">
                <div class="modal__text">${attraction.title}</div>
                <img class="modal__img" src="${attraction.img}">
            </div>
            <div id="map"></div>`;

        ymaps.ready(() => {
            const map = new ymaps.Map('map', {
                center: [attraction.lat, attraction.lng],
                zoom: 17,
            });
            const placemark = new ymaps.Placemark([attraction.lat, attraction.lng]);
            map.geoObjects.add(placemark);
        });
    }
}