document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la página
    inicializarFuncionalidades();
});

function inicializarFuncionalidades() {
    // Configurar edición de conceptos
    configurarEdicionConceptos();
    
    // Configurar botones de eliminar
    configurarBotonesEliminar();
    
    // Configurar botón de agregar
    configurarBotonAgregar();
    
    
}

function configurarEdicionConceptos() {
    // Obtener todos los botones de edición
    const editButtons = document.querySelectorAll('.edit-btn');
    
    // Añadir listener a cada botón
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Obtener el input asociado al botón (elemento hermano anterior)
            const input = this.parentElement.previousElementSibling;
            
            // Alternar el estado de solo lectura
            input.readOnly = !input.readOnly;
            
            // Si ahora es editable, darle el foco
            if (!input.readOnly) {
                input.focus();
                input.select();
                // Cambiar el color de fondo para indicar que está en modo edición
                input.style.backgroundColor = '#fff';
            } else {
                // Restaurar el color de fondo
                input.style.backgroundColor = '#f8f8f8';
                // Aquí se implementaría la lógica para guardar el valor editado
                guardarValor(input);
            }
        });
    });
    
    // Configurar eventos para los inputs para guardar al presionar Enter
    const inputs = document.querySelectorAll('.concept-item input, .limit-item input');
    inputs.forEach(input => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                // Quitar el foco y hacer el input de solo lectura de nuevo
                input.readOnly = true;
                input.blur();
                input.style.backgroundColor = '#f8f8f8';
                // Guardar el valor
                guardarValor(input);
            }
        });
    });
}

function guardarValor(input) {
    // Aquí iría la lógica para guardar el valor en la base de datos
    console.log('Guardando valor:', input.value);
    
    // Ejemplo de validación simple para límites monetarios
    if (input.value.includes('$')) {
        // Es un campo de límite monetario, validar formato
        const valorNumerico = input.value.replace(/[^\d]/g, '');
        if (valorNumerico && !isNaN(valorNumerico)) {
            // Formatear correctamente
            input.value = '$ ' + valorNumerico;
        }
    }
}

function configurarBotonesEliminar() {
    // Obtener todos los botones de eliminar
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    // Añadir listener a cada botón
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Confirmar antes de eliminar
            if (confirm('¿Estás seguro de que deseas eliminar este concepto/límite?')) {
                // Obtener el elemento padre (toda la fila)
                const item = this.closest('.concept-item, .limit-item');
                
                // Aquí iría la lógica para eliminar el registro de la base de datos
                console.log('Eliminando elemento');
                
                // Animación simple de desvanecimiento antes de eliminar
                item.style.opacity = '0';
                item.style.transition = 'opacity 0.3s ease';
                
                // Eliminar del DOM después de la transición
                setTimeout(() => {
                    item.remove();
                }, 300);
            }
        });
    });
}

function configurarBotonAgregar() {
    // Obtener el botón de agregar
    const addButton = document.querySelector('.add-btn');
    
    // Añadir listener al botón
    addButton.addEventListener('click', function() {
        // Mostrar un modal o formulario para agregar nuevo concepto/límite
        agregarNuevoConceptoLimite();
    });
}

function agregarNuevoConceptoLimite() {
    // En una implementación real, aquí se mostraría un modal o formulario
    // Para este ejemplo, simplemente agregamos un nuevo concepto y límite directamente
    
    const conceptoNombre = prompt('Ingresa el nombre del nuevo concepto:');
    if (!conceptoNombre) return; // El usuario canceló
    
    const limiteValor = prompt('Ingresa el límite para este concepto (o NA si no aplica):');
    if (limiteValor === null) return; // El usuario canceló
    
    // Formatear el valor del límite
    let valorFormateado = limiteValor;
    if (limiteValor.toLowerCase() !== 'na' && !isNaN(limiteValor.replace(/[^\d]/g, ''))) {
        valorFormateado = '$ ' + limiteValor.replace(/[^\d]/g, '');
    }
    
    // Crear y agregar el nuevo concepto
    const nuevoConcepto = document.createElement('div');
    nuevoConcepto.className = 'concept-item';
    nuevoConcepto.innerHTML = `<input type="text" value="${conceptoNombre}" readonly>`;
    document.querySelector('.concepts-list').appendChild(nuevoConcepto);
    
    // Crear y agregar el nuevo límite
    const nuevoLimite = document.createElement('div');
    nuevoLimite.className = 'limit-item';
    nuevoLimite.innerHTML = `
        <input type="text" value="${valorFormateado}" readonly>
        <div class="actions">
            <button class="edit-btn"><i class="fas fa-pencil-alt"></i></button>
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
        </div>
    `;
    document.querySelector('.limits-list').appendChild(nuevoLimite);
    
    // Reinicializar los listeners para los nuevos elementos
    inicializarFuncionalidades();
}

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
// Función para cambiar entre páginas
function cambiarPagina(pagina) {
    switch(pagina) {
        case 'gastos':
            window.location.href = '../html/individual.inicio.html';
            break;
        case 'resumen':
            window.location.href = '../html/individual.resumen.html';
            break;
        case 'conceptos':
            // Ya estamos en esta página
            break;
    }
} 