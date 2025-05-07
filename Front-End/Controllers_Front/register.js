document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');

  // Mostrar y ocultar el modal
  const modal = document.getElementById('register-modal');
  const openBtn = document.getElementById('open-register');
  const closeBtn = document.querySelector('.close-modal');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Validación de fortaleza de contraseña
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', function () {
      const passwordStrength = document.querySelector('.password-strength');
      const password = this.value;

      if (
        password.length >= 8 &&
        /[0-9]/.test(password) &&
        /[!@#$%^&?*]/.test(password)
      ) {
        passwordStrength.style.color = '#4CAF50';
        passwordStrength.textContent = 'Contraseña fuerte';
      } else if (password.length >= 6) {
        passwordStrength.style.color = '#FFC107';
        passwordStrength.textContent = 'Contraseña media';
      } else {
        passwordStrength.style.color = '#ddd';
        passwordStrength.textContent =
          'La contraseña debe tener al menos 8 caracteres, incluyendo números y símbolos (!@#$%^&?*).';
      }
    });
  }

  // Registro de usuario
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const inputs = registerForm.querySelectorAll('input');
      const password = inputs[3].value;
      const confirmPassword = inputs[4].value;

      if (password !== confirmPassword) {
        alert('❌ Las contraseñas no coinciden.');
        return;
      }

      const newUser = {
        name: inputs[0].value,
        email: inputs[1].value,
        username: inputs[2].value,
        password: password,
        date: new Date().toISOString(),
        gender: "other",
        url: "https://i.imgur.com/eRj7qZp.png",
        score: 0
      };

      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });

        const result = await res.json();

        if (!res.ok) {
          alert("❌ Error al registrar: " + (result.message || "Error desconocido"));
          return;
        }
        
        sessionStorage.setItem('user', JSON.stringify(result));
                
        alert(`✅ Usuario '${result.username}' registrado exitosamente`);
        registerForm.reset();
        modal.style.display = 'none';
        window.location.href = 'home.html';

      } catch (error) {
        console.error("❌ Error de red o del servidor:", error);
        alert("❌ Error al registrar: " + error.message);
      }
    });
  }
});
