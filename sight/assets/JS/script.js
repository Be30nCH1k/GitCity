const searchInput = document.getElementById('searchInput');
const container = document.getElementById('data-list');
const mochApi = 'https://6729bdac6d5fa4901b6e27f4.mockapi.io/attractions';
const categoryFilter = document.getElementById('categoryFilter');
const sortName = document.getElementById("sortName");
const closeBtn = document.querySelector('.close-btn');
const socialPanelContainer = document.querySelector('.social-panel-container');
const modalSocial = document.querySelector('.main__modal');

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

    // Беру параметр category и добавляю в html categoryFilter уникальные категории
    const uniquecategory = [...new Set(persone.map(person => person.category))];
    populatecategoryFilter(uniquecategory);

    hideLoader();
    loadDataInMochApi(currentPage);
    search();
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
    history.pushState({}, '', '/sight/attraction.html');
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
            // Изменяем URL, добавляя полный путь, включая базовый путь
            history.pushState({}, '', `/sight/attraction.html/id/${t.id}`);
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
            <div class="modal__base">
                <div>
                    <div class="modal__title">${attraction.name}</div>
                    <div class="modal__box">
                        <div class="modal__text">${attraction.title}</div>
                    </div>
                    <div class="modal__gallery">
                        ${attraction.images.map(img => `
                            <img class="modal__gallery-item" src="${img}" alt="${attraction.name}">
                        `).join('')}
                    </div>
                    <div id="map"></div>
                </div>
                <div class="modal__reviews">
                    <h3>Отзывы</h3>
                    <div class="reviews-list"></div>
                    <form class="review-form">
                        <input type="text" class="review-author" placeholder="Ваше имя" required>
                        <textarea class="review-text" placeholder="Ваш отзыв" required></textarea>
                        <div class="rating">
                            <span class="rating__star" data-rating="1">★</span>
                            <span class="rating__star" data-rating="2">★</span>
                            <span class="rating__star" data-rating="3">★</span>
                            <span class="rating__star" data-rating="4">★</span>
                            <span class="rating__star" data-rating="5">★</span>
                        </div>
                        <button type="submit" class="sortName">Добавить отзыв</button>
                    </form>
                </div>
            </div>
            <div class="fullscreen-gallery">
                <div class="fullscreen-gallery__close">&times;</div>
                <div class="fullscreen-gallery__content">
                    <img class="fullscreen-gallery__image" src="">
                </div>
                <div class="fullscreen-gallery__prev">&#10094;</div>
                <div class="fullscreen-gallery__next">&#10095;</div>
            </div>
        `;

        // Инициализация Yandex Maps
        ymaps.ready(() => {
            const map = new ymaps.Map('map', {
                center: [attraction.lat, attraction.lng],
                zoom: 17,
            });
            const placemark = new ymaps.Placemark([attraction.lat, attraction.lng]);
            map.geoObjects.add(placemark);
        });

        // Загрузка отзывов с сервера
        const reviewsContainer = document.querySelector('.reviews-list');
        const reviews = await fetchReviewsFromServer(attraction.id); // Получаем отзывы с сервера
        renderReviews(reviewsContainer, reviews, attraction.id); // Рендерим отзывы

        // Обработка формы для добавления отзывов
        const reviewForm = document.querySelector('.review-form');
        const ratingStars = document.querySelectorAll('.rating__star');
        let selectedRating = 0;

        // Обработка выбора оценки
        ratingStars.forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.getAttribute('data-rating'));
                ratingStars.forEach(s => s.classList.remove('selected'));
                for (let i = 0; i < selectedRating; i++) {
                    ratingStars[i].classList.add('selected');
                }
            });
        });

        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Валидация формы
            const authorInput = document.querySelector('.review-author');
            const textInput = document.querySelector('.review-text');

            if (!authorInput.value.trim()) {
                alert('Пожалуйста, введите ваше имя.');
                return;
            }

            if (!textInput.value.trim()) {
                alert('Пожалуйста, введите текст отзыва.');
                return;
            }

            if (selectedRating === 0) {
                alert('Пожалуйста, выберите оценку.');
                return;
            }

            const newReview = {
                author: authorInput.value.trim(),
                text: textInput.value.trim(),
                rating: selectedRating,
            };

            // Отправка отзыва на сервер
            const success = await saveReviewToServer(attraction.id, newReview);

            if (success) {
                // Добавляем отзыв в список
                const reviewElement = createReviewElement(newReview, attraction.id);
                reviewsContainer.appendChild(reviewElement);

                // Очищаем форму
                authorInput.value = '';
                textInput.value = '';
                ratingStars.forEach(s => s.classList.remove('selected'));
                selectedRating = 0;

                // Обновляем список отзывов
                const updatedReviews = await fetchReviewsFromServer(attraction.id);
                renderReviews(reviewsContainer, updatedReviews, attraction.id);
            } else {
                alert('Ошибка при добавлении отзыва. Попробуйте снова.');
            }
        });

        // Инициализация галереи
        const galleryItems = document.querySelectorAll('.modal__gallery-item');
        const fullscreenGallery = document.querySelector('.fullscreen-gallery');
        const fullscreenImage = document.querySelector('.fullscreen-gallery__image');
        const closeFullscreen = document.querySelector('.fullscreen-gallery__close');
        const prevButton = document.querySelector('.fullscreen-gallery__prev');
        const nextButton = document.querySelector('.fullscreen-gallery__next');
        let currentImageIndex = 0;

        // Открытие полноэкранной галереи
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                currentImageIndex = index;
                fullscreenImage.src = item.src;
                fullscreenGallery.style.display = 'flex';
            });
        });

        // Закрытие полноэкранной галереи
        closeFullscreen.addEventListener('click', () => {
            fullscreenGallery.style.display = 'none';
        });

        // Переключение на предыдущее фото
        prevButton.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex - 1 + attraction.images.length) % attraction.images.length;
            fullscreenImage.src = attraction.images[currentImageIndex];
        });

        // Переключение на следующее фото
        nextButton.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex + 1) % attraction.images.length;
            fullscreenImage.src = attraction.images[currentImageIndex];
        });
    }
}

// Функция для создания элемента отзыва
function createReviewElement(review, attractionId) {
    const reviewElement = document.createElement('div');
    reviewElement.classList.add('review');
    reviewElement.innerHTML = `
        <div class="review__author">${review.author}</div>
        <div class="review__text">${review.text}</div>
        <div class="review__rating">
            ${'★'.repeat(review.rating)}
            ${'☆'.repeat(5 - review.rating)}
        </div>
        <button class="review__delete">Удалить</button>
    `;

    // Обработка удаления отзыва
    const deleteButton = reviewElement.querySelector('.review__delete');
    deleteButton.addEventListener('click', async () => {
        const success = await deleteReviewFromServer(review.id); // Удаляем отзыв с сервера
        if (success) {
            const reviewsContainer = document.querySelector('.reviews-list');
            const reviews = await fetchReviewsFromServer(attractionId); // Обновляем список отзывов
            renderReviews(reviewsContainer, reviews, attractionId); // Рендерим обновленный список
        } else {
            alert('Ошибка удалении отзыва');
        }
    });

    return reviewElement;
}

// Функция для рендеринга отзывов
function renderReviews(container, reviews, attractionId) {
    container.innerHTML = ''; // Очищаем контейнер
    reviews.forEach(review => {
        const reviewElement = createReviewElement(review, attractionId);
        container.appendChild(reviewElement);
    });
}

// Функция для получения текущего ID достопримечательности
function getCurrentAttractionId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Функция для получения отзывов с сервера
async function fetchReviewsFromServer(attractionId) {
    try {
        const response = await fetch(`https://6729bdac6d5fa4901b6e27f4.mockapi.io/reviews`);
        if (!response.ok) {
            throw new Error('Ошибка загрузке отзывов');
        }
        const reviews = await response.json();
        // Фильтруем отзывы по attractionId
        return reviews.filter(review => review.attractionId === attractionId);
    } catch (error) {
        console.error('Ошибка загрузке отзывов', error);
        return [];
    }
}

// Функция для сохранения отзыва на сервере
async function saveReviewToServer(attractionId, review) {
    try {
        const response = await fetch(`https://6729bdac6d5fa4901b6e27f4.mockapi.io/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ attractionId, ...review }),
        });

        return response.ok; // Возвращаем true, если запрос успешен
    } catch (error) {
        console.error('Ошибка сохранении отзыва', error);
        return false;
    }
}

// Функция для удаления отзыва с сервера
async function deleteReviewFromServer(reviewId) {
    try {
        const response = await fetch(`https://6729bdac6d5fa4901b6e27f4.mockapi.io/reviews/${reviewId}`, {
            method: 'DELETE',
        });
        return response.ok; // Возвращаем true, если запрос успешен
    } catch (error) {
        console.error('Ошибка удалении отзыва', error);
        return false;
    }
}