const upvote = document.querySelector('.upvote');
const downvote = document.querySelector('.downvote');
let voteValue = document.getElementById('voteValue');
const submitButton = document.getElementById('submitButton');

upvote.addEventListener('click', () => {
    voteValue.value = 1;
    document.getElementById('submitButton').click();
});

// downvote.addEventListener('click', () => {
//     voteValue.value = -1;
//     document.getElementById('submitButton').click();
// });