const passwordInput = document.getElementById('password');
const pwconfirmInput = document.getElementById('pwconfirm');

pwconfirmInput.addEventListener('keyup', () => {
    if (passwordInput.value === pwconfirmInput.value) {
        pwconfirmInput.style.border = '3px solid lightgreen';
    } else {
        pwconfirmInput.style.border = '3px solid red';
    }
})