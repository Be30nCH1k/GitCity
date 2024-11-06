
const searchInput = document.getElementById('searchInput');
const infoSections = document.querySelectorAll('.info__main');


searchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    
    infoSections.forEach(section => {
        const title = section.getAttribute('data-title').toLowerCase();
        if (title.includes(query)) {
            section.style.display = '';
        } else {
            section.style.display = 'none';
        }
    });
});


document.querySelector('.burger')
    .addEventListener('click', function() {
        this.classList.toggle('active');
        document.querySelector('.nav').classList.toggle('open');
})