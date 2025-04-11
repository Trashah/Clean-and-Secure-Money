document.addEventListener('DOMContentLoaded', function() {
    // Inicializar eventos
    initFormEvents();
});

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

function initFormEvents() {
    const addButton = document.getElementById('add-collaborator-btn');
    const form = document.querySelector('.register-form');
    
    if (addButton) {
        addButton.addEventListener('click', function(e) {
            e.preventDefault();
            validateAndSubmit();
        });
    }
    
    // Eventos para campos de formulario
    const inputs = form.querySelectorAll('input');
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
    const nombres = document.getElementById('nombres').value.trim();
    const apellido1 = document.getElementById('apellido1').value.trim();
    const apellido2 = document.getElementById('apellido2').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Limpiar errores previos
    clearErrors();
    
    // Validar campos requeridos
    let isValid = true;
    
    if (!nombres) {
        showError('nombres', 'El nombre es obligatorio');
        isValid = false;
    }
    
    if (!apellido1) {
        showError('apellido1', 'El primer apellido es obligatorio');
        isValid = false;
    }
    
    if (!email) {
        showError('email', 'El correo electrónico es obligatorio');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('email', 'El formato del correo electrónico no es válido');
        isValid = false;
    }
    
    if (!password) {
        showError('password', 'La contraseña es obligatoria');
        isValid = false;
    } else if (password.length < 6) {
        showError('password', 'La contraseña debe tener al menos 6 caracteres');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showError('confirm-password', 'Las contraseñas no coinciden');
        isValid = false;
    }
    
    // Si todo es válido, enviar el formulario
    if (isValid) {
        addCollaborator({
            nombres,
            apellidos: `${apellido1} ${apellido2}`.trim(),
            email,
            password
        });
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(inputId, message) {
    const input = document.getElementById(inputId);
    input.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#e74c3c';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '5px';
    
    // Si es un campo de apellidos, agregar el mensaje después del contenedor
    if (inputId === 'apellido1' || inputId === 'apellido2') {
        const apellidosContainer = document.querySelector('.apellidos-container');
        if (!apellidosContainer.nextElementSibling || !apellidosContainer.nextElementSibling.classList.contains('error-message')) {
            apellidosContainer.parentElement.insertBefore(errorDiv, apellidosContainer.nextElementSibling);
        }
    } else {
        // Para otros campos, agregar el mensaje después del input
        const parent = input.parentElement;
        if (!parent.querySelector('.error-message')) {
            parent.appendChild(errorDiv);
        }
    }
}

function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    
    const errorInputs = document.querySelectorAll('.error');
    errorInputs.forEach(input => input.classList.remove('error'));
}

function addCollaborator(data) {
    // Mostrar cargando
    showLoadingOverlay();
    
    // Simulación de registro exitoso (aquí se haría la petición al servidor)
    setTimeout(() => {
        hideLoadingOverlay();
        
        // Mostrar mensaje de éxito
        showSuccessMessage('Colaborador añadido correctamente');
        
        // Redirigir a la página de colaboradores después de un tiempo
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
        <div class="loading-text">Añadiendo colaborador...</div>
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
    messageEl.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
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