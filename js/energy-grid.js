// energy-grid.js
// Versión adaptada para usar GitHub (data/athletes.json) vía Cloudflare Worker.
// Reemplaza `workerUrl` por la URL de tu Worker desplegado.

const workerUrl = "https://<tu-subdominio>.workers.dev"; // <-- REEMPLAZA con tu Worker
const repoRawUrl = "https://raw.githubusercontent.com/alberurr/BlackEmpireCo/main/data/athletes.json";

let athletes = [];
let editMode = false;
const EDIT_PASSWORD = "admin123";
const workouts = ["24.1", "24.2", "24.3", "24.4"];

// ======================================================
// CARGA DE DATOS
// ======================================================

async function loadAthletesFromRepo() {
  try {
    console.log("Cargando athletes.json desde repo...");
    const res = await fetch(repoRawUrl, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar athletes.json: " + res.status);
    athletes = await res.json();
    console.log("Atletas cargados:", athletes);
    renderTablesByCategory();
    renderCards();
  } catch (e) {
    console.error("Error cargando desde repo:", e);
    // fallback: mantener athletes vacío para que la UI no rompa
    athletes = athletes || [];
    renderTablesByCategory();
    renderCards();
  }
}

// ======================================================
// RENDERIZADO
// ======================================================

function renderTablesByCategory() {
  const container = document.getElementById("gridBody");
  if (!container) return console.warn("gridBody no encontrado en DOM");
  container.innerHTML = "";

  const categories = [...new Set(athletes.map(a => a.category || "Sin categoría"))];

  categories.forEach(category => {
    const title = document.createElement("h3");
    title.textContent = category;
    container.appendChild(title);

    const table = document.createElement("table");
    table.classList.add("scores-table");

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Nombre</th>
        ${workouts.map(w => `<th>${w}</th>`).join("")}
        <th>Total</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    const sorted = athletes
      .filter(a => (a.category || "Sin categoría") === category)
      .sort((a, b) => {
        const sum = arr => Object.values(arr || {}).reduce((s, v) => s + (parseInt(v) || 0), 0);
        return sum(b.scores) - sum(a.scores);
      });

    sorted.forEach(a => {
      const total = Object.values(a.scores || {}).reduce((s, v) => s + (parseInt(v) || 0), 0);
      const row = document.createElement("tr");
      row.dataset.id = a._id || "";

      if (editMode) {
        row.innerHTML = `
          <td><input type="text" value="${escapeHtml(a.name || "")}" data-field="name" data-id="${a._id || ""}" /></td>
          ${workouts.map(w => `<td><input type="number" value="${a.scores?.[w] ?? 0}" data-field="${w}" data-id="${a._id || ""}" /></td>`).join("")}
          <td class="total-cell">${total}</td>
        `;
      } else {
        row.innerHTML = `
          <td>${escapeHtml(a.name || "")}</td>
          ${workouts.map(w => `<td>${a.scores?.[w] ?? "-"}</td>`).join("")}
          <td>${total}</td>
        `;
      }

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  });

  if (editMode) {
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Guardar todos los cambios";
    saveBtn.classList.add("save-button");
    saveBtn.addEventListener("click", saveEdits);
    container.appendChild(saveBtn);
  }
}

function renderCards() {
  const container = document.getElementById("gridCards");
  if (!container) return console.warn("gridCards no encontrado en DOM");
  container.innerHTML = "";

  const categories = [...new Set(athletes.map(a => a.category || "Sin categoría"))];

  categories.forEach(category => {
    const block = document.createElement("div");
    block.classList.add("top-block");

    const title = document.createElement("h4");
    title.textContent = `Top 3 - ${category}`;
    block.appendChild(title);

    const sorted = athletes
      .filter(a => (a.category || "Sin categoría") === category)
      .sort((a, b) => {
        const sum = arr => Object.values(arr || {}).reduce((s, v) => s + (parseInt(v) || 0), 0);
        return sum(b.scores) - sum(a.scores);
      });

    sorted.slice(0, 3).forEach((a, i) => {
      const card = document.createElement("div");
      card.classList.add("top-card");
      if (i === 0) card.classList.add("rank-1");
      if (i === 1) card.classList.add("rank-2");
      if (i === 2) card.classList.add("rank-3");

      card.innerHTML = `
        <img src="${escapeHtml(a.photo || 'https://placehold.co/100')}" alt="${escapeHtml(a.name || '')}" />
        <h4>${i + 1}. ${escapeHtml(a.name || '')}</h4>
        <p>${Object.values(a.scores || {}).reduce((s, v) => s + (parseInt(v) || 0), 0)} pts</p>
      `;
      block.appendChild(card);
    });

    container.appendChild(block);
  });
}

// ======================================================
// UTILIDADES
// ======================================================

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ======================================================
// MODO EDICIÓN / AGREGAR ATLETA (via Worker)
// ======================================================

function showLogin() {
  const password = prompt("Ingresa la contraseña para modo edición:");
  if (password === EDIT_PASSWORD) {
    editMode = true;
    document.getElementById("editBanner") && (document.getElementById("editBanner").style.display = "block");
    document.getElementById("addAthletePanel") && (document.getElementById("addAthletePanel").style.display = "block");
    renderTablesByCategory();
    renderCards();
    console.log("Modo edición activado");
  } else {
    alert("Contraseña incorrecta");
  }
}

function exitEditMode() {
  editMode = false;
  document.getElementById("editBanner") && (document.getElementById("editBanner").style.display = "none");
  document.getElementById("addAthletePanel") && (document.getElementById("addAthletePanel").style.display = "none");
  renderTablesByCategory();
  renderCards();
  console.log("Modo edición desactivado");
}

// addAthlete: envía nuevo atleta al Worker que hace commit en data/athletes.json
async function addAthlete(event) {
  event.preventDefault();
  console.log("addAthlete invoked");

  const nameEl = document.getElementById("newName");
  const photoEl = document.getElementById("newPhoto");
  const categoryEl = document.getElementById("newCategory");

  if (!nameEl || !categoryEl) {
    alert("Formulario incompleto");
    return;
  }

  const newAthlete = {
    name: nameEl.value.trim(),
    photo: (photoEl && photoEl.value.trim()) || "https://placehold.co/100",
    category: categoryEl.value.trim(),
    scores: { "24.1": 0, "24.2": 0, "24.3": 0, "24.4": 0 }
  };

  try {
    const resp = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAthlete)
    });

    const json = await resp.json();
    if (!resp.ok) {
      console.error("Worker error:", json);
      alert("No se pudo guardar el atleta en el servidor. Revisa la consola del Worker.");
      return;
    }

    console.log("Atleta guardado via Worker:", json);
    document.getElementById("addAthleteForm") && document.getElementById("addAthleteForm").reset();
    await loadAthletesFromRepo();
  } catch (err) {
    console.error("Error en addAthlete:", err);
    alert("Error al conectar con el servidor. Revisa la consola.");
  }
}

// saveEdits: recoge inputs editables y reemplaza el archivo completo vía Worker (acción 'replace')
// Nota: tu Worker debe soportar recibir { action: "replace", items: [...] } para que esto funcione.
// Si tu Worker solo soporta 'add', adapta el Worker o implementa endpoint separado.
async function saveEdits() {
  console.log("saveEdits invoked");

  // Leer inputs editables
  const inputs = document.querySelectorAll("input[data-id]");
  inputs.forEach(input => {
    const id = input.dataset.id;
    const field = input.dataset.field;
    const athlete = athletes.find(a => a._id === id);
    if (!athlete) return;
    if (field === "name") {
      athlete.name = input.value;
    } else {
      athlete.scores = athlete.scores || {};
      athlete.scores[field] = parseInt(input.value) || 0;
    }
  });

  // Enviar array completo al Worker para reemplazar el archivo
  try {
    const payload = { action: "replace", items: athletes };
    const resp = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await resp.json();
    if (!resp.ok) {
      console.error("Worker replace error:", json);
      alert("No se pudieron guardar los cambios. Revisa la consola del Worker.");
      return;
    }

    console.log("Cambios guardados via Worker:", json);
    editMode = false;
    document.getElementById("editBanner") && (document.getElementById("editBanner").style.display = "none");
    document.getElementById("addAthletePanel") && (document.getElementById("addAthletePanel").style.display = "none");
    await loadAthletesFromRepo();
  } catch (err) {
    console.error("Error en saveEdits:", err);
    alert("Error al guardar cambios. Revisa la consola.");
  }
}

// ======================================================
// ARRANQUE Y EVENTOS
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded fired - arrancando app (GitHub flow)");
  loadAthletesFromRepo().catch(err => console.error("Error en loadAthletesFromRepo:", err));

  const editBtn = document.getElementById("editAccessBtn");
  console.log("editAccessBtn:", !!editBtn);
  if (editBtn) editBtn.addEventListener("click", showLogin);

  const exitBtn = document.getElementById("exitEditBtn");
  console.log("exitEditBtn:", !!exitBtn);
  if (exitBtn) exitBtn.addEventListener("click", exitEditMode);

  const addForm = document.getElementById("addAthleteForm");
  console.log("addAthleteForm:", !!addForm);
  if (addForm) {
    addForm.removeEventListener("submit", addAthlete);
    addForm.addEventListener("submit", addAthlete);
  }

  const closeEditModal = document.getElementById("closeEditModal");
  if (closeEditModal) closeEditModal.addEventListener("click", () => {
    const editModal = document.getElementById("editModal");
    if (editModal) editModal.style.display = "none";
  });

  const closeAthleteModal = document.getElementById("closeAthleteModal");
  if (closeAthleteModal) closeAthleteModal.addEventListener("click", () => {
    const athleteModal = document.getElementById("athleteModal");
    if (athleteModal) athleteModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    const athleteModal = document.getElementById("athleteModal");
    if (athleteModal && e.target === athleteModal) {
      athleteModal.style.display = "none";
    }
  });
});
