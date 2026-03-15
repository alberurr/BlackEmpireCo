import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

async function updateName(id, newName) {
    if (!newName) return;
    try {
        await updateDoc(doc(db, "athletes", id), { name: newName });
    } catch (e) { console.error("Error nombre:", e); }
}

async function updateScoreValue(id, wodKey, value) {
    const val = parseInt(value) || 0;
    const athleteRef = doc(db, "athletes", id);
    try {
        await updateDoc(athleteRef, { [`scores.${wodKey}`]: val });
        const snap = await getDoc(athleteRef);
        if (snap.exists()) {
            const s = snap.data().scores;
            const newTotal = (s.wod1 || 0) + (s.wod2 || 0) + (s.wod3 || 0);
            await updateDoc(athleteRef, { totalPoints: newTotal });
        }
    } catch (e) { console.error("Error score:", e); }
}

async function updateScoreType(id, typeKey, value) {
    try {
        await updateDoc(doc(db, "athletes", id), { [`scores.${typeKey}`]: value });
    } catch (e) { console.error("Error tipo:", e); }
}

// --- LEADERBOARD EN TIEMPO REAL ---

onSnapshot(query(collection(db, "athletes"), orderBy("totalPoints", "desc")), (snapshot) => {
    const maleTable = document.getElementById('leaderboard-male');
    const femaleTable = document.getElementById('leaderboard-female');
    const overallDiv = document.getElementById('overall-leaderboard');
    
    if (maleTable) maleTable.innerHTML = ""; 
    if (femaleTable) femaleTable.innerHTML = ""; 
    if (overallDiv) overallDiv.innerHTML = "";

    let mPos = 1, fPos = 1, oPos = 1;
    const isAdmin = auth.currentUser !== null;

    snapshot.forEach((docSnap) => {
        const a = docSnap.data();
        const id = docSnap.id;

        if (oPos <= 10 && overallDiv) {
            overallDiv.innerHTML += `
                <div class="overall-item d-flex justify-content-between align-items-center p-2 border-bottom border-secondary">
                    <div>
                        <span class="text-warning fw-bold me-2">#${oPos++}</span>
                        <span class="text-uppercase fw-bold">${a.name}</span>
                        <small class="text-muted ms-2">(${a.gender === 'Male' ? 'M' : 'F'})</small>
                    </div>
                    <div class="fw-bold">${a.totalPoints} PTS</div>
                </div>`;
        }

        const rowHTML = `
            <tr>
                <td class="text-center text-muted small">${a.gender === 'Male' ? mPos++ : fPos++}</td>
                <td class="text-start">
                    <input type="text" class="input-name-edit" 
                        style="background:transparent; border:none; color:white; text-transform:uppercase; font-weight:bold; width:100%;"
                        value="${a.name}" ${!isAdmin ? 'readonly' : ''} 
                        onchange="updateName('${id}', this.value)">
                </td>
                ${[1, 2, 3].map(n => `
                    <td class="text-center">
                        <select onchange="updateScoreType('${id}', 'wod${n}Type', this.value)" 
                            class="form-select form-select-sm mb-1 ${a.scores['wod'+n+'Type'] === 'RX' ? 'text-rx' : 'text-s'}" 
                            style="font-size: 0.65rem; background: #000; color:white; border:none;" ${!isAdmin ? 'disabled' : ''}>
                            <option value="RX" ${a.scores['wod'+n+'Type'] === 'RX' ? 'selected' : ''}>RX</option>
                            <option value="S" ${a.scores['wod'+n+'Type'] === 'S' ? 'selected' : ''}>S</option>
                        </select>
                        <input type="number" onchange="updateScoreValue('${id}', 'wod${n}', this.value)" 
                            class="form-control form-control-sm bg-dark text-light border-secondary text-center" 
                            style="font-size: 0.8rem; min-width:60px;" value="${a.scores['wod'+n] || 0}" ${!isAdmin ? 'disabled' : ''}>
                    </td>
                `).join('')}
                <td class="text-end fw-bold text-warning">${a.totalPoints}</td>
            </tr>`;

        if (a.gender === 'Male' && maleTable) maleTable.innerHTML += rowHTML;
        else if (a.gender === 'Female' && femaleTable) femaleTable.innerHTML += rowHTML;
    });
});

// --- VINCULACIÓN GLOBAL (HACE QUE LOS BOTONES FUNCIONEN) ---

window.promptLogin = () => {
    const pass = prompt("Contraseña de Admin:");
    if (pass) {
        signInWithEmailAndPassword(auth, "alber.urr@gmail.com", pass)
            .catch((error) => alert("Error: " + error.code));
    }
};

window.logout = () => signOut(auth).then(() => location.reload());

window.registerAthlete = async () => {
    const name = document.getElementById('athleteName').value;
    const gender = document.getElementById('athleteGender').value;
    if (!name) return alert("Ingresa un nombre");
    try {
        await addDoc(collection(db, "athletes"), {
            name, gender,
            scores: { wod1: 0, wod1Type: 'RX', wod2: 0, wod2Type: 'RX', wod3: 0, wod3Type: 'RX' },
            totalPoints: 0, timestamp: new Date()
        });
        document.getElementById('athleteName').value = "";
    } catch (e) { console.error(e); }
};

window.updateName = updateName;
window.updateScoreValue = updateScoreValue;
window.updateScoreType = updateScoreType;

onAuthStateChanged(auth, (user) => {
    const s = document.getElementById('admin-section'), b = document.getElementById('admin-banner');
    if (user) { 
        if (s) s.classList.remove('d-none'); 
        if (b) b.classList.remove('d-none'); 
    } else { 
        if (s) s.classList.add('d-none'); 
        if (b) b.classList.add('d-none'); 
    }
});
