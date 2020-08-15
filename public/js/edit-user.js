const passwordInputValue = document.getElementById('password');
const pwconfirmInputValue = document.getElementById('pwconfirm');

const fakeButton = document.getElementById('fakeSubmitButton');
const realButton = document.getElementById('realSubmitButton');
fakeButton.style.display = 'block';
realButton.style.display = 'none';
realButton.disabled = true

fakeButton.addEventListener('click', () => {
    if (passwordInputValue.length < 5 || passwordInputValue.length < 5) {
        alert('Password needs to be at least 5 characters.');
    } else if (passwordInputValue.value !== pwConfirmInput.value) {
        alert('Password do need to match');
    } else {
        alert('You need to choose a password. You can also type in the existing password.')
    }
})

const pwConfirmInput = document.getElementById('pwconfirm');
document.addEventListener('keyup', () => {
    if (passwordInputValue.value.length >= 5 && passwordInputValue.value === pwConfirmInput.value) {
        realButton.disabled = false;
        fakeButton.style.display = 'none';
        realButton.style.display = 'block';
    } else {
        fakeButton.style.display = 'block';
        realButton.style.display = 'none';
        realButton.disabled = true;
    }
})