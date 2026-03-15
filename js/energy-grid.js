import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "open2026-ee943.firebaseapp.com",
    projectId: "open2026-ee943",
    storageBucket: "open2026-ee943.appspot.com",
    messagingSenderId: "TU_ID",
    appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- REGISTRO DE ATLETAS ---
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

// --- ACTUALIZACIÓN EN TIEMPO REAL (ORDEN DESCENDENTE) ---
onSnapshot(query(collection(db, "athletes"), orderBy("totalPoints", "desc")), (snapshot) => {
    const maleTable = document.getElementById('leaderboard-male');
    const femaleTable = document.getElementById('leaderboard-female');
    const overallDiv = document.getElementById('overall-leaderboard');
    
    maleTable.innerHTML = ""; femaleTable.innerHTML = ""; overallDiv.innerHTML = "";
    let mPos = 1, fPos = 1, oPos = 1;
    const isAdmin = auth.currentUser !== null;

    snapshot.forEach((docSnap) => {
        const a = docSnap.data();
        const id = docSnap.id;

        // 1. TOP 10 GENERAL
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
                <td class="text-start">
                    <input type="text" 
                        class="input-name-edit ${!isAdmin ? 'pe-none' : ''}" 
                        value="${a.name}" 
                        ${!isAdmin ? 'readonly' : ''} 
                        onchange="updateName('${id}', this.value)">
                </td>
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

// --- FUNCIONES DE ACTUALIZACIÓN ---

window.updateName = async (id, newName) => {
    if (!newName) return;
    const athleteRef = doc(db, "athletes", id);
    try {
        await updateDoc(athleteRef, { name: newName });
    } catch (e) { console.error("Error al actualizar nombre:", e); }
};

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

// --- AUTH / LOGIN ---

window.promptLogin = () => {
    const pass = prompt("Contraseña de Admin:");
    if (pass) {
        signInWithEmailAndPassword(auth, "alber.urr@gmail.com", pass)
            .catch((error) => alert("Error: " + error.code));
    }
};

window.logout = () => {
    signOut(auth).then(() => {
        location.reload();
    });
};

onAuthStateChanged(auth, (user) => {
    const s = document.getElementById('admin-section'), b = document.getElementById('admin-banner');
    if (user) { 
        if(s) s.classList.remove('d-none'); 
        if(b) b.classList.remove('d-none'); 
    } else { 
        if(s) s.classList.add('d-none'); 
        if(b) b.classList.add('d-none'); 
    }
});import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
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
onSnapshot(query(collection(db, "athletes"), orderBy("totalPoints", "desc")), (snapshot) => {
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
// --- FUNCIONES GLOBALES REPARADAS ---

window.promptLogin = () => {
    const pass = prompt("Contraseña de Administrador:");
    if (!pass) return;

    // Usamos tu correo real aquí
    signInWithEmailAndPassword(auth, "alber.urr@gmail.com", pass)
        .then(() => {
            alert("¡Login exitoso! Modo edición activado.");
        })
        .catch((error) => {
            console.error("Error completo:", error);
            if (error.code === 'auth/invalid-credential') {
                alert("La contraseña no coincide con el usuario registrado en Firebase.");
            } else {
                alert("Error de Firebase: " + error.code);
            }
        });
};

window.logout = () => {
    signOut(auth).then(() => {
        alert("Sesión cerrada");
        location.reload(); 
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
    } catch (e) { 
        alert("Error al guardar en la base de datos: " + e.message); 
    }
};

// --- OBSERVADOR DE ESTADO (VIGILA SI ESTÁS LOGUEADO) ---
onAuthStateChanged(auth, (user) => {
    const s = document.getElementById('admin-section');
    const b = document.getElementById('admin-banner');
    
    if (user) {
        console.log("Sesión activa para:", user.email);
        if(s) s.classList.remove('d-none');
        if(b) b.classList.remove('d-none');
    } else {
        console.log("No hay sesión activa");
        if(s) s.classList.add('d-none');
        if(b) b.classList.add('d-none');
    }
});
