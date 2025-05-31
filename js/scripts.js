document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".participante-foto").forEach(function (img) {
        img.addEventListener("click", function () {
            var modalImg = document.getElementById("imagenModalSrc");
            modalImg.src = this.src;
            modalImg.alt = this.alt;

            var nombreAtleta = this.closest("tr").querySelector("td:last-child").textContent.trim();
            console.log("Nombre del atleta:", nombreAtleta);

            var datosAtletas = {
                "Frida Lopez": [
                    { Intento: 1, peso: 0, levantamiento: "Snatch" },
                    { Intento: 2, peso: 0, levantamiento: "Snatch" },
                    { Intento: 3, peso: 0, levantamiento: "Snatch" },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Grecia Anguiano": [
                    { Intento: 1, peso: 0, levantamiento: "Snatch" },
                    { Intento: 2, peso: 0, levantamiento: "Snatch" },
                    { Intento: 3, peso: 0, levantamiento: "Snatch" },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Sonia Serrano": [
                    { Intento: 1, peso: 0, levantamiento: "Snatch" },
                    { Intento: 2, peso: 0, levantamiento: "Snatch" },
                    { Intento: 3, peso: 0, levantamiento: "Snatch" },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Mary Jose Rosales": [
                    { Intento: 1, peso: 0, levantamiento: "Snatch" },
                    { Intento: 2, peso: 0, levantamiento: "Snatch" },
                    { Intento: 3, peso: 0, levantamiento: "Snatch" },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Mariana Fragoso": [
                    { Intento: 1, peso: 0, levantamiento: "Snatch" },
                    { Intento: 2, peso: 0, levantamiento: "Snatch" },
                    { Intento: 3, peso: 0, levantamiento: "Snatch" },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Brenda Mancilla": [
                    { Intento: 1, peso: 0, levantamiento: "Snatch" },
                    { Intento: 2, peso: 0, levantamiento: "Snatch" },
                    { Intento: 3, peso: 0, levantamiento: "Snatch" },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Irene Morales": [
                    { Intento: 1, peso: 0, levantamiento: "Snatch" },
                    { Intento: 2, peso: 0, levantamiento: "Snatch" },
                    { Intento: 3, peso: 0, levantamiento: "Snatch" },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "David Arciniega": [
                    { Intento: 1, peso: 0, levantamiento: "Snatch" },
                    { Intento: 2, peso: 0, levantamiento: "Snatch" },
                    { Intento: 3, peso: 0, levantamiento: "Snatch" },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Oliver Navarro": [
                    { Intento: 1, peso: 0, levantamiento: "Snatch" },
                    { Intento: 2, peso: 0, levantamiento: "Snatch" },
                    { Intento: 3, peso: 0, levantamiento: "Snatch" },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Alejandro Chong": [
                    { Intento: 1, peso: 0, levantamiento: "Snatch" },
                    { Intento: 2, peso: 0, levantamiento: "Snatch" },
                    { Intento: 3, peso: 0, levantamiento: "Snatch" },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Juan Loaiza": [
                    { Intento: 1, peso: 0, levantamiento: "Snatch" },
                    { Intento: 2, peso: 0, levantamiento: "Snatch" },
                    { Intento: 3, peso: 0, levantamiento: "Snatch" },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Adrian Piña": [
                    { Intento: 1, peso: 0, levantamiento: "Snatch" },
                    { Intento: 2, peso: 0, levantamiento: "Snatch" },
                    { Intento: 3, peso: 0, levantamiento: "Snatch" },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Javier Valle": [
                    { Intento: 1, peso: 0, levantamiento: "Snatch" },
                    { Intento: 2, peso: 0, levantamiento: "Snatch" },
                    { Intento: 3, peso: 0, levantamiento: "Snatch" },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Luis Muñoz": [
                    { Intento: 1, peso: 0, levantamiento: "Snatch" },
                    { Intento: 2, peso: 0, levantamiento: "Snatch" },
                    { Intento: 3, peso: 0, levantamiento: "Snatch" },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Hector Mota": [
                    { Intento: 1, peso: 0, levantamiento: "Snatch" },
                    { Intento: 2, peso: 0, levantamiento: "Snatch" },
                    { Intento: 3, peso: 0, levantamiento: "Snatch" },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ]
            };

            var datos = datosAtletas[nombreAtleta] || [];

            // Encontrar los pesos máximos de Snatch y Clean & Jerk
            var maxSnatch = Math.max(...datos.filter(fila => fila.levantamiento === "Snatch").map(fila => fila.peso));
            var maxCleanJerk = Math.max(...datos.filter(fila => fila.levantamiento === "Clean & Jerk").map(fila => fila.peso));

            var tablaBody = document.getElementById("tablaModalBody");
            tablaBody.innerHTML = "";

            datos.forEach(function (fila) {
                var row = document.createElement("tr");

                // Aplicar clase de resaltado si el peso es el mayor dentro de su levantamiento
                var claseResaltado = fila.peso === maxSnatch || fila.peso === maxCleanJerk ? "peso-maximo" : "";

                row.innerHTML = `<td>${fila.Intento}</td><td class="${claseResaltado}">${fila.peso} kg</td><td>${fila.levantamiento}</td>`;
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
