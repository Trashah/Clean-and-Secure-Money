// Script para simular la edición de conceptos de gastos
document.addEventListener('DOMContentLoaded', function() {
    initFloatingButtons();
    const editButtons = document.querySelectorAll('.action-btn.edit');
    const inputs = document.querySelectorAll('.concepto input');
    
    editButtons.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const input = inputs[index];
            input.readOnly = !input.readOnly;
            if (!input.readOnly) {
                input.focus();
            }
        });
    });
});

setTimeout(() => {
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll('.app-nav a');

    navLinks.forEach(link => {
      const linkPage = link.getAttribute('href');
      if (linkPage === currentPage) {
        link.classList.add('active');
      }
    });
  }, 100); // Puedes ajustar este tiempo si ves que a veces no alcanza a cargar


function initFloatingButtons() {
    const exportBtn = document.querySelector('.export-btn');
    const addBtn = document.querySelector('.add-btn');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            window.location.href = '../html/exportar.individual.html';
        });
    }
    
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            window.location.href = '../html/individual.registrargasto.html';
        });
    }
}