document.addEventListener('DOMContentLoaded', () => {
    //funcion principal para verificar y aplicar bloqueos de juegos
    function initializeGameLocks() {
      applyNumpuzLock();
      
    }
    
    // Función específica para el juego NUMPUZ
    function applyNumpuzLock() {
      const numpuzCard = document.getElementById('numpuz-card');
      const numpuzLink = numpuzCard?.closest('a');
      if (!numpuzCard || !numpuzLink) return;
    
      numpuzCard.style.position = 'relative';
    
      const user = getUserFromStorage();
    
      removeExistingLockOverlay(numpuzCard);
      removeBlurFromCardContent(numpuzCard);
    
      if (!user || user.score < 1000) {
        const pointsNeeded = user ? 1000 - user.score : 'Inicia sesión';
        const lockOverlay = createLockOverlay(
          typeof pointsNeeded === 'number'
            ? `Juego bloqueado, debes tener 1000 puntos para poder jugarlo!<br>Te faltan ${pointsNeeded} puntos.`
            : `Inicia sesión y desbloquea este juego`
        );
        numpuzCard.appendChild(lockOverlay);
        applyBlurToCardContent(numpuzCard);
    
        //bloquea el click en el enlace
        numpuzLink.addEventListener('click', function (e) {
          e.preventDefault();
        });
      }
    }
    
    function getUserFromStorage() {
        const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
        console.log("Raw storedUser:", storedUser);
        try {
          return storedUser ? JSON.parse(storedUser) : null;
        } catch (e) {
          console.error("Error al parsear user:", e);
          return null;
        }
      }
    
    // Crear el overlay de bloqueo con mensaje personalizado
    function createLockOverlay(message) {
      const overlay = document.createElement('div');
      overlay.className = 'game-lock-overlay';
      
      ensureLockStyles();
      
      //icono del candado
      const lockIcon = document.createElement('i');
      lockIcon.className = 'bi bi-lock-fill game-lock-icon';
      
      const messageElement = document.createElement('p');
      messageElement.className = 'game-lock-message';
      messageElement.innerHTML = message;
      
      overlay.appendChild(lockIcon);
      overlay.appendChild(messageElement);
      
      return overlay;
    }
    
    //eliminar overlay existente si lo hay
    function removeExistingLockOverlay(card) {
      const existingOverlay = card.querySelector('.game-lock-overlay');
      if (existingOverlay) {
        card.removeChild(existingOverlay);
      }
    }
    
    //aplicar efecto de desenfoque a los contenidos de la tarjeta
    function applyBlurToCardContent(card) {
      const elements = card.querySelectorAll('.game-title, .game-content, img');
      elements.forEach(el => el.classList.add('blurred-content'));
    }
    
    //quitar efecto de desenfoque
    function removeBlurFromCardContent(card) {
      const elements = card.querySelectorAll('.game-title, .game-content, img');
      elements.forEach(el => el.classList.remove('blurred-content'));
    }
    
    //asegurar que los estilos necesarios estén en la página
    function ensureLockStyles() {
      if (!document.getElementById('game-lock-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'game-lock-styles';
        styleSheet.innerHTML = `
          .game-lock-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10;
            border-radius: 20px;
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            pointer-events: all;
          }
          
          .game-lock-icon {
            font-size: 3rem;
            color: gold;
            margin-bottom: 1rem;
            animation: pulse 1.5s infinite;
          }
          
          .game-lock-message {
            color: white;
            text-align: center;
            font-weight: 600;
            padding: 0 20px;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          
          .blurred-content {
            filter: blur(3px);
          }
        `;
        document.head.appendChild(styleSheet);
      }
    }
    

    if (!Element.prototype.matches) {
      Element.prototype.matches = Element.prototype.msMatchesSelector || 
                                Element.prototype.webkitMatchesSelector;
    }
    
    if (!Element.prototype.closest) {
      Element.prototype.closest = function(s) {
        var el = this;
        do {
          if (el.matches(s)) return el;
          el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
      };
    }
    
    document.querySelectorAll = document.querySelectorAll || function(selectors) {
      return document.querySelectorAll(selectors);
    };
    
    document.querySelector = document.querySelector || function(selectors) {
      return document.querySelector(selectors);
    };
    
    const originalQuerySelector = Element.prototype.querySelector;
    const originalQuerySelectorAll = Element.prototype.querySelectorAll;
    
    Element.prototype.querySelector = function(selector) {
      if (selector.includes(':contains(')) {
        const containsText = selector.match(/:contains\("(.+?)"\)/)[1];
        const baseSelector = selector.replace(/:contains\("(.+?)"\)/, '');
        
        const elements = originalQuerySelectorAll.call(this, baseSelector);
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].textContent.includes(containsText)) {
            return elements[i];
          }
        }
        return null;
      }
      return originalQuerySelector.call(this, selector);
    };
    
    //listener para cambios en sessionStorage (login/logout)
    window.addEventListener('storage', function(e) {
      if (e.key === 'user') {
        initializeGameLocks();
      }
    });
    
    //listener para cambios en localStorage (si se usa para login)
    window.addEventListener('storage', function(e) {
      if (e.key === 'user') {
        initializeGameLocks();
      }
    });
    
    initializeGameLocks();
    
    setTimeout(initializeGameLocks, 500);
    
    //verificar cuando todo el contenido se haya cargado
    window.addEventListener('load', initializeGameLocks);
    
    document.addEventListener('userPointsUpdated', initializeGameLocks);
  });
  
  function refreshGameLocks() {
    const event = new Event('userPointsUpdated');
    document.dispatchEvent(event);
  }