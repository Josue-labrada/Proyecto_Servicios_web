const playBoard = document.querySelector('.play-board');

//variables
let foodX, foodY;
let snakeX = 5, snakeY = 10;
let velocityX = 0, velocityY = 0;


const changeFoodPosition = ()=> {
    foodX = Math.floor(Math.random() * 20) + 1;
    foodY = Math.floor(Math.random() * 25) + 1;
}

const initGame = () => {
    let htmlMarkup = `<div class="food" style="grid-row: ${foodY}; grid-column: ${foodX};"></div>`;
    htmlMarkup += `<div class="head" style="grid-row: ${snakeY}; grid-column: ${snakeX};"></div>`;
    playBoard.innerHTML = htmlMarkup;
    //si la serpiente come la comida
    if (snakeX === foodX && snakeY === foodY) {
        changeFoodPosition();
    }
    snakeX += velocityX;
    snakeY += velocityY;
}

const changeDirection = (e) => {
    if (e.key === "ArrowUp") {
        velocityX = 0;
        velocityY = -1;
    }
    else if (e.key === "ArrowDown") {
        velocityX = 0;
        velocityY = 1;
    }
    else if (e.key === "ArrowLeft") {
        velocityX = -1;
        velocityY = 0;
    }
    else if (e.key === "ArrowRight") {
        velocityX = 1;
        velocityY = 0;
    }

}

changeFoodPosition();
setInterval(() => {initGame();}, 125);// Event listener para que cambie la dirección de la serpiente
document.addEventListener("keydown", changeDirection);