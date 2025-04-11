document.addEventListener('DOMContentLoaded', function() {
    // Inicializar funcionalidades
    initBackButton();
    initTabNavigation();
    initExpensesActions();
    initFloatingButtons();
    
    // Cargar datos del colaborador (simulado)
    loadCollaboratorData();
});

// Inicializar botón de regreso
function initBackButton() {
    const backButton = document.querySelector('.back-button');
    
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = '../html/titular.tc1.html';
        });
    }
}

// Inicializar navegación de pestañas
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


// Inicializar acciones de gastos (editar/eliminar)
function initExpensesActions() {
    // Botones de editar
    const editButtons = document.querySelectorAll('.action-btn.edit');
    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('.table-row');
            const concept = row.querySelector('.column.concepto').textContent;
            const date = row.querySelector('.column.fecha').textContent;
            const method = row.querySelector('.column.metodo').textContent;
            const amount = row.querySelector('.column.monto').textContent;
            
            showEditExpenseModal(row, concept, date, method, amount);
        });
    });
    
    // Botones de eliminar
    const deleteButtons = document.querySelectorAll('.action-btn.delete');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('.table-row');
            const concept = row.querySelector('.column.concepto').textContent;
            
            confirmDeleteExpense(row, concept);
        });
    });
}

// Mostrar modal para editar gasto
function showEditExpenseModal(row, concept, date, method, amount) {
    // Crear elemento de modal
    const modalEl = document.createElement('div');
    modalEl.className = 'modal-overlay';
    
    // Contenido del modal
    modalEl.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Editar Gasto</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="edit-expense-form">
                    <div class="form-group">
                        <label for="expense-concept">Concepto:</label>
                        <input type="text" id="expense-concept" value="${concept}" required>
                    </div>
                    <div class="form-group">
                        <label for="expense-date">Fecha:</label>
                        <input type="text" id="expense-date" value="${date}" required>
                    </div>
                    <div class="form-group">
                        <label for="expense-method">Método:</label>
                        <select id="expense-method" required>
                            <option value="Efectivo" ${method.includes('Efectivo') ? 'selected' : ''}>Efectivo</option>
                            <option value="Tarjeta" ${method.includes('Tarjeta') ? 'selected' : ''}>Tarjeta</option>
                            <option value="Transferencia">Transferencia</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="expense-amount">Monto:</label>
                        <input type="text" id="expense-amount" value="${amount}" required>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="submit-btn">Guardar</button>
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
    
    const inputs = modalEl.querySelectorAll('input, select');
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
    const form = modalEl.querySelector('#edit-expense-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newConcept = document.getElementById('expense-concept').value;
        const newDate = document.getElementById('expense-date').value;
        const newMethod = document.getElementById('expense-method').value;
        const newAmount = document.getElementById('expense-amount').value;
        
        // Actualizar datos en la fila
        row.querySelector('.column.concepto').textContent = newConcept;
        row.querySelector('.column.fecha').textContent = newDate;
        row.querySelector('.column.metodo').textContent = newMethod;
        row.querySelector('.column.monto').textContent = newAmount;
        
        // Cerrar modal
        modalEl.remove();
        
        // Mostrar mensaje de éxito
        showSuccessMessage('Gasto actualizado correctamente');
    });
}

// Confirmar eliminación de gasto
function confirmDeleteExpense(row, concept) {
    if (confirm(`¿Estás seguro de que quieres eliminar el gasto "${concept}"?`)) {
        // Animación de desvanecimiento
        row.style.opacity = '0';
        row.style.transform = 'translateY(-10px)';
        row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        // Eliminar después de la animación
        setTimeout(() => {
            row.remove();
            
            // Mostrar mensaje de éxito
            showSuccessMessage('Gasto eliminado correctamente');
        }, 300);
    }
}

// Inicializar botones flotantes
function initFloatingButtons() {
    // Botón exportar
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            window.location.href = 'exportar.titular.html';
        });
    }
    
    // Botón registrar gasto
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            window.location.href = 'titular.registrargasto.html';
        });
    }
}

// Cargar datos del colaborador (simulado)
function loadCollaboratorData() {
    // Esta función simula la carga de datos del colaborador
    // En una implementación real, estos datos vendrían de una API o base de datos
    
    // Obtener datos del colaborador desde URL o localStorage
    const collaboratorId = getCollaboratorIdFromUrl();
    const collaboratorData = getCollaboratorData(collaboratorId);
    
    if (collaboratorData) {
        // Actualizar nombre e imagen
        document.querySelector('.collaborator-name').textContent = collaboratorData.name;
        // También se podría actualizar la imagen si estuviera disponible
    }
}

// Obtener ID del colaborador desde la URL
function getCollaboratorIdFromUrl() {
    // Obtener ID del colaborador desde la URL (ejemplo: ?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || '1'; // Valor por defecto: 1
}

// Obtener datos del colaborador
function getCollaboratorData(id) {
    // Simulación de datos de colaboradores
    const collaborators = {
        '1': {
            name: 'Nombre(s) Apellidos',
            email: 'colaborador1@email.com',
            expenses: [
                { concept: 'Comida', date: '15/06/2023', method: 'Efectivo', amount: '$ 250' },
                { concept: 'Transporte', date: '16/06/2023', method: 'Tarjeta', amount: '$ 180' }
            ]
        },
        '2': {
            name: 'Otro Colaborador',
            email: 'colaborador2@email.com',
            expenses: [
                { concept: 'Ropa', date: '14/06/2023', method: 'Tarjeta', amount: '$ 500' },
                { concept: 'Libros', date: '17/06/2023', method: 'Efectivo', amount: '$ 320' }
            ]
        }
    };
    
    return collaborators[id] || null;
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