import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDzitlibJbRU1pz0nP_z01_b-fH1a3N70",
  authDomain: "open2026-ee943.firebaseapp.com",
  projectId: "open2026-ee943",
  storageBucket: "open2026-ee943.firebasestorage.app",
  messagingSenderId: "170906799656",
  appId: "1:170906799656:web:9a9529b975b8a2fba72f1d",
  measurementId: "G-EGWH8ZC49E"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// REGISTRO DE ATLETAS (Nivel inicializado por WOD)
window.registerAthlete = async () => {
    const name = document.getElementById('athleteName').value;
    const gender = document.getElementById('athleteGender').value;
    if (!name) return alert("Ingresa un nombre");

    try {
        await addDoc(collection(db, "athletes"), {
            name, gender,
            scores: { 
                wod1: 0, wod1Type: 'RX', 
                wod2: 0, wod2Type: 'RX', 
                wod3: 0, wod3Type: 'RX' 
            },
            totalPoints: 0,
            timestamp: new Date()
        });
        document.getElementById('athleteName').value = "";
    } catch (e) { console.error("Error:", e); }
};

// ACTUALIZACIÓN EN TIEMPO REAL
onSnapshot(query(collection(db, "athletes"), orderBy("totalPoints", "asc")), (snapshot) => {
    const maleTable = document.getElementById('leaderboard-male');
    const femaleTable = document.getElementById('leaderboard-female');
    const overallDiv = document.getElementById('overall-leaderboard');
    
    maleTable.innerHTML = ""; femaleTable.innerHTML = ""; overallDiv.innerHTML = "";
    let mPos = 1, fPos = 1, oPos = 1;
    const isAdmin = auth.currentUser !== null;

    snapshot.forEach((docSnap) => {
        const a = docSnap.data();
        const id = docSnap.id;

        // 1. TOP 10 GENERAL (Cualquier género)
        if (oPos <= 10) {
            overallDiv.innerHTML += `
                <div class="overall-item d-flex justify-content-between align-items-center">
                    <div>
                        <span class="text-warning fw-bold me-2">#${oPos++}</span>
                        <span class="text-uppercase fw-bold">${a.name}</span>
                        <small class="text-muted ms-2">(${a.gender === 'Male' ? 'M' : 'F'})</small>
                    </div>
                    <div class="fw-bold">${a.totalPoints} <span class="small text-muted">PTS</span></div>
                </div>
            `;
        }

        // 2. FILAS PARA TABLAS DE GÉNERO
        const rowHTML = `
            <tr>
                <td class="text-center text-muted small">${a.gender === 'Male' ? mPos++ : fPos++}</td>
                <td class="fw-bold text-uppercase" style="font-size: 0.9rem;">${a.name}</td>
                ${[1, 2, 3].map(n => `
                    <td class="text-center">
                        <select onchange="updateScoreType('${id}', 'wod${n}Type', this.value)" 
                            class="form-select form-select-sm mb-1 border-0 ${a.scores['wod'+n+'Type'] === 'RX' ? 'text-rx' : 'text-s'}" 
                            style="font-size: 0.65rem; background: #000;" ${!isAdmin ? 'disabled' : ''}>
                            <option value="RX" ${a.scores['wod'+n+'Type'] === 'RX' ? 'selected' : ''}>RX</option>
                            <option value="S" ${a.scores['wod'+n+'Type'] === 'S' ? 'selected' : ''}>S</option>
                        </select>
                        <input type="number" onchange="updateScoreValue('${id}', 'wod${n}', this.value)" 
                            class="form-control form-control-sm bg-dark text-light border-secondary text-center" 
                            style="font-size: 0.8rem;" value="${a.scores['wod'+n]}" ${!isAdmin ? 'disabled' : ''}>
                    </td>
                `).join('')}
                <td class="text-end fw-bold text-warning">${a.totalPoints}</td>
            </tr>
        `;

        if (a.gender === 'Male') maleTable.innerHTML += rowHTML;
        else femaleTable.innerHTML += rowHTML;
    });
});

// ACTUALIZAR VALOR DEL SCORE
window.updateScoreValue = async (id, field, value) => {
    const val = parseInt(value) || 0;
    const athleteRef = doc(db, "athletes", id);
    const snap = await getDoc(athleteRef);
    if (snap.exists()) {
        const scores = snap.data().scores;
        scores[field] = val;
        const total = (scores.wod1 || 0) + (scores.wod2 || 0) + (scores.wod3 || 0);
        await updateDoc(athleteRef, { scores, totalPoints: total });
    }
};

// ACTUALIZAR TIPO (RX/S)
window.updateScoreType = async (id, field, value) => {
    const athleteRef = doc(db, "athletes", id);
    const snap = await getDoc(athleteRef);
    if (snap.exists()) {
        const scores = snap.data().scores;
        scores[field] = value;
        await updateDoc(athleteRef, { scores });
    }
};

// AUTH / LOGIN
// ... (Toda tu configuración de Firebase arriba queda igual)

// --- HACER FUNCIONES GLOBALES (ESTO ES LO QUE FALTA) ---
window.promptLogin = () => {
    const pass = prompt("Contraseña de Administrador:");
    if (pass) {
        signInWithEmailAndPassword(auth, "admin@open.com", pass)
            .then(() => {
                console.log("Admin logueado");
            })
            .catch((error) => {
                console.error(error);
                alert("Clave incorrecta o error de conexión");
            });
    }
};

window.logout = () => {
    signOut(auth).then(() => {
        location.reload(); // Recarga para bloquear todo de nuevo
    });
};

window.registerAthlete = async () => {
    const name = document.getElementById('athleteName').value;
    const gender = document.getElementById('athleteGender').value;
    if (!name) return alert("Ingresa un nombre");

    try {
        await addDoc(collection(db, "athletes"), {
            name, gender,
            scores: { 
                wod1: 0, wod1Type: 'RX', 
                wod2: 0, wod2Type: 'RX', 
                wod3: 0, wod3Type: 'RX' 
            },
            totalPoints: 0,
            timestamp: new Date()
        });
        document.getElementById('athleteName').value = "";
    } catch (e) { alert("Error al guardar: " + e.message); }
};

// --- EL OBSERVADOR DE ESTADO ---
onAuthStateChanged(auth, (user) => {
    const s = document.getElementById('admin-section');
    const b = document.getElementById('admin-banner');
    
    if (user) {
        if(s) s.classList.remove('d-none');
        if(b) b.classList.remove('d-none');
        console.log("Modo edición activado");
    } else {
        if(s) s.classList.add('d-none');
        if(b) b.classList.add('d-none');
    }
});
