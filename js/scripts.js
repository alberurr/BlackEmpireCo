/*document.getElementById("ordenarBtn").addEventListener("click", function() {
    let tabla = document.querySelector(".table tbody");
    let filas = Array.from(tabla.rows);

    // Ordenar las filas alfabéticamente por el nombre del atleta
    filas.sort((a, b) => {
        let nombreA = a.cells[2].textContent.toLowerCase(); // Columna de nombres
        let nombreB = b.cells[2].textContent.toLowerCase();
        return nombreA.localeCompare(nombreB);
    });

    // Reordenar la tabla con las filas ordenadas
    filas.forEach(fila => tabla.appendChild(fila));
});
*/
// Obtener parámetros de la URL
const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get("admin") === "true";

// Obtener el botón
const ordenarBtn = document.getElementById("ordenarBtn");

// Mostrar u ocultar el botón según el parámetro
if (!isAdmin) {
    ordenarBtn.style.display = "none";
}
/* Para que se ordenen de mayor a menor */
document.getElementById("ordenarBtn").addEventListener("click", function() {
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("admin") === "true") {
        let tabla = document.getElementById("tablaParticipantes");
        let filas = Array.from(tabla.querySelectorAll("tbody tr")); // Obtener solo las filas del cuerpo de la tabla

        // Ordenar por la columna de Score (posición 3 en el índice)
        filas.sort((a, b) => {
            let scoreA = parseInt(a.cells[3].innerText.trim()) || 0;
            let scoreB = parseInt(b.cells[3].innerText.trim()) || 0;
            return scoreB - scoreA; // Orden descendente por Score
        });

        // Vaciar el contenido del tbody antes de agregar filas ordenadas
        tabla.innerHTML = "";

        // Agregar las filas ordenadas de nuevo al tbody
        filas.forEach(fila => tabla.appendChild(fila));
    }
});
function mostrarDatos(datos) {
    const tabla = document.getElementById("tablaParticipantes");
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
}

/*JSON */
fetch('https://api.jsonbin.io/v3/b/68393c7c8960c979a5a2f60b', {
    headers: {
        "X-Master-Key": "$2a$10$rM7VYo7Ynv14.Jkmm/xauehEVK22cqVMfUgJ/6hwRkLcnDUZUg.ly" // Opcional si tienes una API privada
    }
})
.then(response => response.json())
.then(datos => {
    mostrarDatos(datos.record); // JSONBin guarda los datos dentro de `record`
})
.catch(error => console.error("Error al cargar los datos:", error));









/* Para que se guarde la lista en orden

document.addEventListener("DOMContentLoaded", function() {
    let tabla = document.querySelector(".table tbody");
    let datosGuardados = localStorage.getItem("tablaParticipantes");

    if (datosGuardados) {
        tabla.innerHTML = JSON.parse(datosGuardados).join("");
    }
});

document.getElementById("ordenarBtn").addEventListener("click", function() {
    let tabla = document.querySelector(".table tbody");
    let filas = Array.from(tabla.rows);

    filas.sort((a, b) => {
        let nombreA = a.cells[2].textContent.toLowerCase();
        let nombreB = b.cells[2].textContent.toLowerCase();
        return nombreA.localeCompare(nombreB);
    });

    let datosOrdenados = filas.map(fila => fila.outerHTML);
    localStorage.setItem("tablaParticipantes", JSON.stringify(datosOrdenados));

    filas.forEach(fila => tabla.appendChild(fila));
});
*/

