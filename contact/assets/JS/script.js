document.querySelector('.burger').addEventListener('click', function() {
    this.classList.toggle('active');
    document.querySelector('.nav').classList.toggle('open');
})

const floating_btn = document.querySelector('.floating-btn');
const close_btn = document.querySelector('.close-btn');
const social_panel_container = document.querySelector('.social-panel-container');

floating_btn.addEventListener('click', () => {
	social_panel_container.classList.toggle('visible')
});

close_btn.addEventListener('click', () => {
	social_panel_container.classList.remove('visible')
});

document.getElementById('Form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const text = document.getElementById('text').value;
    const phone = document.getElementById('phone').value;

    localStorage.setItem('name', name);
    localStorage.setItem('text', text);
    localStorage.setItem('phone', phone);

    console.log('Имя:', name);
    console.log('Номер телефона:', phone);
    console.log('Текст:', text);

    social_panel_container.classList.remove('visible');
});
