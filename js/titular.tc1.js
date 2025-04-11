document.addEventListener('DOMContentLoaded', function() {
    // Inicializar funcionalidades
    initTabNavigation();
    initCollaboratorCards();
    initDeleteButtons();
    initFloatingButtons();
});

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


//funcion de cada colaborador
// Inicializar tarjeta de colaborador con redirección
function initCollaboratorCardRedirect() {
    // Seleccionar todas las tarjetas de colaborador
    const collaboratorCards = document.querySelectorAll('.collaborator-card');

    // Iterar sobre todas las tarjetas
    collaboratorCards.forEach(card => {
        // Agregar evento de clic a cada tarjeta
        card.addEventListener('click', function() {
            // Redirigir a otro HTML
            window.location.href = '../html/titular.tc2.html'; // Aquí debes poner la URL del archivo al que deseas redirigir
        });
    });
}

// Llamar a la función cuando se carga la página
window.onload = initCollaboratorCardRedirect;

// Inicializar tarjetas de colaboradores
function initCollaboratorCards() {
    const addCard = document.querySelector('.add-card');
    
    if (addCard) {
        addCard.addEventListener('click', function() {
            showAddCollaboratorModal();
        });
    }
}

// Mostrar modal para añadir colaborador
function showAddCollaboratorModal() {
    // Crear elemento de modal
    const modalEl = document.createElement('div');
    modalEl.className = 'modal-overlay';
    
    // Contenido del modal
    modalEl.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Añadir Colaborador</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="add-collaborator-form">
                    <div class="form-group">
                        <label for="collaborator-name">Nombre(s):</label>
                        <input type="text" id="collaborator-name" required>
                    </div>
                    <div class="form-group">
                        <label for="collaborator-lastname">Apellidos:</label>
                        <input type="text" id="collaborator-lastname" required>
                    </div>
                    <div class="form-group">
                        <label for="collaborator-email">Correo electrónico:</label>
                        <input type="email" id="collaborator-email" required>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="submit-btn">Añadir</button>
                        <button type="button" class="cancel-btn">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Agregar estilos al modal
    modalEl.style.position = 'fixed';
    modalEl.style.top = '0';
    modalEl.style.left = '0';
    modalEl.style.width = '100%';
    modalEl.style.height = '100%';
    modalEl.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalEl.style.display = 'flex';
    modalEl.style.justifyContent = 'center';
    modalEl.style.alignItems = 'center';
    modalEl.style.zIndex = '1000';
    
    const modalContent = modalEl.querySelector('.modal-content');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '500px';
    modalContent.style.overflow = 'hidden';
    
    const modalHeader = modalEl.querySelector('.modal-header');
    modalHeader.style.display = 'flex';
    modalHeader.style.justifyContent = 'space-between';
    modalHeader.style.alignItems = 'center';
    modalHeader.style.padding = '15px 20px';
    modalHeader.style.borderBottom = '1px solid #eee';
    
    const closeButton = modalEl.querySelector('.close-modal');
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#888';
    
    const modalBody = modalEl.querySelector('.modal-body');
    modalBody.style.padding = '20px';
    
    const formGroups = modalEl.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.style.marginBottom = '15px';
    });
    
    const labels = modalEl.querySelectorAll('label');
    labels.forEach(label => {
        label.style.display = 'block';
        label.style.marginBottom = '5px';
        label.style.fontWeight = '500';
    });
    
    const inputs = modalEl.querySelectorAll('input');
    inputs.forEach(input => {
        input.style.width = '100%';
        input.style.padding = '10px';
        input.style.border = '1px solid #ddd';
        input.style.borderRadius = '4px';
        input.style.fontSize = '14px';
    });
    
    const submitBtn = modalEl.querySelector('.submit-btn');
    submitBtn.style.backgroundColor = '#684a8e';
    submitBtn.style.color = 'white';
    submitBtn.style.border = 'none';
    submitBtn.style.padding = '10px 15px';
    submitBtn.style.borderRadius = '4px';
    submitBtn.style.cursor = 'pointer';
    submitBtn.style.marginRight = '10px';
    
    const cancelBtn = modalEl.querySelector('.cancel-btn');
    cancelBtn.style.backgroundColor = '#f5f5f5';
    cancelBtn.style.color = '#333';
    cancelBtn.style.border = '1px solid #ddd';
    cancelBtn.style.padding = '10px 15px';
    cancelBtn.style.borderRadius = '4px';
    cancelBtn.style.cursor = 'pointer';
    
    // Agregar al DOM
    document.body.appendChild(modalEl);
    
    // Event listeners
    closeButton.addEventListener('click', function() {
        modalEl.remove();
    });
    
    cancelBtn.addEventListener('click', function() {
        modalEl.remove();
    });
    
    // Evento para backdrop
    modalEl.addEventListener('click', function(e) {
        if (e.target === modalEl) {
            modalEl.remove();
        }
    });
    
    // Manejar envío del formulario
    const form = modalEl.querySelector('#add-collaborator-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('collaborator-name').value;
        const lastname = document.getElementById('collaborator-lastname').value;
        const email = document.getElementById('collaborator-email').value;
        
        // Validación básica
        if (!name || !lastname || !email) {
            showErrorMessage('Por favor completa todos los campos');
            return;
        }
        
        // Aquí iría la lógica para agregar el colaborador a la base de datos
        console.log('Añadiendo colaborador:', {name, lastname, email});
        
        // Simular éxito
        addCollaboratorCard(name, lastname);
        
        // Cerrar modal
        modalEl.remove();
        
        // Mostrar mensaje de éxito
        showSuccessMessage('Colaborador añadido correctamente');
    });
}

// Añadir tarjeta de colaborador
function addCollaboratorCard(name, lastname) {
    const container = document.querySelector('.collaborators-container');
    const addCard = document.querySelector('.add-card');
    
    // Crear nueva tarjeta
    const newCard = document.createElement('div');
    newCard.className = 'collaborator-card';
    newCard.innerHTML = `
        <div class="collaborator-avatar">
            <img src="avatar-placeholder.png" alt="Avatar" onerror="this.src='https://via.placeholder.com/100x100?text=?'">
        </div>
        <div class="collaborator-info">
            <p class="collaborator-name">${name} ${lastname}</p>
        </div>
        <button class="delete-collaborator">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // Insertar antes de la tarjeta de añadir
    container.insertBefore(newCard, addCard);
    
    // Añadir evento de eliminar
    const deleteBtn = newCard.querySelector('.delete-collaborator');
    deleteBtn.addEventListener('click', function() {
        confirmDeleteCollaborator(newCard, `${name} ${lastname}`);
    });
    
    // Añadir efecto de entrada
    newCard.style.opacity = '0';
    newCard.style.transform = 'translateY(20px)';
    newCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    // Forzar reflow para que la transición funcione
    void newCard.offsetWidth;
    
    // Mostrar tarjeta
    newCard.style.opacity = '1';
    newCard.style.transform = 'translateY(0)';
}

// Inicializar botones de eliminar
function initDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.delete-collaborator');
    
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.collaborator-card');
            const name = card.querySelector('.collaborator-name').textContent;
            confirmDeleteCollaborator(card, name);
        });
    });
}

// Confirmar eliminación de colaborador
function confirmDeleteCollaborator(card, name) {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${name} como colaborador?`)) {
        // Animación de desvanecimiento
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        // Eliminar después de la animación
        setTimeout(() => {
            card.remove();
            
            // Aquí iría la lógica para eliminar de la base de datos
            console.log('Colaborador eliminado:', name);
            
            // Mostrar mensaje de éxito
            showSuccessMessage('Colaborador eliminado correctamente');
        }, 300);
    }
}

// Inicializar botones flotantes
function initFloatingButtons() {
    // Botón de exportar
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            window.location.href = '../html/exportar.titular.html';
        });
    }
    
    // Botón de agregar gasto
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            window.location.href = '../html/titular.registrargasto.html';
        });
    }
}

// Mostrar mensaje de éxito
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

// Mostrar mensaje de error
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