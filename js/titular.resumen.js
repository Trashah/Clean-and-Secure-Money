document.addEventListener('DOMContentLoaded', function() {
    // Inicializar funcionalidades
    initCharts();
    initFilterButtons();
    initButtonEvents();
    initTabNavigation();
});

// Inicializar gráfico circular
function initCharts() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    // Datos del gráfico
    const data = {
        labels: ['Videojuegos', 'Comida', 'Renta', 'Agua', 'Luz'],
        datasets: [{
            data: [20, 20, 20, 20, 20], // Porcentajes iguales para cada categoría
            backgroundColor: [
                '#373B84', // Videojuegos - azul oscuro
                '#58CFDE', // Comida - azul claro/turquesa
                '#FFB347', // Renta - naranja
                '#4683B7', // Agua - azul medio
                '#8077A8'  // Luz - morado claro
            ],
            borderWidth: 0,
            hoverOffset: 15
        }]
    };
    
    // Opciones del gráfico
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%', // Crear un gráfico de dona
        plugins: {
            legend: {
                position: 'left',
                labels: {
                    boxWidth: 12,
                    padding: 15,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.raw}%`;
                    }
                }
            }
        }
    };
    
    // Crear el gráfico
    const myChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: options
    });
}

// Inicializar botones de filtro
function initFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-button');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Toggle clase activa
            this.classList.toggle('active');
            
            // Aquí iría la lógica para mostrar menú de filtros específico
            const filterType = this.textContent.trim().toLowerCase();
            showFilterPopup(filterType, this);
        });
    });
}

// Mostrar popup de filtro
function showFilterPopup(filterType, buttonElement) {
    // Eliminar cualquier popup existente
    removeFilterPopups();
    
    // Crear elemento popup
    const popupEl = document.createElement('div');
    popupEl.className = 'filter-popup';
    
    // Definir contenido según tipo de filtro
    let popupContent = '';
    
    switch(filterType) {
        case 'concepto':
            popupContent = `
                <h3>Filtrar por Concepto</h3>
                <div class="filter-options">
                    <label><input type="checkbox" value="comida"> Comida</label>
                    <label><input type="checkbox" value="renta"> Renta</label>
                    <label><input type="checkbox" value="videojuegos"> Videojuegos</label>
                    <label><input type="checkbox" value="agua"> Agua</label>
                    <label><input type="checkbox" value="luz"> Luz</label>
                </div>
                <div class="filter-actions">
                    <button class="apply-filter">Aplicar</button>
                    <button class="cancel-filter">Cancelar</button>
                </div>
            `;
            break;
            
        case 'fechas':
            popupContent = `
                <h3>Filtrar por Fecha</h3>
                <div class="filter-options date-filter">
                    <div class="date-range">
                        <label>Desde: <input type="date"></label>
                        <label>Hasta: <input type="date"></label>
                    </div>
                </div>
                <div class="filter-actions">
                    <button class="apply-filter">Aplicar</button>
                    <button class="cancel-filter">Cancelar</button>
                </div>
            `;
            break;
            
        case 'métodos':
            popupContent = `
                <h3>Filtrar por Método</h3>
                <div class="filter-options">
                    <label><input type="checkbox" value="efectivo"> Efectivo</label>
                    <label><input type="checkbox" value="tarjeta"> Tarjeta</label>
                    <label><input type="checkbox" value="transferencia"> Transferencia</label>
                </div>
                <div class="filter-actions">
                    <button class="apply-filter">Aplicar</button>
                    <button class="cancel-filter">Cancelar</button>
                </div>
            `;
            break;
            
        case 'monto':
            popupContent = `
                <h3>Filtrar por Monto</h3>
                <div class="filter-options amount-filter">
                    <div class="amount-range">
                        <label>Mínimo: <input type="number" min="0"></label>
                        <label>Máximo: <input type="number" min="0"></label>
                    </div>
                </div>
                <div class="filter-actions">
                    <button class="apply-filter">Aplicar</button>
                    <button class="cancel-filter">Cancelar</button>
                </div>
            `;
            break;
            
        case 'usuario':
            popupContent = `
                <h3>Filtrar por Usuario</h3>
                <div class="filter-options">
                    <label><input type="checkbox" value="user1"> Diego Pérez</label>
                    <label><input type="checkbox" value="user2"> Ana López</label>
                    <label><input type="checkbox" value="user3"> Carlos Gómez</label>
                </div>
                <div class="filter-actions">
                    <button class="apply-filter">Aplicar</button>
                    <button class="cancel-filter">Cancelar</button>
                </div>
            `;
            break;
    }
    
    // Agregar contenido al popup
    popupEl.innerHTML = popupContent;
    
    // Calcular posición del popup
    const buttonRect = buttonElement.getBoundingClientRect();
    popupEl.style.position = 'absolute';
    popupEl.style.top = `${buttonRect.bottom + window.scrollY + 10}px`;
    popupEl.style.left = `${buttonRect.left + window.scrollX}px`;
    popupEl.style.minWidth = '200px';
    popupEl.style.backgroundColor = 'white';
    popupEl.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    popupEl.style.borderRadius = '8px';
    popupEl.style.padding = '15px';
    popupEl.style.zIndex = '100';
    
    // Agregar popup al DOM
    document.body.appendChild(popupEl);
    
    // Agregar event listeners a los botones
    const applyBtn = popupEl.querySelector('.apply-filter');
    const cancelBtn = popupEl.querySelector('.cancel-filter');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            applyFilter(filterType, popupEl);
            removeFilterPopups();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            removeFilterPopups();
        });
    }
    
    // Cerrar al hacer clic fuera del popup
    document.addEventListener('click', closePopupOnOutsideClick);
}

// Cerrar popup al hacer clic fuera
function closePopupOnOutsideClick(e) {
    const popup = document.querySelector('.filter-popup');
    const filterButtons = document.querySelectorAll('.filter-button');
    
    if (popup) {
        let clickedOnButton = false;
        
        filterButtons.forEach(button => {
            if (button.contains(e.target)) {
                clickedOnButton = true;
            }
        });
        
        if (!popup.contains(e.target) && !clickedOnButton) {
            removeFilterPopups();
            document.removeEventListener('click', closePopupOnOutsideClick);
        }
    }
}

// Eliminar popups de filtro
function removeFilterPopups() {
    const popup = document.querySelector('.filter-popup');
    if (popup) {
        popup.remove();
        document.removeEventListener('click', closePopupOnOutsideClick);
    }
}

// Aplicar filtro
function applyFilter(filterType, popupEl) {
    console.log(`Aplicando filtro de ${filterType}`);
    
    // Lógica específica según el tipo de filtro
    switch(filterType) {
        case 'concepto':
            const conceptChecks = popupEl.querySelectorAll('input[type="checkbox"]:checked');
            if (conceptChecks.length > 0) {
                const concepts = Array.from(conceptChecks).map(cb => cb.value);
                console.log('Conceptos seleccionados:', concepts);
                filterTableByColumn('concepto', concepts);
            }
            break;
            
        case 'fechas':
            const dateInputs = popupEl.querySelectorAll('input[type="date"]');
            const startDate = dateInputs[0].value;
            const endDate = dateInputs[1].value;
            if (startDate && endDate) {
                console.log(`Filtrando por fecha desde ${startDate} hasta ${endDate}`);
                // Aquí iría la lógica para filtrar por rango de fechas
            }
            break;
            
        case 'métodos':
            const methodChecks = popupEl.querySelectorAll('input[type="checkbox"]:checked');
            if (methodChecks.length > 0) {
                const methods = Array.from(methodChecks).map(cb => cb.value);
                console.log('Métodos seleccionados:', methods);
                filterTableByColumn('metodo', methods);
            }
            break;
            
        case 'monto':
            const amountInputs = popupEl.querySelectorAll('input[type="number"]');
            const minAmount = amountInputs[0].value;
            const maxAmount = amountInputs[1].value;
            if (minAmount || maxAmount) {
                console.log(`Filtrando por monto desde ${minAmount || '0'} hasta ${maxAmount || 'infinito'}`);
                // Aquí iría la lógica para filtrar por rango de montos
            }
            break;
            
        case 'usuario':
            const userChecks = popupEl.querySelectorAll('input[type="checkbox"]:checked');
            if (userChecks.length > 0) {
                const users = Array.from(userChecks).map(cb => cb.value);
                console.log('Usuarios seleccionados:', users);
                filterTableByColumn('usuario', users);
            }
            break;
    }
    
    // Mostrar mensaje de filtro aplicado
    showSuccessMessage(`Filtro de ${filterType} aplicado correctamente`);
}

// Filtrar tabla por columna
function filterTableByColumn(columnClass, values) {
    const rows = document.querySelectorAll('.expenses-table .table-row');
    
    rows.forEach(row => {
        const cell = row.querySelector(`.${columnClass}`);
        const cellText = cell.textContent.trim().toLowerCase();
        
        let match = false;
        
        // Revisar si el contenido de la celda coincide con alguno de los valores filtrados
        values.forEach(value => {
            if (cellText.includes(value.toLowerCase())) {
                match = true;
            }
        });
        
        // Mostrar u ocultar la fila según el filtro
        if (match) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Inicializar eventos de botones
function initButtonEvents() {
    // Botón de exportar
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            window.location.href = '../html/exportar.titular.html';
        });
    }
    
    // Botón de agregar
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            window.location.href = '../html/titular.registrargasto.html';
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

// Función para mostrar mensaje de éxito
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