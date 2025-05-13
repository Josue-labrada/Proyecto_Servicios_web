const playBoard = document.querySelector('.play-board');
const scoreBoard = document.querySelector('.score');

//variables
let foodX, foodY;
let snakeX = 5, snakeY = 10;
let velocityX = 0, velocityY = 0;
let snakeBody = [[snakeX, snakeY]];
let gameOver = false;

// Variables globales
let gameSpeed = 300; // Velocidad inicial del juego (en milisegundos)
let gameInterval;
let pointsPerFood = 50; // Puntos iniciales por comida
let gameActive = false; // Estado del juego
let score = 0; // Puntaje inicial
let scoreElement = document.getElementById('score');
let difficultyButtons = document.getElementById('difficulty-buttons');

// Función para establecer la dificultad
function setDifficulty(level) {
    // Restablece los estilos de los botones
    document.querySelectorAll('.difficulty-button').forEach(button => {
        button.classList.remove('active');
    });

    // Ajusta la velocidad y los puntos según el nivel
    switch (level) {
        case 'easy':
            gameSpeed = 200; // Velocidad lenta
            pointsPerFood = 50; // Puntos por comida
            document.getElementById('easy-button').classList.add('active');
            break;
        case 'medium':
            gameSpeed = 100; // Velocidad media
            pointsPerFood = 100; // Puntos por comida
            document.getElementById('medium-button').classList.add('active');
            break;
        case 'hard':
            gameSpeed = 40; // Velocidad rápida
            pointsPerFood = 150; // Puntos por comida
            document.getElementById('hard-button').classList.add('active');
            break;
    }
    startGame(); // Inicia el juego después de seleccionar la dificultad
}

// Función para iniciar el juego
function startGame() {
    gameActive = true; // Cambia el estado del juego a activo
    score = 0; // Reinicia el puntaje
    scoreElement.textContent = `Score: ${score}`; // Actualiza el puntaje en pantalla

    // Oculta los botones de dificultad y muestra el puntaje
    difficultyButtons.style.display = 'none';
    scoreElement.style.display = 'block';

    restartGame(); // Reinicia el juego con la nueva configuración
}

// Función para reiniciar el juego con la nueva velocidad
function restartGame() {
    clearInterval(gameInterval); // Detiene el juego actual
    gameInterval = setInterval(updateGame, gameSpeed); // Reinicia el juego con la nueva velocidad
}

// Función principal del juego
function updateGame() {
    if (!gameActive) return; // Si el juego no está activo, no continúa

    initGame();
}

// Función para finalizar el juego
function endGame() {
    gameActive = false; // Cambia el estado del juego a inactivo

    // Muestra los botones de dificultad y oculta el puntaje
    difficultyButtons.style.display = 'flex';
    scoreElement.style.display = 'none';

    clearInterval(gameInterval); // Detiene el intervalo del juego
}

const changeFoodPosition = () => {
    foodX = Math.floor(Math.random() * 20) + 1;
    foodY = Math.floor(Math.random() * 25) + 1;
};

const handGameOver = () => {
    clearInterval(gameInterval); // Detiene el intervalo

    actualizarPuntajeFinalSnake(); // ✅ Agrega esta línea

    const modal = document.getElementById('gameOverModal');
    const restartButton = document.getElementById('restartButton');
    const homeButton = document.getElementById('homeButton');

    modal.style.display = 'flex';

    restartButton.onclick = () => location.reload();
    homeButton.onclick = () => window.location.href = '../../home.html';
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
        score += pointsPerFood; // Incrementa el puntaje según la dificultad
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
document.addEventListener("keydown", changeDirection);

function actualizarPuntajeFinalSnake() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (user && user._id) {
        const nuevoScore = user.score + score;
        fetch(`/api/users/${user._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ score: nuevoScore })
        })
        .then(res => res.json())
        .then(updatedUser => {
            sessionStorage.setItem("user", JSON.stringify(updatedUser));
            const userScore = document.getElementById("user-score");
            if (userScore) userScore.textContent = `Score: ${updatedUser.score}`;
        })
        .catch(err => {
            console.error("❌ Error al actualizar puntaje:", err);
        });
    }
}
