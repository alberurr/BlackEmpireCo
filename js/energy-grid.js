import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDzitlibJbRU1pz0nP_z01_b-fH1a3N70",
  authDomain: "open2026-ee943.firebaseapp.com",
  databaseURL: "https://open2026-ee943-default-rtdb.firebaseio.com",
  projectId: "open2026-ee943",
  storageBucket: "open2026-ee943.firebasestorage.app",
  messagingSenderId: "170906799656",
  appId: "1:170906799656:web:9a9529b975b8a2fba72f1d",
  measurementId: "G-EGWH8ZC49E"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- FUNCIONES DE ACTUALIZACIÓN ---
async function updateName(id, val) {
    try { await updateDoc(doc(db, "athletes", id), { name: val }); } catch (e) { console.error(e); }
}

async function updateScoreValue(id, wodKey, val) {
    const v = parseInt(val) || 0;
    const ref = doc(db, "athletes", id);
    try {
        await updateDoc(ref, { [`scores.${wodKey}`]: v });
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const s = snap.data().scores;
            const total = (s.wod1 || 0) + (s.wod2 || 0) + (s.wod3 || 0);
            await updateDoc(ref, { totalPoints: total });
        }
    } catch (e) { console.error(e); }
}

async function updateScoreType(id, key, val) {
    try { await updateDoc(doc(db, "athletes", id), { [`scores.${key}`]: val }); } catch (e) { console.error(e); }
}

// --- FUNCIÓN PARA ELIMINAR ---
async function deleteAthlete(id, name) {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${name}?`)) {
        try {
            await deleteDoc(doc(db, "athletes", id));
        } catch (e) {
            console.error("Error al eliminar:", e);
            alert("No tienes permisos para eliminar.");
        }
    }
}

// --- LÓGICA DE RENDERIZADO ---
let currentSnapshot = null;

// --- LÓGICA DE RENDERIZADO (ACTUALIZADA PARA TODOS LOS PARTICIPANTES) ---
const renderTable = (snap) => {
    const mTable = document.getElementById('leaderboard-male');
    const fTable = document.getElementById('leaderboard-female');
    const oDiv = document.getElementById('overall-leaderboard');
    
    if (mTable) mTable.innerHTML = ""; 
    if (fTable) fTable.innerHTML = ""; 
    if (oDiv) oDiv.innerHTML = "";
    
    let mP = 1, fP = 1, oP = 1;
    const isAdmin = auth.currentUser !== null;

    snap.forEach((d) => {
        const a = d.data(); 
        const id = d.id;
        
        // --- SCORE GENERAL (MUESTRA A TODOS) ---
        // Eliminamos la condición "oP <= 10" para que no haya límite
        if (oDiv) {
            oDiv.innerHTML += `
                <div class="overall-item d-flex justify-content-between p-2 border-bottom border-secondary">
                    <span><b class="text-warning">#${oP++}</b> ${a.name} <small class="text-muted">(${a.gender[0]})</small></span>
                    <b>${a.totalPoints} PTS</b>
                </div>`;
        }

        // --- FILAS DE TABLAS POR GÉNERO ---
        const row = `<tr>
            <td>${a.gender === 'Male' ? mP++ : fP++}</td>
            <td><input type="text" class="input-name-edit" style="background:transparent; border:none; color:white; text-transform:uppercase; font-weight:bold; width:100%;" value="${a.name}" ${!isAdmin ? 'readonly' : ''} onchange="updateName('${id}', this.value)"></td>
            ${[1,2,3].map(n => `<td>
                <select onchange="updateScoreType('${id}', 'wod${n}Type', this.value)" class="form-select form-select-sm mb-1 ${a.scores['wod'+n+'Type']==='RX'?'text-rx':'text-s'}" style="font-size:0.6rem; background:#000; color:white; border:none;" ${!isAdmin?'disabled':''}>
                    <option value="RX" ${a.scores['wod'+n+'Type']==='RX'?'selected':''}>RX</option>
                    <option value="S" ${a.scores['wod'+n+'Type']==='S'?'selected':''}>S</option>
                </select>
                <input type="number" onchange="updateScoreValue('${id}', 'wod${n}', this.value)" class="form-control form-control-sm bg-dark text-light text-center" value="${a.scores['wod'+n]||0}" ${!isAdmin?'disabled':''}>
            </td>`).join('')}
            <td class="text-end fw-bold text-warning">${a.totalPoints}</td>
            ${isAdmin ? `<td><button onclick="deleteAthlete('${id}', '${a.name}')" class="btn-outline-danger">✕</button></td>` : ''}
        </tr>`;

        if (a.gender === 'Male' && mTable) mTable.innerHTML += row;
        else if (fTable) fTable.innerHTML += row;
    });
};

// --- ESCUCHADORES (MENOR A MAYOR) ---
onSnapshot(query(collection(db, "athletes"), orderBy("totalPoints", "asc")), (snap) => {
    currentSnapshot = snap;
    renderTable(snap);
});

onAuthStateChanged(auth, (u) => {
    const s = document.getElementById('admin-section');
    const b = document.getElementById('admin-banner');
    if (s) s.classList.toggle('d-none', !u);
    if (b) b.classList.toggle('d-none', !u);
    if (currentSnapshot) renderTable(currentSnapshot);
});

// --- EXPOSICIÓN GLOBAL ---
window.promptLogin = () => {
    const p = prompt("Password:");
    if (p) signInWithEmailAndPassword(auth, "alber.urr@gmail.com", p).catch(e => alert("Error: " + e.code));
};

window.logout = () => signOut(auth).then(() => location.reload());

window.registerAthlete = async () => {
    const n = document.getElementById('athleteName').value;
    const g = document.getElementById('athleteGender').value;
    if (!n) return alert("Nombre requerido");
    try {
        await addDoc(collection(db, "athletes"), { 
            name: n, gender: g, 
            scores: { wod1:0, wod1Type:'RX', wod2:0, wod2Type:'RX', wod3:0, wod3Type:'RX' }, 
            totalPoints:0, timestamp: new Date()
        });
        document.getElementById('athleteName').value = "";
    } catch (e) { console.error(e); }
};

window.updateName = updateName;
window.updateScoreValue = updateScoreValue;
window.updateScoreType = updateScoreType;
window.deleteAthlete = deleteAthlete; // Conexión con el botón de eliminar
