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
let totalItems = 100; // Hard coding общее количество элементов
let totalPages = Math.ceil(totalItems / itemOnPage); // Hard coding общее количество страниц
let categories = []; // Массив для хранения категорий

addEventListener('load', async () => {
    showLoader();
    await loadDataFromServer(currentPage); // Загружаем данные с сервера
    hideLoader();

    // Загружаем категории
    const response = await fetch(mochApi);
    const data = await response.json();
    categories = [...new Set(data.map(item => item.category))]; // Уникальные категории
    populatecategoryFilter(categories); // Заполняем фильтр категорий

    const hash = window.location.hash.substring(1);
    const [key, value] = hash.split('/');
    if (key === 'id') {
        openModalById(value);
    }

    // Добавляем вызов функции поиска
    search();
});

function populatecategoryFilter(categorys) {
    categoryFilter.innerHTML = '<option value="">Фильтр по категориям</option>';
    categorys.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

let scrollPosition = 0; // Переменная для хранения позиции прокрутки

closeBtn.addEventListener('click', () => {
    socialPanelContainer.classList.remove('visible');
    window.location.hash = '';
    window.scrollTo(0, scrollPosition); // Восстанавливаем позицию прокрутки
});

function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

async function loadDataFromServer(page, query = '', category = '') {
    showLoader();
    const url = new URL(mochApi);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', itemOnPage);

    if (query) url.searchParams.append('name', query); // Используем name для поиска
    if (category) url.searchParams.append('category', category); // Фильтр по категории

    const response = await fetch(url);
    const data = await response.json();

    container.innerHTML = '';
    data.forEach((t, i) => {
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
            scrollPosition = window.scrollY; // Сохраняем текущую позицию прокрутки
            window.location.hash = `id/${t.id}`;
            openModalById(t.id);
        });
    });

    updatePagination();
    hideLoader();
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
    currentPage = page;
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    loadDataFromServer(page, query, category);
}

async function search() {
    searchInput.addEventListener('input', async function () {
        const query = this.value.trim().toLowerCase();
        const category = categoryFilter.value;
        currentPage = 1;
        await loadDataFromServer(currentPage, query, category);
    });
}

categoryFilter.addEventListener('change', async function () {
    const query = searchInput.value.trim().toLowerCase();
    const category = this.value;
    currentPage = 1;
    await loadDataFromServer(currentPage, query, category);
});

function sortData(order) {
    if (order === 'abc') {
        const url = new URL(mochApi);
        url.searchParams.append('sortBy', 'name');
        url.searchParams.append('order', 'asc');

        fetch(url)
            .then(response => response.json())
            .then(data => {
                container.innerHTML = '';
                data.forEach((t, i) => {
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
                        scrollPosition = window.scrollY;
                        window.location.hash = `id/${t.id}`;
                        openModalById(t.id);
                    });
                });
            });
    }
}

document.getElementById('sortName').addEventListener('click', () => {
    sortData('abc');
});

async function openModalById(id) {
    const response = await fetch(`${mochApi}/${id}`);
    const attraction = await response.json();

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
                <div class="fullscreen-gallery__mini-box">
                    <div class="fullscreen-gallery__mini"></div>
                </div>
            </div>
        `;

    ymaps.ready(() => {
        const map = new ymaps.Map('map', {
            center: [attraction.lat, attraction.lng],
            zoom: 17,
        });
        const placemark = new ymaps.Placemark([attraction.lat, attraction.lng]);
        map.geoObjects.add(placemark);
    });

const reviewsContainer = document.querySelector('.reviews-list');
const reviews = await fetchReviewsFromServer(attraction.id);
renderReviews(reviewsContainer, reviews, attraction.id);

const reviewForm = document.querySelector('.review-form');
const ratingStars = document.querySelectorAll('.rating__star');
let selectedRating = 0;

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

const authorInput = document.querySelector('.review-author');
const textInput = document.querySelector('.review-text');
const success = await saveReviewToServer(attraction.id, newReview);

if (success) {
    const reviewElement = createReviewElement(newReview, attraction.id);
    reviewsContainer.appendChild(reviewElement);

    authorInput.value = '';
    textInput.value = '';
    ratingStars.forEach(s => s.classList.remove('selected'));
    selectedRating = 0;

    const updatedReviews = await fetchReviewsFromServer(attraction.id);
    renderReviews(reviewsContainer, updatedReviews, attraction.id);
} else {
    alert('Ошибка добавлении отзыва');
}
});

const galleryItems = document.querySelectorAll('.modal__gallery-item');
const fullscreenGallery = document.querySelector('.fullscreen-gallery');
const fullscreenImage = document.querySelector('.fullscreen-gallery__image');
const closeFullscreen = document.querySelector('.fullscreen-gallery__close');
const prevButton = document.querySelector('.fullscreen-gallery__prev');
const nextButton = document.querySelector('.fullscreen-gallery__next');
const miniImgContainer = document.querySelector('.fullscreen-gallery__mini');
let currentImageIndex = 0;

// Создаем миниатюры
attraction.images.forEach((img, index) => {
    const thumbnail = document.createElement('img');
    thumbnail.src = img;
    thumbnail.classList.add('fullscreen-gallery__mini');
    thumbnail.addEventListener('click', () => {
        currentImageIndex = index;
        fullscreenImage.src = img;
        updateThumbnails();
    });
    miniImgContainer.appendChild(thumbnail);
});

galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        currentImageIndex = index;
        fullscreenImage.src = item.src;
        fullscreenGallery.style.display = 'flex';
        updateThumbnails();
    });
});

closeFullscreen.addEventListener('click', () => {
    fullscreenGallery.style.display = 'none';
});

prevButton.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex - 1 + attraction.images.length) % attraction.images.length;
    fullscreenImage.src = attraction.images[currentImageIndex];
    updateThumbnails();
});

nextButton.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex + 1) % attraction.images.length;
    fullscreenImage.src = attraction.images[currentImageIndex];
    updateThumbnails();
});

function updateThumbnails() {
    const thumbnails = document.querySelectorAll('.fullscreen-gallery__mini');
    thumbnails.forEach((thumbnail, index) => {
        if (index === currentImageIndex) {
            thumbnail.classList.add('active');
        } else {
            thumbnail.classList.remove('active');
        }
    });
    }
}
}

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

    const deleteButton = reviewElement.querySelector('.review__delete');
    deleteButton.addEventListener('click', async () => {
        const success = await deleteReviewFromServer(review.id);
        if (success) {
            const reviewsContainer = document.querySelector('.reviews-list');
            const reviews = await fetchReviewsFromServer(attractionId);
            renderReviews(reviewsContainer, reviews, attractionId);
        } else {
            alert('Ошибка удалении отзыва');
        }
    });

    return reviewElement;
}

function renderReviews(container, reviews, attractionId) {
    container.innerHTML = '';
    reviews.forEach(review => {
        const reviewElement = createReviewElement(review, attractionId);
        container.appendChild(reviewElement);
    });
}

async function fetchReviewsFromServer(attractionId) {
    try {
        const response = await fetch(`https://6729bdac6d5fa4901b6e27f4.mockapi.io/reviews`);
        if (!response.ok) {
            throw new Error('Ошибка загрузке отзывов');
        }
        const reviews = await response.json();
        return reviews.filter(review => review.attractionId === attractionId);
    } catch (error) {
        console.error('Ошибка загрузке отзывов', error);
        return [];
    }
}

async function saveReviewToServer(attractionId, review) {
    try {
        const response = await fetch(`https://6729bdac6d5fa4901b6e27f4.mockapi.io/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ attractionId, ...review }),
        });

        return response.ok;
    } catch (error) {
        console.error('Ошибка сохранении отзыва', error);
        return false;
    }
}

async function deleteReviewFromServer(reviewId) {
    try {
        const response = await fetch(`https://6729bdac6d5fa4901b6e27f4.mockapi.io/reviews/${reviewId}`, {
            method: 'DELETE',
        });
        return response.ok;
    } catch (error) {
        console.error('Ошибка удалении отзыва', error);
        return false;
    }
}