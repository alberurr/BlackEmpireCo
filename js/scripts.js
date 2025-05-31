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
                    { Intento: 1, peso: 85, levantamiento: "Snatch", resultado: true },
                    { Intento: 2, peso: 95, levantamiento: "Snatch", resultado: false },
                    { Intento: 3, peso: 95, levantamiento: "Snatch", resultado: true },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Grecia Anguiano": [
                    { Intento: 1, peso: 125, levantamiento: "Snatch", resultado: true },
                    { Intento: 2, peso: 130, levantamiento: "Snatch", resultado: false },
                    { Intento: 3, peso: 130, levantamiento: "Snatch", resultado: false },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Sonia Serrano": [
                    { Intento: 1, peso: 100, levantamiento: "Snatch", resultado: true },
                    { Intento: 2, peso: 105, levantamiento: "Snatch", resultado: true },
                    { Intento: 3, peso: 112.5, levantamiento: "Snatch", resultado: false },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Mary Jose Rosales": [
                    { Intento: 1, peso: 100, levantamiento: "Snatch", resultado: true },
                    { Intento: 2, peso: 105, levantamiento: "Snatch", resultado: true },
                    { Intento: 3, peso: 115, levantamiento: "Snatch", resultado: true },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Mariana Fragoso": [
                    { Intento: 1, peso: 127.5, levantamiento: "Snatch", resultado: true },
                    { Intento: 2, peso: 137.5, levantamiento: "Snatch", resultado: false },
                    { Intento: 3, peso: 137.5, levantamiento: "Snatch", resultado: true},
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Brenda Mancilla": [
                    { Intento: 1, peso: 110, levantamiento: "Snatch", resultado: false },
                    { Intento: 2, peso: 110, levantamiento: "Snatch", resultado: true },
                    { Intento: 3, peso: 115, levantamiento: "Snatch" , resultado: false},
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Irene Morales": [
                    { Intento: 1, peso: 110, levantamiento: "Snatch", resultado: true},
                    { Intento: 2, peso: 120, levantamiento: "Snatch", resultado: true},
                    { Intento: 3, peso: 130, levantamiento: "Snatch", resultado: false },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "David Arciniega": [
                    { Intento: 1, peso: 215, levantamiento: "Snatch", resultado: true },
                    { Intento: 2, peso: 225, levantamiento: "Snatch", resultado: true },
                    { Intento: 3, peso: 245, levantamiento: "Snatch", resultado: true },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Oliver Navarro": [
                    { Intento: 1, peso: 155, levantamiento: "Snatch", resultado: true },
                    { Intento: 2, peso: 165, levantamiento: "Snatch", resultado: false },
                    { Intento: 3, peso: 165, levantamiento: "Snatch", resultado: false },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Alejandro Chong": [
                    { Intento: 1, peso: 210, levantamiento: "Snatch", resultado: false },
                    { Intento: 2, peso: 210, levantamiento: "Snatch", resultado: true },
                    { Intento: 3, peso: 220, levantamiento: "Snatch", resultado: false },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Juan Loaiza": [
                    { Intento: 1, peso: 185, levantamiento: "Snatch", resultado: true },
                    { Intento: 2, peso: 205, levantamiento: "Snatch", resultado: true },
                    { Intento: 3, peso: 217.5, levantamiento: "Snatch", resultado: false },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Adrian Piña": [
                    { Intento: 1, peso: 175, levantamiento: "Snatch", resultado: true },
                    { Intento: 2, peso: 190, levantamiento: "Snatch", resultado: true },
                    { Intento: 3, peso: 205, levantamiento: "Snatch", resultado: false },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Javier Valle": [
                    { Intento: 1, peso: 185, levantamiento: "Snatch", resultado: true },
                    { Intento: 2, peso: 205, levantamiento: "Snatch", resultado: false },
                    { Intento: 3, peso: 212.5, levantamiento: "Snatch", resultado: false },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Luis Muñoz": [
                    { Intento: 1, peso: 185, levantamiento: "Snatch", resultado: true },
                    { Intento: 2, peso: 205, levantamiento: "Snatch", resultado: false},
                    { Intento: 3, peso: 210, levantamiento: "Snatch", resultado: false },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Hector Mota": [
                    { Intento: 1, peso: 185, levantamiento: "Snatch", resultado: true },
                    { Intento: 2, peso: 195, levantamiento: "Snatch", resultado: true },
                    { Intento: 3, peso: 202.5, levantamiento: "Snatch", resultado: false },
                    { Intento: 1, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 2, peso: 0, levantamiento: "Clean & Jerk" },
                    { Intento: 3, peso: 0, levantamiento: "Clean & Jerk" }
                ],
                "Angelo Lucatero": [
                    { Intento: 1, peso: 135, levantamiento: "Snatch", resultado: true },
                    { Intento: 2, peso: 155, levantamiento: "Snatch", resultado: true },
                    { Intento: 3, peso: 155, levantamiento: "Snatch", resultado: false },
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

                var claseResaltado = fila.peso === maxSnatch || fila.peso === maxCleanJerk ? "peso-maximo" : "";
                var estadoLevantamiento = fila.resultado ? "✅" : "❌";

                row.innerHTML = `<td>${fila.Intento}</td>
                                 <td class="${claseResaltado}">${fila.peso} kg</td>
                                 <td>${fila.levantamiento}</td>
                                 <td>${estadoLevantamiento}</td>`;

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
