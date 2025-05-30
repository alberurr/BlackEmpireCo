// 💡 1️⃣ Definir la función `mostrarDatos()` en el ámbito global antes del `fetch()`
function mostrarDatos(datos) {
    console.log("Ejecutando mostrarDatos con:", datos); // Debugging

    const tabla = document.getElementById("tablaParticipantes");
    if (!tabla) {
        console.error("Elemento tablaParticipantes no encontrado.");
        return;
    }

    tabla.innerHTML = ""; // Limpia la tabla antes de llenarla
    datos.forEach(participante => {
        const fila = `<tr>
            <td>${participante.posicion}</td>
            <td><img src="${participante.foto}" class="img-fluid participante-foto" alt="${participante.nombre}"></td>
            <td>${participante.nombre}</td>
            <td>${participante.score}</td>
        </tr>`;
        tabla.innerHTML += fila;
    });

    console.log("Tabla actualizada con nuevos datos."); // Debugging
}

// 💡 2️⃣ Esperar a que el DOM esté listo antes de ejecutar `fetch()`
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM completamente cargado."); // Debugging

    fetch('https://api.jsonbin.io/v3/b/68393c7c8960c979a5a2f60b/latest', {
        headers: {
            "X-Master-Key": "$2a$10$rM7VYo7Ynv14.Jkmm/xauehEVK22cqVMfUgJ/6hwRkLcnDUZUg.ly"
        }
    })
    .then(response => {
        console.log("Respuesta recibida:", response);
        return response.json();
    })
    .then(datos => {
        console.log("Datos recibidos desde JSONBin:", datos); // Debugging

        if (!datos.record) {
            console.error("El JSON no tiene la estructura esperada.");
            return;
        }

        mostrarDatos(datos.record); // ✅ Llamamos a mostrarDatos correctamente
    })
    .catch(error => console.error("Error al cargar los datos:", error));
});

// 💡 3️⃣ Verificar si el usuario es admin y mostrar el botón
const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get("admin") === "true";

const ordenarBtn = document.getElementById("ordenarBtn");
if (!isAdmin) {
    ordenarBtn.style.display = "none";
}

// 💡 4️⃣ Ordenar la tabla cuando se presione el botón
ordenarBtn.addEventListener("click", function() {
    let tabla = document.getElementById("tablaParticipantes");
    let filas = Array.from(tabla.querySelectorAll("tr"));

    filas.sort((a, b) => {
        let scoreA = parseInt(a.cells[3].innerText.trim()) || 0;
        let scoreB = parseInt(b.cells[3].innerText.trim()) || 0;
        return scoreB - scoreA; // Orden descendente por Score
    });

    tabla.innerHTML = ""; // Limpiar tabla
    filas.forEach(fila => tabla.appendChild(fila));

    // 💡 5️⃣ Guardar el orden en `localStorage` para que persista
    localStorage.setItem("tablaParticipantes", JSON.stringify(filas.map(fila => fila.outerHTML)));
});

// 💡 6️⃣ Recuperar el orden guardado cuando se recargue la página
document.addEventListener("DOMContentLoaded", () => {
    let tabla = document.getElementById("tablaParticipantes");
    let datosGuardados = localStorage.getItem("tablaParticipantes");

    if (datosGuardados) {
        tabla.innerHTML = JSON.parse(datosGuardados).join("");
    }
});
