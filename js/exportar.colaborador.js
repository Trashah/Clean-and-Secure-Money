document.addEventListener('DOMContentLoaded', function() {
    // Inicializar eventos de la página
    initPageEvents();
});

function initPageEvents() {
    // Eventos para las pestañas
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Si hace clic en "Tus gastos"
            if (this.textContent === 'Tus gastos') {
                window.location.href = '../html/colaborador.inicio.html';
            } else if (this.textContent === 'Resumen semanal') {
                window.location.href = '../html/colaborador.resumen.html';
            }
        });
    });

    // Botón de regresar
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            // Volver a la pantalla de inicio del colaborador
            window.location.href = '../html/colaborador.inicio.html';
        });
    }

    // Seleccionar opciones de exportación
    const opcionesExportar = document.querySelectorAll('.export-option');
    opcionesExportar.forEach(opcion => {
        opcion.addEventListener('click', function() {
            // Deseleccionar todas las opciones
            opcionesExportar.forEach(op => op.classList.remove('selected'));
            
            // Seleccionar la opción actual
            this.classList.add('selected');
            
            // Obtener tipo de exportación
            const tipoExportacion = this.querySelector('span').textContent.toLowerCase();
            console.log(`Seleccionada exportación en formato: ${tipoExportacion}`);
        });
    });
    
    // Botón de exportar
    const exportarBtn = document.querySelector('.export-btn');
    if (exportarBtn) {
        exportarBtn.addEventListener('click', function() {
            // Verificar si hay una opción seleccionada
            const opcionSeleccionada = document.querySelector('.export-option.selected');
            if (!opcionSeleccionada) {
                showMessage('Por favor, selecciona un formato de exportación', 'error');
                return;
            }
            
            const tipoExportacion = opcionSeleccionada.querySelector('span').textContent.toLowerCase();
            exportarDatos(tipoExportacion);
        });
    }

    // Botón de registrar gasto
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            window.location.href = '../html/colaborador.registrargasto.html';
        });
    }
}

// Función para exportar datos
function exportarDatos(formato) {
    // Mostrar mensaje de carga
    showLoadingOverlay(`Generando archivo ${formato.toUpperCase()}...`);
    
    // Simular tiempo de procesamiento (aquí se haría la petición al servidor)
    setTimeout(() => {
        hideLoadingOverlay();
        
        // Simular descarga de archivo
        if (formato === 'excel') {
            simulateDownload('colaboradores_reporte.xlsx');
        } else if (formato === 'pdf') {
            simulateDownload('colaboradores_reporte.pdf');
        }
        
        // Mostrar mensaje de éxito
        showMessage(`Reporte exportado correctamente en formato ${formato.toUpperCase()}`, 'success');
    }, 1500);
}

// Simular descarga de archivo
function simulateDownload(filename) {
    console.log(`Simulando descarga del archivo: ${filename}`);
    // En una aplicación real, aquí se generaría el blob y se descargaría el archivo
}

// Mostrar overlay de carga
function showLoadingOverlay(message) {
    // Crear elemento de overlay
    const overlayEl = document.createElement('div');
    overlayEl.className = 'loading-overlay';
    
    // Contenido del overlay
    overlayEl.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">${message}</div>
    `;
    
    // Estilos
    const styles = document.createElement('style');
    styles.textContent = `
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
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
    
    document.head.appendChild(styles);
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
    // Crear elemento para el mensaje
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    messageEl.textContent = message;
    
    // Estilos para el mensaje
    messageEl.style.position = 'fixed';
    messageEl.style.top = '20px';
    messageEl.style.left = '50%';
    messageEl.style.transform = 'translateX(-50%)';
    messageEl.style.padding = '15px 25px';
    messageEl.style.borderRadius = '5px';
    messageEl.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    messageEl.style.zIndex = '1000';
    messageEl.style.color = 'white';
    
    // Aplicar color según tipo de mensaje
    if (type === 'success') {
        messageEl.style.backgroundColor = '#2ecc71';
    } else if (type === 'error') {
        messageEl.style.backgroundColor = '#e74c3c';
    } else {
        messageEl.style.backgroundColor = '#3498db';
    }
    
    document.body.appendChild(messageEl);
    
    // Eliminar mensaje después de un tiempo
    setTimeout(() => {
        messageEl.style.opacity = '0';
        messageEl.style.transition = 'opacity 0.3s';
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 300);
    }, 3000);
} 