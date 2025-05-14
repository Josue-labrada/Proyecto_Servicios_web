// Declaración de variables
let board = document.querySelector('.board');
let startButton = document.getElementById('startButton');
let timerDisplay = document.getElementById('timer');
let scoreDisplay = document.getElementById('score'); // Elemento para mostrar el puntaje
let modal = document.getElementById('modal');
let modalTitle = document.getElementById('modal-title');
let modalMessage = document.getElementById('modal-message');
let modalButton = document.getElementById('modal-button');
let matrix = shuffleMatrix(); // Inicializa la matriz con el tablero mezclado
let timer; // Variable para el temporizador
let timeLeft = 60; // Tiempo inicial en segundos
let gameActive = false; // Variable de control para saber si el juego está activo
let score = 0; // Puntaje inicial
let baseScore = 100; // Puntaje base para cada nivel de dificultad

// Función para revolver el tablero
function shuffleMatrix() {
    let array = ['1', '2', '3', '4', '5', '6', '7', '8', ' '];
    let shuffledArray = array.sort(() => Math.random() - 0.5); // Mezcla el array
    let matrix = [];
    while (shuffledArray.length) {
        matrix.push(shuffledArray.splice(0, 3)); // Divide el array en filas de 3 elementos
    }
    return matrix;
}

// Función para mostrar el modal
function showModal(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.remove('hidden');
}

// Función para ocultar el modal
modalButton.addEventListener('click', () => {
    modal.classList.add('hidden');
    if (!gameActive) {
        startButton.style.display = 'block'; // Muestra el botón de "Jugar de nuevo"
    }
});

let isFirstGame = true;
let selectedTime = 60;
let selectedScore = 100;

function selectDifficulty(time, score) {
    selectedTime = time; // Guarda la dificultad seleccionada
    selectedScore = score;
    timeLeft = selectedTime; // Establece el tiempo para la dificultad seleccionada
    baseScore = selectedScore; // Establece el puntaje base para la dificultad seleccionada
    timerDisplay.textContent = timeLeft; // Muestra el tiempo seleccionado
    document.getElementById('difficulty-selection').style.display = 'none'; // Oculta el selector de dificultad
    startButton.style.display = 'block'; // Muestra el botón de inicio
}

function startGame() {
    timeLeft = selectedTime; // Usa el tiempo de la dificultad seleccionada
    baseScore = selectedScore; // Usa el puntaje de la dificultad seleccionada
    document.getElementById('difficulty-selection').style.display = 'none'; // Oculta el selector de dificultad
    startButton.style.display = 'none';
    gameActive = true;

    // Siempre mezcla el tablero al iniciar el juego
    matrix = shuffleMatrix();
    drawTokens();

    isFirstGame = false;

    // Inicia el temporizador inmediatamente
    timerDisplay.textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            gameActive = false;
            showModal('¡Tiempo agotado!', 'No lograste completar el rompecabezas. ¿Quieres intentar de nuevo o cambiar la dificultad?');
            document.getElementById('difficulty-selection').style.display = 'block'; // Muestra el selector de dificultad
            startButton.style.display = 'block'; // Muestra el botón de inicio
        }
    }, 1000);
}

function addEventListeners() {
    let tokens = document.querySelectorAll('.token');
    tokens.forEach(token => token.addEventListener('click', (e) => {
        if (!gameActive) return;

        let actualPosition = searchPosition(token.innerText);
        let emptyPosition = searchPosition(' ');
        let movement = canItMove(actualPosition, emptyPosition);
        if (movement) {
            updateMatrix(token.innerText, actualPosition, emptyPosition);
            drawTokens();
            if (compareMatrix()) {
                clearInterval(timer);
                launchConfetti();
                actualizarPuntajeFinal();
                showModal('¡Felicidades!', `Has completado el rompecabezas. ¿Quieres intentar de nuevo o cambiar la dificultad?`);
                gameActive = false;
                score += baseScore; // Incrementa el puntaje con el puntaje base seleccionado
                scoreDisplay.textContent = `Puntuación: ${score}`;
                document.getElementById('difficulty-selection').style.display = 'block'; // Muestra el selector de dificultad
                startButton.style.display = 'block'; // Muestra el botón de inicio
            }
        }
    }));
}

function launchConfetti() {
    for (let i = 0; i < 4; i++) { // Lanza 4 ráfagas de confeti
        confetti({
            particleCount: 100,
            startVelocity: 30,
            spread: 360,
            origin: {
                x: Math.random(), // Posición aleatoria en el eje X
                y: Math.random() - 0.2 // Posición aleatoria en el eje Y
            }
        });
    }
}

function updateMatrix(element, actualPosition, emptyPosition) {
    matrix[actualPosition[0]][actualPosition[1]] = ' ';
    matrix[emptyPosition[0]][emptyPosition[1]] = element;
}

function canItMove(actualPosition, emptyPosition) {
    // Verifica si están en la misma fila o columna y si están adyacentes
    if (
        (actualPosition[0] === emptyPosition[0] && Math.abs(actualPosition[1] - emptyPosition[1]) === 1) || 
        (actualPosition[1] === emptyPosition[1] && Math.abs(actualPosition[0] - emptyPosition[0]) === 1)
    ) {
        return true;
    }
    return false;
}

function searchPosition(element) {
    let rowIndex = 0;
    let columnIndex = 0;
    matrix.forEach((row, index) => {
        let rowElement = row.findIndex(item => item === element);
        if (rowElement !== -1) {
            rowIndex = index;
            columnIndex = rowElement;
        }
    });
    return [rowIndex, columnIndex];
}

function drawTokens() {
    board.innerHTML = ''; // Limpia el tablero antes de redibujar
    matrix.forEach(row => row.forEach(element => {
        if (element === ' ') {
            board.innerHTML += `<div class="empty"></div>`;
        } else {
            board.innerHTML += `<div class="token">${element}</div>`;
        }
    }));
    addEventListeners(); // Vuelve a agregar los event listeners después de redibujar
}

function compareMatrix() {
    let finalMatrix = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', ' ']
    ];

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (matrix[i][j] !== finalMatrix[i][j]) {
                return false; // Si algún elemento no coincide, retorna false
            }
        }
    }
    return true; // Si todos los elementos coinciden, retorna true
}

// Inicializa el tablero
drawTokens();

// Agrega el evento al botón de inicio
startButton.addEventListener('click', startGame);

function actualizarPuntajeFinal() {
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
            const scoreElement = document.getElementById("user-score");
            if (scoreElement) scoreElement.textContent = `Score: ${updatedUser.score}`;
        })
        .catch(err => {
            console.error("❌ Error al actualizar puntaje:", err);
        });
    }
}
