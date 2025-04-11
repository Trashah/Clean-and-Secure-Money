// Inicialización del gráfico
document.addEventListener('DOMContentLoaded', function() {
    inicializarGrafico();
    configurarBotones();
    
});

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

// Función para inicializar el gráfico circular
function inicializarGrafico() {
    const ctx = document.getElementById('expensesChart').getContext('2d');
    
    // Datos para el gráfico
    const data = {
        labels: ['Videojuegos', 'Comida', 'Renta', 'Luz', 'Agua'],
        datasets: [{
            data: [400, 250, 800, 200, 200],
            backgroundColor: [
                '#FFA726', // Naranja - Videojuegos
                '#66BB6A', // Verde - Comida
                '#42A5F5', // Azul - Renta
                '#EC407A', // Rosa - Luz
                '#7E57C2'  // Púrpura - Agua
            ],
            borderWidth: 0,
            hoverOffset: 10
        }]
    };
    
    // Configuración del gráfico
    const config = {
        type: 'doughnut',
        data: data,
        options: {
            cutout: '70%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            let value = context.raw || 0;
                            let total = context.dataset.data.reduce((a, b) => a + b, 0);
                            let percentage = Math.round((value / total) * 100);
                            return `${label}: $${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };
    
    // Crear el gráfico
    const myChart = new Chart(ctx, config);
}

// Configurar interacciones de botones
function configurarBotones() {
    // Botones de filtro
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Quitar clase activa de todos los botones
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Agregar clase activa al botón clickeado
            this.classList.add('active');
            
            // Aquí se implementaría la lógica para filtrar los gastos
            const filtro = this.textContent.trim().toLowerCase();
            filtrarGastos(filtro);
        });
    });
    
    // Botón de exportar
    const exportBtn = document.querySelector('.export-btn');
    exportBtn.addEventListener('click', function() {
        exportarDatos();
    });
    
    // Botón de agregar gasto
    const addBtn = document.querySelector('.add-btn');
    addBtn.addEventListener('click', function() {
        abrirFormularioNuevoGasto();
    });
}

// Función para filtrar gastos según el período seleccionado
function filtrarGastos(periodo) {
    console.log('Filtrando por período:', periodo);
    
    // Esta función se implementaría con datos reales
    // Aquí solo es un ejemplo de la estructura
    
    // Simulación de datos para diferentes períodos
    let nuevosDatos;
    let nuevoTotal;
    
    switch(periodo) {
        case 'semanal':
            nuevosDatos = [400, 250, 800, 200, 200];
            nuevoTotal = 1850;
            break;
        case 'mensual':
            nuevosDatos = [1200, 1800, 3200, 400, 400];
            nuevoTotal = 7000;
            break;
        case 'anual':
            nuevosDatos = [5000, 9600, 38400, 2400, 1800];
            nuevoTotal = 57200;
            break;
    }
    
    // Actualizar el gráfico con los nuevos datos
    actualizarGrafico(nuevosDatos);
    
    // Actualizar el total mostrado
    document.querySelector('.chart-center-text h3').textContent = '$' + formatearNumero(nuevoTotal);
    
    // Actualizar la lista de gastos según el período
    actualizarListaGastos(periodo);
}

// Función para actualizar el gráfico con nuevos datos
function actualizarGrafico(nuevosDatos) {
    const chart = Chart.getChart('expensesChart');
    if (chart) {
        chart.data.datasets[0].data = nuevosDatos;
        chart.update();
        
        // Actualizar porcentajes en la leyenda
        const total = nuevosDatos.reduce((a, b) => a + b, 0);
        const porcentajes = document.querySelectorAll('.percentage');
        
        porcentajes.forEach((el, index) => {
            const porcentaje = Math.round((nuevosDatos[index] / total) * 100);
            el.textContent = porcentaje + '%';
        });
    }
}

// Función para actualizar la lista de gastos
function actualizarListaGastos(periodo) {
    // En una implementación real, aquí se cargarían datos del servidor
    // Para este ejemplo, solo mostramos un mensaje en consola
    console.log('Actualizando lista de gastos para el período', periodo);
}

// Función para exportar datos
function exportarDatos() {
    alert('Exportando datos en formato CSV...');
    // Aquí iría la lógica para generar y descargar un archivo CSV
}

// Función para abrir el formulario de nuevo gasto
function abrirFormularioNuevoGasto() {
    window.location.href = '../html/individual.registrargasto.html';
}

// Función para cambiar entre páginas
function cambiarPagina(pagina) {
    switch(pagina) {
        case 'gastos':
            window.location.href = '../html/individual.inicio.html';
            break;
        case 'resumen':
            // Ya estamos en esta página
            break;
        case 'conceptos':
            window.location.href = '../html/individual.cl.html';
            break;
    }
}

// Función auxiliar para formatear números con separadores de miles
function formatearNumero(numero) {
    return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
} 