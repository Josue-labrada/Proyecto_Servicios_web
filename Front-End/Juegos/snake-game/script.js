const playBoard = document.querySelector('.play-board');

let foodX, foodY;
let snakeX = 5, snakeY = 10;

const changeFoodPosition = ()=> {
    foodX = Math.floor(Math.random() * 20) + 1;
    foodY = Math.floor(Math.random() * 25) + 1;
}

const initGame = () => {
    let htmlMarkup = `<div class="food" style="grid-row: ${foodY}; grid-column: ${foodX};"></div>`;
    htmlMarkup += `<div class="head" style="grid-row: ${snakeY}; grid-column: ${snakeX};"></div>`;
    playBoard.innerHTML = htmlMarkup;
}

changeFoodPosition();
initGame();