import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

let athletes = [];
let editMode = false;
const workouts = ["26.1", "26.2", "26.3"];

// --- Escucha en Tiempo Real ---
onSnapshot(collection(db, "athletes"), (snapshot) => {
    athletes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    render();
});

// --- Renderizado ---
function render() {
    renderTables();
    renderTop3();
}

function renderTables() {
    const container = document.getElementById("gridBody");
    container.innerHTML = "";
    const categories = [...new Set(athletes.map(a => a.category))];

    categories.forEach(cat => {
        const sorted = athletes.filter(a => a.category === cat)
            .sort((a, b) => sumScores(a) - sumScores(b));

        let html = `<h3>${cat}</h3><table><thead><tr><th>Atleta</th>${workouts.map(w=>`<th>${w}</th>`).join('')}<th>Total</th></tr></thead><tbody>`;
        
        sorted.forEach(a => {
            html += `<tr>
                <td>${a.name}</td>
                ${workouts.map(w => `<td>${editMode ? `<input type="number" data-id="${a.id}" data-wod="${w}" value="${a.scores[w] || 0}">` : (a.scores[w] || '-')}</td>`).join('')}
                <td style="color:#ff6b00; font-weight:bold">${sumScores(a)}</td>
            </tr>`;
        });
        container.appendChild(Object.assign(document.createElement('div'), { innerHTML: html + '</tbody></table>' }));
    });

    if (editMode) addSaveButton(container);
}

function sumScores(a) { return Object.values(a.scores || {}).reduce((s, v) => s + (parseInt(v) || 0), 0); }

function renderTop3() {
    const container = document.getElementById("gridCards");
    container.innerHTML = "";
    const categories = [...new Set(athletes.map(a => a.category))];

    categories.forEach(cat => {
        const top3 = athletes.filter(a => a.category === cat).sort((a,b) => sumScores(a)-sumScores(b)).slice(0,3);
        let block = `<div class="top-block"><h4>${cat}</h4>`;
        top3.forEach((a, i) => {
            block += `<div class="top-card rank-${i+1}"><strong>#${i+1} ${a.name}</strong><br>${sumScores(a)} pts</div>`;
        });
        container.innerHTML += block + `</div>`;
    });
}

// --- Acciones de Guardado ---
async function addSaveButton(container) {
    const btn = document.createElement("button");
    btn.className = "save-button";
    btn.innerText = "💾 Guardar Cambios del Open";
    btn.onclick = async () => {
        const inputs = document.querySelectorAll("input[data-id]");
        for (let input of inputs) {
            const athlete = athletes.find(a => a.id === input.dataset.id);
            athlete.scores[input.dataset.wod] = parseInt(input.value) || 0;
            await updateDoc(doc(db, "athletes", athlete.id), { scores: athlete.scores });
        }
        alert("Puntajes actualizados.");
    };
    container.appendChild(btn);
}

// --- Autenticación ---
document.getElementById("editAccessBtn").onclick = async () => {
    const email = prompt("Email Admin:");
    const pass = prompt("Password:");
    try { await signInWithEmailAndPassword(auth, email, pass); } catch { alert("Error"); }
};

document.getElementById("exitEditBtn").onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    editMode = !!user;
    document.getElementById("editBanner").style.display = editMode ? "flex" : "none";
    document.getElementById("addAthletePanel").style.display = editMode ? "block" : "none";
    render();
});

// Agregar Atleta
document.getElementById("addAthleteForm").onsubmit = async (e) => {
    e.preventDefault();
    const newA = {
        name: document.getElementById("newName").value,
        category: document.getElementById("newCategory").value,
        scores: { "26.1": 0, "26.2": 0, "26.3": 0 },
        photo: document.getElementById("newPhoto").value || ""
    };
    await addDoc(collection(db, "athletes"), newA);
    e.target.reset();
};
