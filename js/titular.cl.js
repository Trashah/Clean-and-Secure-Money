document.addEventListener('DOMContentLoaded', function() {
    // Inicializar eventos de la página
    initPageEvents();
    
    // Cargar los conceptos
    loadConceptos();
});

function initPageEvents() {
    // Eventos para botones de editar
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const conceptoItem = this.closest('.concepto-item');
            const conceptoNombre = conceptoItem.querySelector('.concepto-nombre').textContent;
            const conceptoMonto = conceptoItem.querySelector('.concepto-monto').textContent;
            
            editarConcepto(conceptoNombre, conceptoMonto);
        });
    });
    
    // Eventos para botones de eliminar
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const conceptoItem = this.closest('.concepto-item');
            const conceptoNombre = conceptoItem.querySelector('.concepto-nombre').textContent;
            
            confirmarEliminarConcepto(conceptoNombre, conceptoItem);
        });
    });
}

// Función para cargar los conceptos (simulado)
function loadConceptos() {
    // En un caso real, aquí se haría una petición al servidor
    // para obtener los conceptos y límites
    
    // La lista ya está cargada en el HTML por ahora
    console.log('Conceptos cargados');
}

// Función para editar un concepto
function editarConcepto(nombre, monto) {
    // En una aplicación real, aquí se redireccionaría a la página de edición
    // o se abriría un modal para editar el concepto
    
    // Por ahora, solo redirigimos a la página de agregar
    window.location.href = '../html/titular.cl.agregar.html';
}

// Función para confirmar eliminación de un concepto
function confirmarEliminarConcepto(nombre, elementoDOM) {
    // Crear modal de confirmación
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    modalContent.innerHTML = `
        <h3>Confirmar eliminación</h3>
        <p>¿Estás seguro de que deseas eliminar el concepto "${nombre}"?</p>
        <div class="modal-buttons">
            <button class="btn-cancelar">Cancelar</button>
            <button class="btn-confirmar">Eliminar</button>
        </div>
    `;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Estilos para el modal
    const styles = document.createElement('style');
    styles.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .modal-content {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .modal-content h3 {
            margin-bottom: 15px;
            color: #333;
        }
        
        .modal-buttons {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
            gap: 10px;
        }
        
        .btn-cancelar, .btn-confirmar {
            padding: 8px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
        }
        
        .btn-cancelar {
            background-color: #e0e0e0;
            color: #333;
        }
        
        .btn-confirmar {
            background-color: #e74c3c;
            color: white;
        }
    `;
    
    document.head.appendChild(styles);
    
    // Eventos para los botones del modal
    modalContent.querySelector('.btn-cancelar').addEventListener('click', function() {
        document.body.removeChild(modalOverlay);
    });
    
    modalContent.querySelector('.btn-confirmar').addEventListener('click', function() {
        eliminarConcepto(elementoDOM);
        document.body.removeChild(modalOverlay);
    });
}

// Función para eliminar un concepto
function eliminarConcepto(elementoDOM) {
    // Mostrar efecto de carga
    elementoDOM.style.opacity = '0.5';
    
    // Simular petición al servidor
    setTimeout(() => {
        // Eliminar elemento del DOM con animación
        elementoDOM.style.transition = 'all 0.3s';
        elementoDOM.style.height = '0';
        elementoDOM.style.padding = '0';
        elementoDOM.style.margin = '0';
        elementoDOM.style.overflow = 'hidden';
        
        setTimeout(() => {
            elementoDOM.remove();
            // Mostrar mensaje de éxito
            showSuccessMessage('Concepto eliminado correctamente');
        }, 300);
    }, 500);
}

// Mostrar mensaje de éxito
function showSuccessMessage(message) {
    // Crear elemento para el mensaje
    const messageEl = document.createElement('div');
    messageEl.className = 'success-message';
    messageEl.textContent = message;
    
    // Estilos para el mensaje
    messageEl.style.position = 'fixed';
    messageEl.style.top = '20px';
    messageEl.style.left = '50%';
    messageEl.style.transform = 'translateX(-50%)';
    messageEl.style.backgroundColor = '#2ecc71';
    messageEl.style.color = 'white';
    messageEl.style.padding = '15px 25px';
    messageEl.style.borderRadius = '5px';
    messageEl.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    messageEl.style.zIndex = '1000';
    
    document.body.appendChild(messageEl);
    
    // Eliminar mensaje después de un tiempo
    setTimeout(() => {
        messageEl.style.opacity = '0';
        messageEl.style.transition = 'opacity 0.3s';
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 300);
    }, 2000);
} 