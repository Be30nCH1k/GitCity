const searchInput = document.getElementById('searchInput');
const container = document.getElementById('data-list');
const mochApi = 'https://6729bdac6d5fa4901b6e27f4.mockapi.io/attractions';

const closeBtn = document.querySelector('.close-btn');
const socialPanelContainer = document.querySelector('.social-panel-container');
const modalSocial = document.querySelector('.obratnuj__zvonok');

const itemOnPage = 5;
let currentPage = 1;
let persone = [];
let filteredPersone = [];
let totalItems, totalPages;

addEventListener('load', async () => {
    const data = await fetch(mochApi);
    persone = await data.json();
    filteredPersone = [...persone];
    totalItems = filteredPersone.length;
    totalPages = Math.ceil(totalItems / itemOnPage);

    pageLoader(currentPage);
    search();
});

closeBtn.addEventListener('click', () => {
    socialPanelContainer.classList.remove('visible');
});

function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

function loadData() {
    showLoader();
}

function pageLoader(item) {
    showLoader(); 

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
                <button class="info__btn floating-btn" id="btn_${i}">Увидеть больше</button>
            </div>`;
        
        container.append(search);

        let infoBtn = document.getElementById(`btn_${i}`);
        infoBtn.addEventListener('click', () => {
            socialPanelContainer.classList.add('visible');
            modalSocial.innerHTML = `
                <div class="modal__title">${t.name}</div>
                <div class="modal__box">
                    <div class="modal__text">${t.title}</div>
                    <img class="modal__img" src="${t.img}" alt="${t.name}">
                </div>
                <div id="map"></div>`;
            
            ymaps.ready(() => {
                const map = new ymaps.Map('map', {
                    center: [t.lat, t.lng],
                    zoom: 17,
                });
                const placemark = new ymaps.Placemark([t.lat, t.lng]);
                map.geoObjects.add(placemark);
            });
        });
    }

    updatePag();
    hideLoader();
}

function updatePag() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.onclick = () => changePage(i);
        paginationContainer.appendChild(pageButton);
    }
}

function changePage(page) {
    currentPage = page;    pageLoader(currentPage); 
}

function search() {
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        filteredPersone = persone.filter(section => 
            section.name.toLowerCase().includes(query)
        );

        totalItems = filteredPersone.length; 
        totalPages = Math.ceil(totalItems / itemOnPage); 
        currentPage = 1; 

        pageLoader(currentPage); 
    });
}

function sortData(order) {
    if (order === 'abc') {
        persone.sort((a, b) => a.name.localeCompare(b.name));
    }
    filteredPersone = [...persone]; 
    totalPages = Math.ceil(filteredPersone.length / itemOnPage);
    pageLoader(currentPage);
}

document.getElementById('sortName').addEventListener('click', () => {
    sortData('abc');
});

loadData();
