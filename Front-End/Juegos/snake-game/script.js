const playBoard = document.querySelector('.play-board');
const scoreBoard = document.querySelector('.score');

//variables
let foodX, foodY;
let snakeX = 5, snakeY = 10;
let velocityX = 0, velocityY = 0;
let snakeBody = [[snakeX, snakeY]];
let gameOver = false;
let setIntervalId;
let score = 0;

const changeFoodPosition = () => {
    foodX = Math.floor(Math.random() * 20) + 1;
    foodY = Math.floor(Math.random() * 25) + 1;
};

const handGameOver = () => {
    clearInterval(setIntervalId); // Detiene el intervalo

    const modal = document.getElementById('gameOverModal');
    const restartButton = document.getElementById('restartButton');
    const homeButton = document.getElementById('homeButton');

    modal.style.display = 'flex'; // Muestra el modal

    // Reinicia el juego al hacer clic en "Seguir Jugando"
    restartButton.onclick = () => {
        location.reload(); // Recarga la página para reiniciar el juego
    };

    // Redirige a Home al hacer clic en "Regresar a Home"
    homeButton.onclick = () => {
        window.location.href = '../../home.html'; // Cambia la ruta según tu estructura
    };
};

const initGame = () => {
    if (gameOver) return; // Si el juego terminó, no continúa

    let htmlMarkup = `<div class="food" style="grid-row: ${foodY}; grid-column: ${foodX};"></div>`;

    // Mueve el cuerpo de la serpiente
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = [...snakeBody[i - 1]]; // Copia la posición del segmento anterior
    }

    // Actualiza la posición de la cabeza
    snakeBody[0] = [snakeX, snakeY];

    // Verifica si la serpiente choca consigo misma
    for (let i = 1; i < snakeBody.length; i++) {
        if (snakeX === snakeBody[i][0] && snakeY === snakeBody[i][1]) { // Compara la cabeza con el cuerpo
            gameOver = true; // Marca el juego como terminado
            handGameOver(); // Llama a la función para manejar el Game Over
            return; // Detiene la ejecución de la función
        }
    }

    // Verifica si la serpiente choca con los bordes
    if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        gameOver = true; // Marca el juego como terminado
        handGameOver(); // Llama a la función para manejar el Game Over
        return; // Detiene la ejecución de la función
    }

    // Si la serpiente come la comida
    if (snakeX === foodX && snakeY === foodY) {
        changeFoodPosition();
        snakeBody.push([]); // Agrega un nuevo segmento al final
        score++; // Incrementa el puntaje
        scoreBoard.innerText = `Score: ${score}`; // Actualiza el puntaje en la pantalla
    }

    // Actualiza la posición de la cabeza
    snakeX += velocityX;
    snakeY += velocityY;

    // Dibuja la serpiente
    snakeBody.forEach(([x, y]) => {
        htmlMarkup += `<div class="head" style="grid-row: ${y}; grid-column: ${x};"></div>`;
    });

    playBoard.innerHTML = htmlMarkup;
};

const changeDirection = (e) => {
    if (e.key === "ArrowUp" && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (e.key === "ArrowDown" && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (e.key === "ArrowLeft" && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (e.key === "ArrowRight" && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
    }
};

changeFoodPosition();
setIntervalId = setInterval(() => {
    initGame();
}, 125); // Actualiza el juego cada 125 ms
document.addEventListener("keydown", changeDirection);