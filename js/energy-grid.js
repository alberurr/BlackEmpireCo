import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// TU CONFIGURACIÓN DE FIREBASE (Asegúrate de que sea la tuya)
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

// --- LÓGICA DE REGISTRO ---
window.registerAthlete = async () => {
    const name = document.getElementById('athleteName').value;
    const gender = document.getElementById('athleteGender').value;
    const level = document.getElementById('athleteLevel').value;

    if (!name) return alert("Escribe un nombre");

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
    } catch (e) {
        console.error("Error al guardar: ", e);
    }
};

// --- RENDERIZAR TABLAS ---
onSnapshot(query(collection(db, "athletes"), orderBy("totalPoints", "asc")), (snapshot) => {
    const maleTable = document.getElementById('leaderboard-male');
    const femaleTable = document.getElementById('leaderboard-female');
    
    maleTable.innerHTML = "";
    femaleTable.innerHTML = "";

    let malePos = 1;
    let femalePos = 1;

    snapshot.forEach((docSnap) => {
        const athlete = docSnap.data();
        const id = docSnap.id;
        const isAdmin = auth.currentUser !== null;

        // Crear el Badge de nivel
        const badge = athlete.level === "RX" 
            ? `<span class="badge bg-danger ms-2">RX</span>` 
            : `<span class="badge bg-info text-dark ms-2">S</span>`;

        const row = `
            <tr>
                <td>${athlete.gender === 'Male' ? malePos++ : femalePos++}</td>
                <td>
                    <span class="fw-bold">${athlete.name}</span>${badge}
                </td>
                ${[1, 2, 3].map(num => `
                    <td>
                        <input type="number" class="form-control form-control-sm bg-dark text-light border-secondary" 
                            value="${athlete.scores[`wod${num}`]}" 
                            ${!isAdmin ? 'disabled' : ''}
                            onchange="updateScore('${id}', 'wod${num}', this.value)">
                    </td>
                `).join('')}
                <td class="fw-bold text-warning">${athlete.totalPoints}</td>
            </tr>
        `;

        if (athlete.gender === 'Male') {
            maleTable.innerHTML += row;
        } else {
            femaleTable.innerHTML += row;
        }
    });
});

// --- ACTUALIZAR PUNTAJES ---
window.updateScore = async (id, wod, value) => {
    const val = parseInt(value) || 0;
    const athleteRef = doc(db, "athletes", id);
    
    // Obtenemos los datos actuales para recalcular el total
    onSnapshot(athleteRef, async (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        const newScores = { ...data.scores, [wod]: val };
        const newTotal = Object.values(newScores).reduce((a, b) => a + b, 0);

        await updateDoc(athleteRef, {
            scores: newScores,
            totalPoints: newTotal
        });
    }, { onlyOnce: true });
};

// --- LOGIN / ADMIN ---
window.promptLogin = () => {
    const pass = prompt("Clave de Administrador:");
    if (pass) {
        signInWithEmailAndPassword(auth, "admin@open.com", pass) // Cambia por tu correo real
            .catch(err => alert("Clave incorrecta"));
    }
};

window.logout = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    const adminSection = document.getElementById('admin-section');
    const adminBanner = document.getElementById('admin-banner');
    if (user) {
        adminSection.classList.remove('d-none');
        adminBanner.classList.remove('d-none');
    } else {
        adminSection.classList.add('d-none');
        adminBanner.classList.add('d-none');
    }
});
