document.addEventListener('DOMContentLoaded', function() {
    // Inicializar eventos de la página
    initPageEvents();
    
    // Cargar datos de gastos
    loadGastosData();
});

function initPageEvents() {
    // Eventos para las pestañas
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Si hace clic en "Resumen semanal"
            if (this.textContent === 'Resumen semanal') {
                window.location.href = '../html/colaborador.resumen.html';
            }
        });
    });

    // Botón de regresar
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            // Volver a la página de inicio de sesión
            window.location.href = '../html/login.html';
        });
    }
    
    // Botón de exportar
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            window.location.href = '../html/exportar.colaborador.html';
        });
    }

    // Botón de registrar gasto
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            window.location.href = '../html/colaborador.registrargasto.html';
        });
    }
    
    // Hacer que las filas sean clicables para ver detalles
    const tableRows = document.querySelectorAll('.table-row');
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            const concepto = this.querySelector('.concepto-cell').textContent;
            const fecha = this.querySelector('.fecha-cell').textContent;
            const monto = this.querySelector('.monto-cell').textContent;
            
            showGastoDetails(concepto, fecha, monto);
        });
    });
}

// Función para cargar datos de gastos (simulado)
function loadGastosData() {
    // En una aplicación real, aquí se harían las peticiones al servidor
    // para obtener los datos de gastos del colaborador
    console.log('Cargando datos de gastos...');
    
    // Los datos ya están cargados en el HTML por ahora
}

// Función para mostrar detalles de un gasto
function showGastoDetails(concepto, fecha, monto) {
    // Crear modal de detalles
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h3>Detalles del gasto</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <div class="detail-item">
                <strong>Concepto:</strong> 
                <span>${concepto}</span>
            </div>
            <div class="detail-item">
                <strong>Fecha:</strong> 
                <span>${fecha}</span>
            </div>
            <div class="detail-item">
                <strong>Monto:</strong> 
                <span>${monto}</span>
            </div>
            <!-- Aquí se pueden agregar más detalles como categoría, notas, etc. -->
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
            width: 90%;
            max-width: 500px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
        }
        
        .modal-header h3 {
            font-size: 18px;
            color: #333;
            margin: 0;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .detail-item {
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
        }
        
        .detail-item strong {
            color: #555;
        }
    `;
    
    document.head.appendChild(styles);
    
    // Evento para cerrar el modal
    modalContent.querySelector('.modal-close').addEventListener('click', function() {
        document.body.removeChild(modalOverlay);
    });
    
    // Cerrar al hacer clic fuera del modal
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
        }
    });
} 