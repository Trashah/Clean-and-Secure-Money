document.addEventListener('DOMContentLoaded', function() {
    // Seleccionar todos los botones con la clase "btn-primary" que contengan el texto "Acceder"
    const accessButtons = Array.from(document.querySelectorAll('.btn-primary')).filter(
        button => button.textContent.trim() === 'Acceder'
    );
    
    // Añadir el event listener a cada botón encontrado
    accessButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Redireccionar a la página de login
            window.location.href = '../html/login.html';
        });
    });
});