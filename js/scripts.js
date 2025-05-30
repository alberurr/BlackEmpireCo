document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".modal").forEach(function (modal) {
        modal.addEventListener("touchend", function (event) {
            if (event.target === modal) {
                var modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.hide();
            }
        });
    });
});
