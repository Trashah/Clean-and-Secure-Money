document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la página
    inicializarEventos();
    configurarFormulario();
});

function inicializarEventos() {
    // Configurar botón de regreso
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.history.back();
        });
    }

    // Configurar navegación de pestañas
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
    

    // Configurar botón de registrar gasto
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            registrarGasto();
        });
    }

    // Configurar botón flotante (redundante, solo por si acaso)
    const floatingBtn = document.querySelector('.floating-btn');
    if (floatingBtn) {
        floatingBtn.addEventListener('click', function() {
            registrarGasto();
        });
    }
}

function configurarFormulario() {
    // Establecer la fecha actual en el campo de fecha
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        const fechaActual = `${año}-${mes}-${dia}`;
        fechaInput.value = fechaActual;
    }

    // Configurar validación para campo de monto (solo números y punto decimal)
    const montoInput = document.getElementById('monto');
    if (montoInput) {
        montoInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9.]/g, '');
            
            // Evitar múltiples puntos decimales
            const puntos = this.value.match(/\./g);
            if (puntos && puntos.length > 1) {
                this.value = this.value.replace(/\.(?=.*\.)/g, '');
            }
        });
    }
}

function registrarGasto() {
    // Obtener valores del formulario
    const concepto = document.getElementById('concepto').value;
    const fecha = document.getElementById('fecha').value;
    const metodo = document.getElementById('metodo').value;
    const monto = document.getElementById('monto').value;

    // Validar formulario
    if (!concepto || concepto === '') {
        mostrarError('Por favor selecciona un concepto');
        return;
    }
    
    if (!fecha) {
        mostrarError('Por favor selecciona una fecha');
        return;
    }
    
    if (!metodo || metodo === '') {
        mostrarError('Por favor selecciona un método de pago');
        return;
    }
    
    if (!monto || monto === '') {
        mostrarError('Por favor ingresa un monto');
        return;
    }

    // Formatear datos
    const gastoData = {
        concepto: concepto,
        fecha: fecha,
        metodo: metodo,
        monto: parseFloat(monto)
    };

    // Mostrar mensaje de carga
    mostrarMensajeCarga('Registrando gasto...');

    // Simular envío de datos (en una implementación real, esto sería una llamada a API)
    setTimeout(function() {
        // Ocultar mensaje de carga
        ocultarMensajeCarga();
        
        // Mostrar mensaje de éxito
        mostrarMensajeExito('Gasto registrado correctamente');
        
        // Redireccionar después de un breve retraso
        setTimeout(function() {
            window.location.href = '../html/titular.inicio.html';
        }, 1500);
    }, 1500);
}

function mostrarError(mensaje) {
    // Crear elemento de mensaje
    let mensajeEl = document.createElement('div');
    mensajeEl.className = 'mensaje-error';
    mensajeEl.textContent = mensaje;
    
    // Aplicar estilos al mensaje
    mensajeEl.style.position = 'fixed';
    mensajeEl.style.top = '20px';
    mensajeEl.style.left = '50%';
    mensajeEl.style.transform = 'translateX(-50%)';
    mensajeEl.style.backgroundColor = '#f44336';
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

function ocultarMensajeCarga() {
    const mensajeEl = document.querySelector('.mensaje-carga');
    if (mensajeEl) {
        mensajeEl.remove();
    }
}

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