document.addEventListener('DOMContentLoaded', function() {
    // Inicializar eventos
    inicializarEventos();
});

function inicializarEventos() {
    // Configurar botón de regreso
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.history.back();
        });
    }

    // Configurar opciones de exportación
    const excelOption = document.querySelector('.export-option.excel');
    const pdfOption = document.querySelector('.export-option.pdf');
    
    if (excelOption) {
        excelOption.addEventListener('click', function() {
            exportarDatos('excel');
        });
    }
    
    if (pdfOption) {
        pdfOption.addEventListener('click', function() {
            exportarDatos('pdf');
        });
    }

    // Configurar botón flotante de exportación
    const exportBtn = document.querySelector('.floating-btn.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            // Por defecto, exportar en Excel
            exportarDatos('excel');
        });
    }

    // Configurar botón de agregar gasto
    const addBtn = document.querySelector('.floating-btn.add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            window.location.href = '../html/registro.gasto.html';
        });
    }

    // Configurar navegación de pestañas
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', function() {
            // Eliminar clase active de todas las pestañas
            tabs.forEach(t => t.classList.remove('active'));
            
            // Agregar clase active a la pestaña clickeada
            this.classList.add('active');
            
            // Navegar a la página correspondiente
            const paginas = ['../html/individual.inicio.html', '../html/individual.resumen.html', '../html/individual.cl.html'];
            if (paginas[index]) {
                window.location.href = paginas[index];
            }
        });
    });
}

// Función para exportar datos
function exportarDatos(formato) {
    // Esta función simularía la exportación de datos
    console.log(`Exportando datos en formato: ${formato}`);
    
    // Simulación de carga
    mostrarMensajeCarga(`Generando archivo ${formato.toUpperCase()}...`);
    
    // Simulación de proceso completado después de 2 segundos
    setTimeout(function() {
        ocultarMensajeCarga();
        
        if (formato === 'excel') {
            mostrarMensajeExito('Archivo Excel generado correctamente');
            simularDescargaArchivo('gastos_clean_secure_money.xlsx');
        } else if (formato === 'pdf') {
            mostrarMensajeExito('Archivo PDF generado correctamente');
            simularDescargaArchivo('gastos_clean_secure_money.pdf');
        }
    }, 2000);
}

// Función para mostrar mensaje de carga
function mostrarMensajeCarga(mensaje) {
    // Crear elemento de mensaje
    let mensajeEl = document.createElement('div');
    mensajeEl.className = 'mensaje-carga';
    mensajeEl.innerHTML = `
        <div class="mensaje-contenido">
            <div class="spinner"></div>
            <p>${mensaje}</p>
        </div>
    `;
    
    // Aplicar estilos al mensaje
    mensajeEl.style.position = 'fixed';
    mensajeEl.style.top = '0';
    mensajeEl.style.left = '0';
    mensajeEl.style.width = '100%';
    mensajeEl.style.height = '100%';
    mensajeEl.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    mensajeEl.style.display = 'flex';
    mensajeEl.style.justifyContent = 'center';
    mensajeEl.style.alignItems = 'center';
    mensajeEl.style.zIndex = '1000';
    
    // Estilos para el contenido del mensaje
    const contenido = mensajeEl.querySelector('.mensaje-contenido');
    contenido.style.backgroundColor = 'white';
    contenido.style.padding = '20px';
    contenido.style.borderRadius = '8px';
    contenido.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    contenido.style.display = 'flex';
    contenido.style.flexDirection = 'column';
    contenido.style.alignItems = 'center';
    
    // Estilos para el spinner
    const spinner = mensajeEl.querySelector('.spinner');
    spinner.style.width = '40px';
    spinner.style.height = '40px';
    spinner.style.border = '4px solid #f3f3f3';
    spinner.style.borderTop = '4px solid #684a8e';
    spinner.style.borderRadius = '50%';
    spinner.style.marginBottom = '10px';
    spinner.style.animation = 'spin 1s linear infinite';
    
    // Crear keyframes para la animación del spinner
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(styleSheet);
    
    // Agregar mensaje al DOM
    document.body.appendChild(mensajeEl);
}

// Función para ocultar mensaje de carga
function ocultarMensajeCarga() {
    const mensajeEl = document.querySelector('.mensaje-carga');
    if (mensajeEl) {
        mensajeEl.remove();
    }
}

// Función para mostrar mensaje de éxito
function mostrarMensajeExito(mensaje) {
    // Crear elemento de mensaje
    let mensajeEl = document.createElement('div');
    mensajeEl.className = 'mensaje-exito';
    mensajeEl.textContent = mensaje;
    
    // Aplicar estilos al mensaje
    mensajeEl.style.position = 'fixed';
    mensajeEl.style.bottom = '20px';
    mensajeEl.style.left = '50%';
    mensajeEl.style.transform = 'translateX(-50%)';
    mensajeEl.style.backgroundColor = '#4CAF50';
    mensajeEl.style.color = 'white';
    mensajeEl.style.padding = '10px 20px';
    mensajeEl.style.borderRadius = '4px';
    mensajeEl.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    mensajeEl.style.zIndex = '1000';
    
    // Agregar mensaje al DOM
    document.body.appendChild(mensajeEl);
    
    // Remover mensaje después de 3 segundos
    setTimeout(function() {
        mensajeEl.remove();
    }, 3000);
}

// Función para simular la descarga de un archivo
function simularDescargaArchivo(nombreArchivo) {
    // En una implementación real, aquí se generaría el archivo real
    // Para esta simulación, solo mostramos un mensaje en consola
    console.log(`Descargando archivo: ${nombreArchivo}`);
    
    // Crear un elemento de enlace para simular la descarga
    const enlace = document.createElement('a');
    enlace.href = '#';
    enlace.download = nombreArchivo;
    enlace.textContent = 'Descargar';
    enlace.style.display = 'none';
    
    // Agregar al DOM
    document.body.appendChild(enlace);
    
    // Simular clic en el enlace
    enlace.click();
    
    // Eliminar el enlace
    document.body.removeChild(enlace);
} 