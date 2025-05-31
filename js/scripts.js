document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".participante-foto").forEach(function (img) {
        img.addEventListener("click", function () {
            var modalImg = document.getElementById("imagenModalSrc");
            modalImg.src = this.src;
            modalImg.alt = this.alt;

            // Datos de rondas y peso por atleta
            var datosAtletas = {
                "Juan Pérez": [
                    { Intento: 1, peso: 100 },
                    { Intento: 2, peso: 105 },
                    { Intento: 3, peso: 110 }
                ],
                "Alejandro Pérez": [
                    { Intento: 1, peso: 90 },
                    { Intento: 2, peso: 95 },
                    { Intento: 3, peso: 100 }
                ],
                "Victor Pérez": [
                    { Intento: 1, peso: 110 },
                    { Intento: 2, peso: 115 },
                    { Intento: 3, peso: 120 }
                ]
            };

            // Obtener el nombre del atleta desde la fila de la tabla
            var nombreAtleta = this.closest("tr").querySelector("td:last-child").textContent.trim();

            // Limpiar contenido previo de la tabla
            var tablaBody = document.getElementById("tablaModalBody");
            tablaBody.innerHTML = "";

            // Obtener los datos correspondientes al atleta
            var datos = datosAtletas[nombreAtleta] || [];

            // Llenar la tabla con los datos
            datos.forEach(function (fila) {
                var row = document.createElement("tr");
                row.innerHTML = `<td>${fila.ronda}</td><td>${fila.peso}</td>`;
                tablaBody.appendChild(row);
            });
        });
    });
});
// Cerrar Modal
function cerrarModal() {
    var modal = bootstrap.Modal.getInstance(document.getElementById("imagenModal"));
    modal.hide();
}
