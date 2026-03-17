import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

// --- LÓGICA DE RANKING (MENOR SCORE = MEJOR POSICIÓN) ---

async function recalculateRankings() {
    // Obtenemos todos los atletas actuales
    const snap = await getDocs(collection(db, "athletes"));
    const athletes = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const categories = ['Male', 'Female'];
    const wods = ['wod1', 'wod2', 'wod3'];

    for (const cat of categories) {
        const list = athletes.filter(a => a.gender === cat);
        const totals = {}; // Para acumular puntos de posición
        list.forEach(a => totals[a.id] = 0);

        wods.forEach(wod => {
            // Ordenamos: a - b (Ascendente: 5 seg va antes que 10 seg)
            const sorted = [...list].sort((a, b) => (a.scores[wod] || 0) - (b.scores[wod] || 0));
            
            sorted.forEach((ath, index) => {
                // Posición 1 = 1 punto, Posición 2 = 2 puntos...
                totals[ath.id] += (index + 1);
            });
        });

        // Guardar el total de puntos acumulados en la DB
        for (const id in totals) {
            await updateDoc(doc(db, "athletes", id), { totalPoints: totals[id] });
        }
    }
}

// --- FUNCIONES DE ACCIÓN ---

async function updateScoreValue(id, wodKey, val) {
    const v = parseInt(val) || 0;
    try {
        // Primero actualizamos el valor del WOD
        await updateDoc(doc(db, "athletes", id), { [`scores.${wodKey}`]: v });
        // Luego recalculamos el ranking de todos
        await recalculateRankings();
    } catch (e) { console.error(e); }
}

async function updateName(id, val) {
    try { await updateDoc(doc(db, "athletes", id), { name: val }); } catch (e) { console.error(e); }
}

async function updateScoreType(id, key, val) {
    try { await updateDoc(doc(db, "athletes", id), { [`scores.${key}`]: val }); } catch (e) { console.error(e); }
}

async function deleteAthlete(id, name) {
    if (confirm(`¿Eliminar a ${name}?`)) {
        try { 
            await deleteDoc(doc(db, "athletes", id)); 
            await recalculateRankings(); 
        } catch (e) { console.error(e); }
    }
}

// --- RENDERIZADO UI ---
let currentSnapshot = null;

const renderTable = (snap) => {
    const mTable = document.getElementById('leaderboard-male');
    const fTable = document.getElementById('leaderboard-female');
    const oDiv = document.getElementById('overall-leaderboard');
    
    if (mTable) mTable.innerHTML = ""; 
    if (fTable) fTable.innerHTML = ""; 
    if (oDiv) oDiv.innerHTML = "";
    
    let mP = 1, fP = 1, oP = 1;
    const isAdmin = auth.currentUser !== null;

    // Firebase ya nos da los datos ordenados por totalPoints (menor a mayor)
    snap.forEach((d) => {
        const a = d.data(); const id = d.id;
        
        const cardHTML = `
            <div class="athlete-card">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center">
                        <span class="badge bg-warning text-dark me-2">#${a.gender === 'Male' ? mP++ : fP++}</span>
                        <input type="text" class="input-name-edit" value="${a.name}" ${!isAdmin ? 'readonly' : ''} onchange="updateName('${id}', this.value)">
                    </div>
                    <div class="total-cell h5 mb-0">${a.totalPoints} <small style="font-size:0.6em; color:#888;">RANK</small></div>
                </div>
                <div class="d-flex gap-2 w-100 justify-content-between">
                    ${[1, 2, 3].map(n => `
                        <div class="wod-box">
                            <div class="d-flex justify-content-between mb-1">
                                <span style="font-size:0.55rem; color:#888;">W${n}</span>
                                <select onchange="updateScoreType('${id}', 'wod${n}Type', this.value)" 
                                        class="form-select-sm border-0 ${a.scores['wod'+n+'Type']==='RX'?'text-rx':'text-s'}" 
                                        style="font-size:0.6rem; background:rgba(255,255,255,0.1); color:white;" ${!isAdmin?'disabled':''}>
                                    <option value="RX" ${a.scores['wod'+n+'Type']==='RX'?'selected':''}>RX</option>
                                    <option value="S" ${a.scores['wod'+n+'Type']==='S'?'selected':''}>S</option>
                                </select>
                            </div>
                            <input type="number" onchange="updateScoreValue('${id}', 'wod${n}', this.value)" 
                                   class="form-control form-control-sm bg-transparent text-white border-0 text-center p-0 fw-bold" 
                                   value="${a.scores['wod'+n]||0}" ${!isAdmin?'disabled':''}>
                        </div>
                    `).join('')}
                    ${isAdmin ? `<button onclick="deleteAthlete('${id}', '${a.name}')" class="btn-outline-danger border-0 p-1"><i class="fas fa-trash-alt" style="font-size:0.8rem;"></i></button>` : ''}
                </div>
            </div>`;

        if (oP <= 10 && oDiv) {
            oDiv.innerHTML += `<div class="athlete-card d-flex justify-content-between align-items-center py-2 px-3">
                <span><b class="text-warning">#${oP++}</b> <span class="ms-2 text-uppercase" style="font-size:0.9em;">${a.name}</span> <small class="text-muted ms-1" style="font-size:0.7em;">(${a.gender[0]})</small></span>
                <b class="text-warning">${a.totalPoints}</b>
            </div>`;
        }

        if (a.gender === 'Male' && mTable) mTable.innerHTML += cardHTML;
        else if (fTable) fTable.innerHTML += cardHTML;
    });
};

// --- LISTENERS ---

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

// --- GLOBALES ---
window.promptLogin = () => {
    const p = prompt("Password:");
    if (p) signInWithEmailAndPassword(auth, "alber.urr@gmail.com", p).catch(() => alert("Error"));
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
            totalPoints:999, timestamp: new Date() 
        });
        await recalculateRankings();
        document.getElementById('athleteName').value = "";
    } catch (e) { console.error(e); }
};

window.updateName = updateName;
window.updateScoreValue = updateScoreValue;
window.updateScoreType = updateScoreType;
window.deleteAthlete = deleteAthlete;
