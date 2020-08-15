const toggle = document.getElementById('toggle-icon');
const mobileNav = document.getElementById('mobile-nav');
const newToggle = document.getElementById('new-toggle');
newToggle.style.display = 'none';

toggle.addEventListener('click', () => {
    mobileNav.style.display = 'block';
    toggle.style.display = 'none';
    return newToggle.style.display = 'block';
})


newToggle.addEventListener('click', () => {
    mobileNav.style.display = 'none';
    newToggle.style.display = 'none';
    return toggle.style.display = 'block';
})
