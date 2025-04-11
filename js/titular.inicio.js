document.addEventListener('DOMContentLoaded', function() {
    // Inicializar funcionalidades
    initEditableFields();
    initDeleteButtons();
    initFloatingButtons();
    initTabNavigation();
});

// Inicializar campos editables
function initEditableFields() {
    const editButtons = document.querySelectorAll('.action-btn.edit');
    const inputs = document.querySelectorAll('.concepto input');
    
    editButtons.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const input = inputs[index];
            input.readOnly = !input.readOnly;
            if (!input.readOnly) {
                input.focus();
                input.select();
            } else {
                // Aquí iría la lógica para guardar el cambio en la base de datos
                console.log('Concepto editado:', input.value);
            }
        });
    });
    
    // Permitir guardar al presionar Enter
    inputs.forEach(input => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                this.readOnly = true;
                this.blur();
                // Aquí iría la lógica para guardar
                console.log('Concepto guardado con Enter:', this.value);
            }
        });
    });
}

// Inicializar botones de eliminar
function initDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.action-btn.delete');
    
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('.table-row');
            
            // Confirmar eliminación
            if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
                // Animación de desvanecimiento
                row.style.opacity = '0';
                row.style.transition = 'opacity 0.3s ease';
                
                // Eliminar después de la animación
                setTimeout(() => {
                    row.remove();
                    // Aquí iría la lógica para eliminar de la base de datos
                    console.log('Gasto eliminado');
                }, 300);
            }
        });
    });
}

// Inicializar botones flotantes
function initFloatingButtons() {
    const exportBtn = document.querySelector('.export-btn');
    const addBtn = document.querySelector('.add-btn');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            window.location.href = '../html/exportar.titular.html';
        });
    }
    
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            window.location.href = '../html/titular.registrargasto.html';
        });
    }
}

// Inicializar navegación de pestañas

  // Esperar a que se cargue el contenido del header
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



// Función para mostrar mensaje de éxito
function showSuccessMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'success-message';
    messageEl.textContent = message;
    
    // Estilos para el mensaje
    messageEl.style.position = 'fixed';
    messageEl.style.bottom = '20px';
    messageEl.style.left = '50%';
    messageEl.style.transform = 'translateX(-50%)';
    messageEl.style.backgroundColor = '#4CAF50';
    messageEl.style.color = 'white';
    messageEl.style.padding = '10px 20px';
    messageEl.style.borderRadius = '4px';
    messageEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    messageEl.style.zIndex = '1000';
    
    // Añadir al DOM
    document.body.appendChild(messageEl);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        messageEl.style.opacity = '0';
        messageEl.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            messageEl.remove();
        }, 500);
    }, 3000);
}

// Función para mostrar mensaje de error
function showErrorMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'error-message';
    messageEl.textContent = message;
    
    // Estilos para el mensaje
    messageEl.style.position = 'fixed';
    messageEl.style.bottom = '20px';
    messageEl.style.left = '50%';
    messageEl.style.transform = 'translateX(-50%)';
    messageEl.style.backgroundColor = '#F44336';
    messageEl.style.color = 'white';
    messageEl.style.padding = '10px 20px';
    messageEl.style.borderRadius = '4px';
    messageEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    messageEl.style.zIndex = '1000';
    
    // Añadir al DOM
    document.body.appendChild(messageEl);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        messageEl.style.opacity = '0';
        messageEl.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            messageEl.remove();
        }, 500);
    }, 3000);
} 