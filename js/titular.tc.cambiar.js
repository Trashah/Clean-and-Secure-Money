document.addEventListener('DOMContentLoaded', function() {
    // Inicializar funcionalidades
    initBackButton();
    initTabNavigation();
    initApplyButton();
    initFloatingButtons();
    
    // Cargar datos iniciales (simulado)
    loadExpenseDetails();
});

// Inicializar botón de regreso
function initBackButton() {
    const backButton = document.querySelector('.back-button');
    
    if (backButton) {
        backButton.addEventListener('click', function() {
            // Obtener el ID del colaborador de la URL
            const urlParams = new URLSearchParams(window.location.search);
            const collaboratorId = urlParams.get('collaboratorId') || '1';
            const expenseId = urlParams.get('expenseId') || '1';
            
            // Volver a la página de detalle del colaborador
            window.location.href = `titular.tc2.html?id=${collaboratorId}`;
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


// Inicializar botón de aplicar cambios
function initApplyButton() {
    const applyButton = document.querySelector('.apply-button');
    
    if (applyButton) {
        applyButton.addEventListener('click', function() {
            // Recopilar nuevos valores
            const newConcept = document.querySelector('input.new-value[placeholder="Concepto nuevo"]').value;
            const newDate = document.querySelector('input.new-value[placeholder="Fecha nueva"]').value;
            const newMethod = document.querySelector('input.new-value[placeholder="Método de pago nuevo"]').value;
            const newAmount = document.querySelector('input.new-value[placeholder="Monto de pago nuevo"]').value;
            
            // Validar que se haya ingresado al menos un nuevo valor
            if (!newConcept && !newDate && !newMethod && !newAmount) {
                showMessage('Por favor, ingresa al menos un nuevo valor para realizar cambios.', 'error');
                return;
            }
            
            // En un caso real, aquí enviaríamos los datos al servidor
            // Simulación de actualización exitosa
            saveChanges({
                concept: newConcept || null,
                date: newDate || null,
                method: newMethod || null,
                amount: newAmount || null
            });
        });
    }
}

// Inicializar botones flotantes
function initFloatingButtons() {
    // Botón exportar
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            window.location.href = '../html/exportar.titular.html';
        });
    }
    
    // Botón registrar gasto
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            window.location.href = '../html/titular.registrargasto.html';
        });
    }
}

// Cargar detalles del gasto a editar
function loadExpenseDetails() {
    // Obtener IDs desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const collaboratorId = urlParams.get('collaboratorId') || '1';
    const expenseId = urlParams.get('expenseId') || '1';
    
    // Obtener el colaborador
    const collaborator = getCollaboratorData(collaboratorId);
    
    if (collaborator) {
        // Actualizar el nombre del colaborador
        document.querySelector('.collaborator-name').textContent = collaborator.name;
        
        // Buscar el gasto específico
        const expense = collaborator.expenses.find(e => e.id === expenseId) || collaborator.expenses[0];
        
        if (expense) {
            // Llenar los campos con los valores actuales
            document.querySelector('input.old-value[value="Concepto antiguo"]').value = expense.concept;
            document.querySelector('input.old-value[value="Fecha antigua"]').value = expense.date;
            document.querySelector('input.old-value[value="Método de pago antiguo"]').value = expense.method;
            document.querySelector('input.old-value[value="Monto de pago antiguo"]').value = expense.amount;
            
            // Pre-llenar los campos de nuevos valores
            document.querySelector('input.new-value[placeholder="Concepto nuevo"]').value = expense.concept;
            document.querySelector('input.new-value[placeholder="Fecha nueva"]').value = expense.date;
            document.querySelector('input.new-value[placeholder="Método de pago nuevo"]').value = expense.method;
            document.querySelector('input.new-value[placeholder="Monto de pago nuevo"]').value = expense.amount;
        }
    }
}

// Obtener datos del colaborador (simulado)
function getCollaboratorData(id) {
    // Simulación de datos de colaboradores
    const collaborators = {
        '1': {
            name: 'Nombre(s) Apellidos',
            email: 'colaborador1@email.com',
            expenses: [
                { id: '1', concept: 'Comida', date: '15/06/2023', method: 'Efectivo', amount: '$ 250' },
                { id: '2', concept: 'Transporte', date: '16/06/2023', method: 'Tarjeta', amount: '$ 180' }
            ]
        },
        '2': {
            name: 'Otro Colaborador',
            email: 'colaborador2@email.com',
            expenses: [
                { id: '1', concept: 'Ropa', date: '14/06/2023', method: 'Tarjeta', amount: '$ 500' },
                { id: '2', concept: 'Libros', date: '17/06/2023', method: 'Efectivo', amount: '$ 320' }
            ]
        }
    };
    
    return collaborators[id] || null;
}

// Guardar cambios (simulado)
function saveChanges(newValues) {
    console.log('Guardando cambios:', newValues);
    
    // Simulación de proceso de guardado
    showLoadingOverlay();
    
    // Simulación de retraso para la operación
    setTimeout(function() {
        // Ocultar carga
        hideLoadingOverlay();
        
        // Mostrar mensaje de éxito
        showMessage('Cambios aplicados correctamente', 'success');
        
        // En un caso real, aquí redirigiríamos después de guardar
        // Simulación de redirección después de un tiempo
        setTimeout(function() {
            const urlParams = new URLSearchParams(window.location.search);
            const collaboratorId = urlParams.get('collaboratorId') || '1';
            window.location.href = `../html/titular.tc2.html?id=${collaboratorId}`;
        }, 1500);
    }, 1000);
}

// Mostrar overlay de carga
function showLoadingOverlay() {
    // Crear elemento de overlay
    const overlayEl = document.createElement('div');
    overlayEl.className = 'loading-overlay';
    
    // Contenido del overlay
    overlayEl.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Aplicando cambios...</div>
    `;
    
    // Estilos
    overlayEl.style.position = 'fixed';
    overlayEl.style.top = '0';
    overlayEl.style.left = '0';
    overlayEl.style.width = '100%';
    overlayEl.style.height = '100%';
    overlayEl.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlayEl.style.display = 'flex';
    overlayEl.style.flexDirection = 'column';
    overlayEl.style.justifyContent = 'center';
    overlayEl.style.alignItems = 'center';
    overlayEl.style.zIndex = '1000';
    
    // Estilos para el spinner
    const spinner = document.createElement('style');
    spinner.textContent = `
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            animation: spin 1s linear infinite;
            margin-bottom: 15px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loading-text {
            color: white;
            font-size: 16px;
        }
    `;
    
    document.head.appendChild(spinner);
    document.body.appendChild(overlayEl);
}

// Ocultar overlay de carga
function hideLoadingOverlay() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Mostrar mensaje
function showMessage(message, type = 'success') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}-message`;
    messageEl.textContent = message;
    
    // Estilos base para el mensaje
    messageEl.style.position = 'fixed';
    messageEl.style.bottom = '20px';
    messageEl.style.left = '50%';
    messageEl.style.transform = 'translateX(-50%)';
    messageEl.style.padding = '10px 20px';
    messageEl.style.borderRadius = '4px';
    messageEl.style.color = 'white';
    messageEl.style.fontWeight = '500';
    messageEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    messageEl.style.zIndex = '1000';
    
    // Estilos específicos por tipo de mensaje
    if (type === 'success') {
        messageEl.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        messageEl.style.backgroundColor = '#F44336';
    }
    
    // Agregar al DOM
    document.body.appendChild(messageEl);
    
    // Remover después de un tiempo
    setTimeout(function() {
        messageEl.style.opacity = '0';
        messageEl.style.transition = 'opacity 0.5s ease';
        
        setTimeout(function() {
            messageEl.remove();
        }, 500);
    }, 3000);
} 