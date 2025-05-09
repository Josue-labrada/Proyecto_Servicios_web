document.addEventListener("DOMContentLoaded", () => {
    const rankingTable = document.getElementById("ranking-table-body");
    const amigosList = document.getElementById("friends-list");
    const user = JSON.parse(sessionStorage.getItem("user"));
    let friendToDelete = null;
    let friendToDonate = null;
  
    async function cargarRankingGlobal() {
      try {
        const res = await fetch("/api/users");
        const users = await res.json();
        const top10 = users.sort((a, b) => b.score - a.score).slice(0, 10);
  
        rankingTable.innerHTML = "";
        top10.forEach((user, index) => {
          rankingTable.innerHTML += `
            <tr>
              <td>${index + 1}</td>
              <td>@${user.username}</td>
              <td>${user.score}</td>
            </tr>`;
        });
  
        document.getElementById("ranking-count").textContent = `Mostrando top ${top10.length} global`;
      } catch (err) {
        console.error("Error cargando ranking:", err);
      }
    }
  
    async function cargarAmigos() {
      try {
        const res = await fetch(`/api/users/${user._id}/friends`);
        const friends = await res.json();
  
        amigosList.innerHTML = "";
        friends.forEach(friend => {
          const li = document.createElement("li");
          li.className = "list-group-item d-flex justify-content-between align-items-center";
          li.innerHTML = `
            <span>@${friend.username}</span>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-success btn-donar" data-username="${friend.username}">Regalar puntos</button>
              <button class="btn btn-danger btn-eliminar" data-username="${friend.username}">Eliminar</button>
            </div>`;
          amigosList.appendChild(li);
        });
  
        document.getElementById("friends-count").textContent = `Mostrando ${friends.length} amigos`;
      } catch (err) {
        console.error("Error cargando amigos:", err);
      }
    }
  
    // Eventos para buscar y agregar amigo
    document.getElementById("search-friend-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const gamertag = document.getElementById("friend-search-input").value.trim();
      if (!user || !gamertag) return;
  
      try {
        const res = await fetch(`/api/users/${user._id}/add-friend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id, friendUsername: gamertag })
        });
  
        const result = await res.json();
        if (res.ok) {
          alert(`✅ @${result.friend.username} agregado exitosamente`);
          document.getElementById("friend-search-input").value = '';
          cargarAmigos();
        } else {
          alert(`❌ ${result.message}`);
        }
      } catch (err) {
        console.error("Error al agregar amigo:", err);
        alert("❌ Error al intentar agregar amigo");
      }
    });
  
    // Delegación para botones
    amigosList.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-eliminar")) {
        friendToDelete = e.target.dataset.username;
        document.getElementById("friendToDeleteName").textContent = `@${friendToDelete}`;
        new bootstrap.Modal(document.getElementById("confirmDeleteFriendModal")).show();
      } else if (e.target.classList.contains("btn-donar")) {
        friendToDonate = e.target.dataset.username;
        document.getElementById("friendToDonateName").textContent = `@${friendToDonate}`;
        document.getElementById("pointsToDonate").value = "";
        new bootstrap.Modal(document.getElementById("confirmDonatePointsModal")).show();
      }
    });
  
    // Confirmar eliminar amigo
    document.getElementById("confirmDeleteFriendBtn").addEventListener("click", async () => {
      try {
        const res = await fetch(`/api/users/${user._id}/remove-friend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ friendUsername: friendToDelete })
        });
        const result = await res.json();
        if (res.ok) {
          alert(`✅ @${friendToDelete} eliminado`);
          cargarAmigos();
          bootstrap.Modal.getInstance(document.getElementById("confirmDeleteFriendModal")).hide();
        } else {
          alert(`❌ ${result.message}`);
        }
      } catch (err) {
        alert("❌ Error al eliminar amigo");
      }
    });
  
    // Confirmar donar puntos
    document.getElementById("confirmDonatePointsBtn").addEventListener("click", async () => {
      const points = parseInt(document.getElementById("pointsToDonate").value);
      if (!points || points <= 0) return alert("❌ Ingresa una cantidad válida de puntos");
  
      try {
        const res = await fetch(`/api/users/${user._id}/donate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toUsername: friendToDonate, points })
        });
        const result = await res.json();
        if (res.ok) {
          alert(`🎁 Regalaste ${points} puntos a @${friendToDonate}`);
          sessionStorage.setItem("user", JSON.stringify(result.sender));
          document.getElementById("user-score").textContent = 'Score: ' + result.sender.score;
          cargarAmigos();
          cargarRankingGlobal();
          bootstrap.Modal.getInstance(document.getElementById("confirmDonatePointsModal")).hide();
        } else {
          alert(`❌ ${result.message}`);
        }
      } catch (err) {
        alert("❌ Error al regalar puntos");
      }
    });

    const friendInput = document.getElementById('friend-search-input');
const autocompleteList = document.getElementById('autocomplete-list');

friendInput.addEventListener('input', async () => {
  const query = friendInput.value.trim().toLowerCase();
  const user = JSON.parse(sessionStorage.getItem('user'));

  autocompleteList.innerHTML = '';
  if (query.length < 3) return;

  try {
    const res = await fetch('/api/users');
    const users = await res.json();

    const suggestions = users.filter(u =>
      u.username.toLowerCase().includes(query) &&
      u._id !== user._id // no te sugiere a ti mismo
    ).slice(0, 5); // solo 5 sugerencias

    suggestions.forEach(u => {
      const item = document.createElement('li');
      item.className = 'list-group-item list-group-item-action';
      item.textContent = u.username;
      item.addEventListener('click', () => {
        friendInput.value = u.username;
        autocompleteList.innerHTML = '';
      });
      autocompleteList.appendChild(item);
    });
  } catch (err) {
    console.error('Error en autocomplete:', err);
  }
});

// Cerrar lista si haces clic fuera
document.addEventListener('click', (e) => {
  if (!autocompleteList.contains(e.target) && e.target !== friendInput) {
    autocompleteList.innerHTML = '';
  }
});

  
    // Cargar al iniciar
    cargarRankingGlobal();
    cargarAmigos();
  });
  