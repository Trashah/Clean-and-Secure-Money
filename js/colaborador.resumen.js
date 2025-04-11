document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la página
    initPage();
    
    // Configurar los escuchadores de eventos
    setupEventListeners();
    
    // Mostrar datos iniciales
    renderData();
});

function initPage() {
    // Inicialización de componentes visuales
    initChart();
}

function setupEventListeners() {
    // Configurar eventos para los tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            console.log('Tab clickeado:', this.textContent); // Debug
            // Si el tab no está activo, redirigir a la página correspondiente
            if (!this.classList.contains('active')) {
                if (this.textContent === "Tus gastos") {
                    window.location.href = '../html/colaborador.inicio.html';
                }
            }
        });
    });

    // Configurar evento para el botón de regreso
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = '../html/colaborador.inicio.html';
        });
    }

    // Configurar eventos para los filtros
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', applyFilters);
    });

    // Configurar evento para el botón flotante de exportar
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            window.location.href = '../html/exportar.colaborador.html';
        });
    }

    // Configurar evento para el botón flotante de añadir
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            console.log('Redirigir a la página de registro de gastos del colaborador');
            // Implementar la redirección cuando se cree la página
        });
    }
}

function initChart() {
    // Crear el gráfico circular
    const ctx = document.getElementById('gastos-chart').getContext('2d');

    const gastosChart = new Chart(ctx, {
        type: 'pie', // Tipo de gráfico circular
        data: {
            labels: ['Alimentos', 'Transporte', 'Entretenimiento', 'Otros'], // Etiquetas de cada segmento
            datasets: [{
                data: [50, 30, 15, 5], // Los valores de cada segmento
                backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33A1'], // Colores de los segmentos
                borderColor: '#fff', // Color de borde de los segmentos
                borderWidth: 2, // Ancho del borde
            }]
        },
        options: {
            responsive: true, // Hace que el gráfico sea responsivo
            plugins: {
                legend: {
                    position: 'top', // Posición de la leyenda
                },
            },
        }
    });
}

function applyFilters() {
    // Lógica para aplicar filtros a la tabla
    console.log('Aplicando filtros...');

    // Obtener los valores seleccionados
    const period = document.getElementById('period-filter').value;
    const category = document.getElementById('category-filter').value;

    console.log(`Filtros: Periodo=${period}, Categoría=${category}`);

    // Aquí iría la lógica para filtrar los datos y actualizar la tabla
    // Por ahora solo actualizamos el resumen con valores simulados
    updateSummary(period, category);
}

function updateSummary(period, category) {
    // Actualizar el resumen con datos filtrados simulados
    const spentAmount = document.querySelector('.spent-amount');
    const comparedPercent = document.querySelector('.compared-percent');
    
    // Valores simulados según los filtros
    let amount, percent, trend;
    
    if (period === 'month') {
        amount = '$ 1,250.00';
        percent = '12%';
        trend = 'up';
    } else if (period === 'week') {
        amount = '$ 350.00';
        percent = '5%';
        trend = 'down';
    } else {
        amount = '$ 75.00';
        percent = '8%';
        trend = 'up';
    }
    
    if (category !== 'all') {
        // Ajustar los valores si se selecciona una categoría específica
        amount = `$ ${(parseFloat(amount.replace(/[$,]/g, '')) * 0.7).toFixed(2)}`;
        percent = `${parseInt(percent) - 2}%`;
    }
    
    spentAmount.textContent = amount;
    comparedPercent.textContent = percent;
    
    // Actualizar icono de tendencia
    const trendIcon = document.querySelector('.trend-icon');
    if (trendIcon) {
        trendIcon.className = 'trend-icon';
        trendIcon.classList.add(trend === 'up' ? 'trend-up' : 'trend-down');
        trendIcon.innerHTML = trend === 'up' ? '↑' : '↓';
    }
    
    // Actualizar la tabla con datos simulados filtrados
    refreshTable(period, category);
}

function refreshTable(period, category) {
    // Actualizar la tabla de gastos según los filtros
    const tableRows = document.querySelectorAll('.table-row');
    
    // Simulación simple de filtrado mostrando/ocultando filas aleatoriamente
    tableRows.forEach((row, index) => {
        const shouldShow = Math.random() > 0.3; // 70% de probabilidad de mostrar una fila
        row.style.display = shouldShow ? 'flex' : 'none';
    });
}

function renderData() {
    // Renderizar los datos iniciales
    updateSummary('week', 'all');
}
