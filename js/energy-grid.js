import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

window.registerAthlete = async () => {
    const name = document.getElementById('athleteName').value;
    const gender = document.getElementById('athleteGender').value;
    const level = document.getElementById('athleteLevel').value;
    if (!name) return;
    try {
        await addDoc(collection(db, "athletes"), {
            name, gender, level,
            scores: { wod1: 0, wod2: 0, wod3: 0 },
            totalPoints: 0,
            timestamp: new Date()
        });
        document.getElementById('athleteName').value = "";
    } catch (e) { console.error(e); }
};

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
        const levelClass = a.level === 'RX' ? 'text-rx' : 'text-s';

        // 1. Lógica Scores Generales (Solo Nombre, Nivel y Total)
        overallDiv.innerHTML += `
            <div class="overall-item d-flex justify-content-between align-items-center">
                <div>
                    <span class="text-muted me-2">${oPos++}.</span>
                    <span class="fw-bold text-uppercase">${a.name}</span>
                    <span class="${levelClass} ms-2">[${a.level}]</span>
                </div>
                <div class="fw-bold text-warning">${a.totalPoints} <small>PTS</small></div>
            </div>
        `;

        // 2. Lógica Tablas Género (Con edición de WODs simplificada)
        const row = `
            <tr>
                <td class="text-muted">${a.gender === 'Male' ? mPos++ : fPos++}</td>
                <td>
                    <div class="fw-bold">${a.name}</div>
                    <div class="${levelClass}">${a.level}</div>
                </td>
                <td>
                    <div class="d-flex gap-1 justify-content-center">
                        ${[1,2,3].map(n => `
                            <input type="number" class="form-control form-control-sm bg-dark text-light border-secondary p-1 text-center" 
                            style="width: 50px; font-size: 0.75rem;" value="${a.scores['wod'+n]}" 
                            ${!isAdmin ? 'disabled' : ''} onchange="updateScore('${id}', 'wod${n}', this.value)">
                        `).join('')}
                    </div>
                </td>
                <td class="text-end fw-bold text-warning">${a.totalPoints}</td>
            </tr>
        `;

        if (a.gender === 'Male') maleTable.innerHTML += row;
        else femaleTable.innerHTML += row;
    });
});

window.updateScore = async (id, wod, value) => {
    const val = parseInt(value) || 0;
    const athleteRef = doc(db, "athletes", id);
    onSnapshot(athleteRef, async (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        const newScores = { ...data.scores, [wod]: val };
        const newTotal = Object.values(newScores).reduce((a, b) => a + b, 0);
        await updateDoc(athleteRef, { scores: newScores, totalPoints: newTotal });
    }, { onlyOnce: true });
};

window.promptLogin = () => {
    const pass = prompt("Clave de Administrador:");
    if (pass) signInWithEmailAndPassword(auth, "alber.urr@gmail.com", pass).catch(() => alert("Error"));
};

window.logout = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    const s = document.getElementById('admin-section'), b = document.getElementById('admin-banner');
    if (user) { s.classList.remove('d-none'); b.classList.remove('d-none'); }
    else { s.classList.add('d-none'); b.classList.add('d-none'); }
});
