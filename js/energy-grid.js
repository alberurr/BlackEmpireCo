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

// REGISTRO DE ATLETAS
window.registerAthlete = async () => {
    const name = document.getElementById('athleteName').value;
    const gender = document.getElementById('athleteGender').value;
    const level = document.getElementById('athleteLevel').value;

    if (!name) return alert("Por favor ingresa un nombre");

    try {
        await addDoc(collection(db, "athletes"), {
            name: name,
            gender: gender,
            level: level,
            scores: { wod1: 0, wod2: 0, wod3: 0 },
            totalPoints: 0,
            timestamp: new Date()
        });
        document.getElementById('athleteName').value = "";
    } catch (e) { alert("Error al registrar. Verifica tu conexión."); }
};

// ESCUCHA DE DATOS EN TIEMPO REAL
onSnapshot(query(collection(db, "athletes"), orderBy("totalPoints", "asc")), (snapshot) => {
    const maleTable = document.getElementById('leaderboard-male');
    const femaleTable = document.getElementById('leaderboard-female');
    const overallTable = document.getElementById('overall-leaderboard');
    
    maleTable.innerHTML = "";
    femaleTable.innerHTML = "";
    overallTable.innerHTML = "";

    let malePos = 1, femalePos = 1, overallPos = 1;
    const isAdmin = auth.currentUser !== null;

    snapshot.forEach((docSnap) => {
        const athlete = docSnap.data();
        const id = docSnap.id;

        const badge = `<span class="badge ${athlete.level === 'RX' ? 'badge-rx' : 'badge-s'} ms-2">${athlete.level}</span>`;

        const rowHTML = `
            <tr>
                <td>${athlete.gender === 'Male' ? malePos++ : femalePos++}</td>
                <td><span class="fw-bold">${athlete.name}</span>${badge}</td>
                ${[1, 2, 3].map(n => `
                    <td><input type="number" class="form-control form-control-sm bg-dark text-light border-secondary shadow-none" 
                        value="${athlete.scores['wod'+n]}" ${!isAdmin ? 'disabled' : ''} 
                        onchange="updateScore('${id}', 'wod${n}', this.value)"></td>
                `).join('')}
                <td class="fw-bold text-warning">${athlete.totalPoints}</td>
            </tr>
        `;

        // Renderizar en tablas por género
        if (athlete.gender === 'Male') maleTable.innerHTML += rowHTML;
        else femaleTable.innerHTML += rowHTML;

        // Renderizar en Top General (solo los mejores 5 o todos)
        if (overallPos <= 10) {
            overallTable.innerHTML += `
                <tr>
                    <td class="text-warning fw-bold">${overallPos++}</td>
                    <td>${athlete.name} ${badge}</td>
                    <td class="small text-muted">${athlete.gender === 'Male' ? 'M' : 'F'}</td>
                    <td class="text-end fw-bold">${athlete.totalPoints} pts</td>
                </tr>
            `;
        }
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
    if (pass) signInWithEmailAndPassword(auth, "alber.urr@gmail  .com", pass).catch(() => alert("Clave Incorrecta"));
};

window.logout = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    const section = document.getElementById('admin-section');
    const banner = document.getElementById('admin-banner');
    if (user) { section.classList.remove('d-none'); banner.classList.remove('d-none'); }
    else { section.classList.add('d-none'); banner.classList.add('d-none'); }
});
