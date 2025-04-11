document.addEventListener('DOMContentLoaded', function() {
    // Inicializar eventos
    initFormEvents();
});
//navegacion entre pestañas
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

function initFormEvents() {
    const aplicarButton = document.getElementById('aplicar-cambios');
    const conceptoInput = document.querySelector('input[placeholder="Concepto de pago nuevo"]');
    const montoInput = document.querySelector('input[placeholder="Limite de monto de pago del concepto"]');
    
    if (aplicarButton) {
        aplicarButton.addEventListener('click', function(e) {
            e.preventDefault();
            validateAndSubmit();
        });
    }
    
    // Eventos para campos de formulario
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        // Quitar mensajes de error al escribir
        input.addEventListener('input', function() {
            this.classList.remove('error');
            const errorMsg = this.parentElement.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        });
    });
}

function validateAndSubmit() {
    // Obtener valores del formulario
    const concepto = document.querySelector('input[placeholder="Concepto de pago nuevo"]').value.trim();
    const monto = document.querySelector('input[placeholder="Limite de monto de pago del concepto"]').value.trim();
    
    // Limpiar errores previos
    clearErrors();
    
    // Validar campos requeridos
    let isValid = true;
    
    if (!concepto) {
        showError('concepto', 'El concepto es obligatorio');
        isValid = false;
    }
    
    if (!monto) {
        showError('monto', 'El monto límite es obligatorio');
        isValid = false;
    } else if (isNaN(monto) || parseFloat(monto) <= 0) {
        showError('monto', 'El monto debe ser un número positivo');
        isValid = false;
    }
    
    // Si todo es válido, enviar el formulario
    if (isValid) {
        guardarConcepto({
            concepto,
            monto: parseFloat(monto)
        });
    }
}

function showError(inputId, message) {
    const parent = inputId === 'concepto' ? document.querySelector('.concepto-row') : document.querySelector('.monto-row');
    const input = parent.querySelector('input');
    input.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#e74c3c';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '5px';
    
    // Agregar el mensaje después del input
    if (!parent.querySelector('.error-message')) {
        parent.appendChild(errorDiv);
    }
}

function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    
    const errorInputs = document.querySelectorAll('.error');
    errorInputs.forEach(input => input.classList.remove('error'));
}

function guardarConcepto(data) {
    // Mostrar cargando
    showLoadingOverlay();
    
    // Simulación de registro exitoso (aquí se haría la petición al servidor)
    setTimeout(() => {
        hideLoadingOverlay();
        
        // Mostrar mensaje de éxito
        showSuccessMessage('Concepto y límite guardados correctamente');
        
        // Redirigir a la página de conceptos/límites después de un tiempo
        setTimeout(() => {
            window.location.href = '../html/titular.tc1.html';
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
        <div class="loading-text">Guardando concepto y límite...</div>
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
        messageEl.remove();
    }, 3000);
} 