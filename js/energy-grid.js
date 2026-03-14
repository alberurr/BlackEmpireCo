import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- Configuración Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyCDzitlibJbRU1pz0nP_z01_b-fH1a3N70",
    authDomain: "open2026-ee943.firebaseapp.com",
    projectId: "open2026-ee943",
    storageBucket: "open2026-ee943.firebasestorage.app",
    messagingSenderId: "170906799656",
    appId: "1:170906799656:web:9a9529b975b8a2fba72f1d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- Variables de Estado ---
let athletes = [];
let editMode = false;
const workouts = ["26.1", "26.2", "26.3"];
const ADMIN_EMAIL = "alber.urr@tuemail.com"; // 👈 CAMBIA ESTO por tu email de Firebase

// --- Escucha en Tiempo Real (onSnapshot) ---
// Cada vez que tú o alguien cambie un dato en Firebase, la web se actualiza sola.
onSnapshot(collection(db, "athletes"), (snapshot) => {
    athletes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    render();
});

// --- Funciones de Renderizado ---
function render() {
    renderTables();
    renderTop3();
}

function sumScores(a) {
    return Object.values(a.scores || {}).reduce((s, v) => s + (parseInt(v) || 0), 0);
}

function renderTables() {
    const container = document.getElementById("gridBody");
    if (!container) return;
    container.innerHTML = "";
    
    const categories = [...new Set(athletes.map(a => a.category))];

    categories.forEach(cat => {
        // Ordenamos: Menos puntos arriba (Ranking CrossFit)
        // Si prefieres Más repeticiones arriba, cambia a: sumScores(b) - sumScores(a)
        const sorted = athletes.filter(a => a.category === cat)
            .sort((a, b) => sumScores(a) - sumScores(b));

        let html = `
            <div class="category-section">
                <h3 class="panel-title" style="margin-top:25px">${cat}</h3>
                <table class="scores-table">
                    <thead>
                        <tr>
                            <th>Pos</th>
                            <th style="text-align:left">Atleta</th>
                            ${workouts.map(w => `<th>WOD ${w}</th>`).join('')}
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        sorted.forEach((a, index) => {
            html += `
                <tr>
                    <td style="color:#888">${index + 1}</td>
                    <td style="text-align:left; font-weight:bold">
                        ${a.name}
                    </td>
                    ${workouts.map(w => `
                        <td>
                            ${editMode 
                                ? `<input type="number" class="edit-score-input" data-id="${a.id}" data-wod="${w}" value="${a.scores[w] || 0}">` 
                                : (a.scores[w] || '0')}
                        </td>
                    `).join('')}
                    <td class="total-cell">${sumScores(a)}</td>
                </tr>`;
        });
        
        html += `</tbody></table></div>`;
        container.innerHTML += html;
    });

    if (editMode) renderSaveButton(container);
}

function renderTop3() {
    const container = document.getElementById("gridCards");
    if (!container) return;
    container.innerHTML = "";
    
    const categories = [...new Set(athletes.map(a => a.category))];

    categories.forEach(cat => {
        const sorted = athletes.filter(a => a.category === cat)
            .sort((a, b) => sumScores(a) - sumScores(b))
            .slice(0, 3);

        let block = `<div class="top-block"><h4>${cat}</h4>`;
        sorted.forEach((a, i) => {
            block += `
                <div class="top-card rank-${i + 1}">
                    <span><strong>#${i + 1}</strong> ${a.name}</span>
                    <span class="total-cell">${sumScores(a)} pts</span>
                </div>`;
        });
        container.innerHTML += block + `</div>`;
    });
}

function renderSaveButton(container) {
    const btn = document.createElement("button");
    btn.className = "save-button";
    btn.innerHTML = "💾 GUARDAR PUNTAJES";
    btn.onclick = async () => {
        const inputs = document.querySelectorAll(".edit-score-input");
        btn.innerText = "Cargando...";
        btn.disabled = true;

        for (let input of inputs) {
            const athleteId = input.dataset.id;
            const wod = input.dataset.wod;
            const val = parseInt(input.value) || 0;

            const athlete = athletes.find(a => a.id === athleteId);
            if (athlete.scores[wod] !== val) {
                athlete.scores[wod] = val;
                await updateDoc(doc(db, "athletes", athleteId), { scores: athlete.scores });
            }
        }
        btn.innerText = "💾 GUARDAR PUNTAJES";
        btn.disabled = false;
        alert("Leaderboard actualizado correctamente.");
    };
    container.appendChild(btn);
}

// --- Lógica de Autenticación Simplificada ---
async function showLogin() {
    const password = prompt("Introduce la clave de acceso:");

    if (password) {
        try {
            // Usamos el email fijo para que solo pidas la clave
            await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
        } catch (error) {
            console.error("Error de login:", error);
            alert("Clave incorrecta o error de conexión.");
        }
    }
}

async function exitEditMode() {
    try {
        await signOut(auth);
        alert("Sesión cerrada.");
    } catch (error) {
        console.error("Error al salir:", error);
    }
}

// --- Manejo de Atletas Nuevos ---
document.getElementById("addAthleteForm").onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById("newName").value;
    const cat = document.getElementById("newCategory").value;
    const photo = document.getElementById("newPhoto").value;

    const newA = {
        name: name,
        category: cat,
        photo: photo || "",
        scores: { "26.1": 0, "26.2": 0, "26.3": 0 }
    };

    try {
        await addDoc(collection(db, "athletes"), newA);
        e.target.reset();
        alert("Atleta registrado.");
    } catch (err) {
        alert("Error al registrar atleta.");
    }
};

// --- Listeners de Botones ---
document.getElementById("editAccessBtn").onclick = showLogin;
document.getElementById("exitEditBtn").onclick = exitEditMode;

// Escuchar cambios de sesión para activar/desactivar modo edición
onAuthStateChanged(auth, (user) => {
    editMode = !!user;
    document.getElementById("editBanner").style.display = editMode ? "flex" : "none";
    document.getElementById("addAthletePanel").style.display = editMode ? "block" : "none";
    render();
});
