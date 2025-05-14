document.addEventListener('DOMContentLoaded', () => {
  // Sincroniza localStorage a sessionStorage si es necesario
if (!sessionStorage.getItem("user") && localStorage.getItem("user")) {
  sessionStorage.setItem("user", localStorage.getItem("user"));
}

    const userInfo = document.getElementById('user-info');
    const registerButton = document.getElementById('register-button');
    const userPhoto = document.getElementById('user-photo');
    const userName = document.getElementById('user-name');
    const userScore = document.getElementById('user-score');
  
    const storedUser = sessionStorage.getItem('user');
    const localStorageuser = localStorage.getItem('user');
  
    let user = null;
    if (storedUser) {
      user = JSON.parse(storedUser);
    } else if (localStorageuser) {
      user = JSON.parse(localStorageuser);
    }
    if (user) {
      userInfo.style.display = 'flex';
      registerButton.style.display = 'none';
  
      userPhoto.src = user.url || 'https://i.imgur.com/eRj7qZp.png';
      userName.textContent = user.username || 'Usuario';
      userScore.textContent = `Score: ${user.score ?? 0}`;
    } else {
      userInfo.style.display = 'none';
      registerButton.style.display = 'block';
    }
  });
  
  
  async function confirmarGuardado() {
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;
  
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user || !user._id) {
      alert("Error: Usuario no autenticado.");
      return;
    }
  
    const updateData = {};
    if (email) updateData.email = email;
    if (password) updateData.password = password;
  
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      });
  
      if (!res.ok) throw new Error("No se pudo actualizar");
  
      const updatedUser = await res.json();
      // Opcional: actualizamos el sessionStorage con el nuevo correo si cambió
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
  
      alert("Cambios guardados exitosamente.");
  
      // Cerrar ambos modales
      const saveModal = bootstrap.Modal.getInstance(document.getElementById("confirmSaveModal"));
      const configModal = bootstrap.Modal.getInstance(document.getElementById("settingsModal"));
      saveModal.hide();
      configModal.hide();
  
    } catch (err) {
      console.error(err);
      alert("Hubo un error al guardar los cambios.");
    }
  }


  async function confirmarEliminacion() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user || !user._id) {
      alert("Error: Usuario no autenticado.");
      return;
    }
  
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "DELETE"
      });
  
      if (!res.ok) throw new Error("No se pudo eliminar la cuenta.");
  
      alert("Cuenta eliminada.");
  
      sessionStorage.removeItem("user");
      localStorage.removeItem('user');

      window.location.href = "login.html";
    } catch (err) {
      console.error(err);
      alert("Hubo un error al eliminar la cuenta.");
    }
  }

  function cerrarSesion() {
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }

function actualizarNavbar() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) return;

  const userScore = document.getElementById('user-score');
  const userName = document.getElementById('user-name');
  const userPhoto = document.getElementById('user-photo');

  if (userScore) userScore.textContent = `Score: ${user.score ?? 0}`;
  if (userName) userName.textContent = user.username ?? "Usuario";
  if (userPhoto) userPhoto.src = user.url || 'https://i.imgur.com/eRj7qZp.png';
}

window.actualizarNavbar = actualizarNavbar;