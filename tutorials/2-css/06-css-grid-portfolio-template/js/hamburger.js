// console.log("i'm here");

const hambuger = document.querySelector('.hamburger');
const menu = document.querySelector('.nav-menu');

hambuger.addEventListener('click', () => {
    menu.classList.toggle('active');
});
