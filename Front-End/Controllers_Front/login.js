document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = loginForm.querySelector('input[placeholder="Username"]').value;
      const password = loginForm.querySelector('input[placeholder="Password"]').value;
      const rememberMe = document.getElementById('rememberMe').checked;

      const credentials = { username, password };

      try {
        const res = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });

        const user = await res.json();

        if (!res.ok) {
          alert("❌ " + (user.message || "Login fallido"));
          return;
        }

        // Guardar en localStorage si "Remember Me" está activo, si no, en sessionStorage
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(user));

        alert(`✅ Bienvenido ${user.name}`);
        window.location.href = 'home.html';
      } catch (err) {
        console.error("❌ Error en login:", err);
        alert("❌ Error de conexión");
      }
    });
  }
});
