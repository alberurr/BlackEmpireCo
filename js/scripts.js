document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".participante-foto").forEach(function (img) {
        img.addEventListener("click", function () {
            var modalImg = document.getElementById("imagenModalSrc");
            
            // Verifica que la imagen existe antes de asignarla
            if (modalImg && this.src) {
                modalImg.src = this.src;
                modalImg.alt = this.alt; // También actualiza el texto alternativo
            } else {
                console.error("No se pudo actualizar la imagen en el modal.");
            }
        });
    });
});
