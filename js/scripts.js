document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".participante-foto").forEach(function (img) {
        img.addEventListener("click", function () {
            var modalImg = document.getElementById("imagenModalSrc");
            modalImg.src = this.src; // Asigna la imagen clicada al modal
        });
    });
});
