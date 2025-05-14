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
                if (typeof actualizarNavbar === "function") {
                    actualizarNavbar();
                }
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

        if (!user || !user._id) return;

        autocompleteList.innerHTML = '';
        if (query.length < 3) return;

        try {
            const res = await fetch('/api/users');
            const users = await res.json();

            const suggestions = users.filter(u =>
                u.username.toLowerCase().includes(query) &&
                u._id !== user._id
            ).slice(0, 5);

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

    document.addEventListener('click', (e) => {
        if (!autocompleteList.contains(e.target) && e.target !== friendInput) {
            autocompleteList.innerHTML = '';
        }
    });

    cargarRanking();
    cargarAmigos();

    document.getElementById("search-friend").addEventListener("input", aplicarFiltroAmigos);
});

let rankingData = [];
let currentPage = 1;
const itemsPerPage = 10;

function renderRankingPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const rankingTable = document.getElementById('ranking-table-body');
    rankingTable.innerHTML = "";

    rankingData.slice(start, end).forEach((user, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${start + index + 1}</td>
            <td>${user.username}</td>
            <td>${user.score}</td>
        `;
        rankingTable.appendChild(row);
    });

    document.getElementById("ranking-count").textContent = `Mostrando ${Math.min(end, rankingData.length)} de ${rankingData.length} jugadores`;
    renderPaginationControls();
}

function renderPaginationControls() {
    const totalPages = Math.ceil(rankingData.length / itemsPerPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === currentPage ? "active" : ""}`;
        li.innerHTML = `<button class="page-link">${i}</button>`;
        li.addEventListener("click", () => {
            currentPage = i;
            renderRankingPage(currentPage);
        });
        pagination.appendChild(li);
    }
}

async function cargarRanking() {
    try {
        const res = await fetch("/api/users");
        const users = await res.json();
        rankingData = users.sort((a, b) => b.score - a.score);
        renderRankingPage(currentPage);
    } catch (err) {
        console.error("Error al cargar ranking:", err);
    }
}

let amigosData = [];
let filteredFriends = [];
let currentFriendPage = 1;
const friendsPerPage = 10;

function renderFriendsPage(page) {
    const start = (page - 1) * friendsPerPage;
    const end = start + friendsPerPage;
    const friendsList = document.getElementById('friends-list');
    friendsList.innerHTML = "";

    const total = filteredFriends.length;

    filteredFriends.slice(start, end).forEach(friend => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            <span>@${friend.username}</span>
            <div class="btn-group btn-group-sm">
                <button class="btn btn-success btn-donar" data-username="${friend.username}">🎁</button>
                <button class="btn btn-danger btn-eliminar" data-username="${friend.username}">🗑️</button>
            </div>`;
        friendsList.appendChild(li);
    });

    document.getElementById("friends-count").textContent = `Mostrando ${Math.min(end, total)} de ${total} amigos`;
    renderFriendPaginationControls();
}

function renderFriendPaginationControls() {
    const totalPages = Math.ceil(filteredFriends.length / friendsPerPage);
    const pagination = document.getElementById("pagination-friends");
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === currentFriendPage ? "active" : ""}`;
        li.innerHTML = `<button class="page-link">${i}</button>`;
        li.addEventListener("click", () => {
            currentFriendPage = i;
            renderFriendsPage(currentFriendPage);
        });
        pagination.appendChild(li);
    }
}

async function cargarAmigos() {
    try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        if (!user || !user._id) return;

        const res = await fetch(`/api/users/${user._id}/friends`);
        const friends = await res.json();

        amigosData = friends;
        filteredFriends = [...friends];
        renderFriendsPage(currentFriendPage);
    } catch (err) {
        console.error("Error al cargar amigos:", err);
    }
}

function aplicarFiltroAmigos() {
    const filtro = document.getElementById("search-friend").value.toLowerCase();
    filteredFriends = amigosData.filter(amigo =>
        amigo.username.toLowerCase().includes(filtro)
    );

    currentFriendPage = 1;
    renderFriendsPage(currentFriendPage);
}
