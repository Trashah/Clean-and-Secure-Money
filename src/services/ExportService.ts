import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense } from '../types/expense';
import { Chart } from 'chart.js/auto';

export const exportToPDF = async (expenses: Expense[]) => {
  try {
    // Crear nuevo documento PDF
    const doc = new jsPDF();

    // Configurar el título
    doc.setFontSize(20);
    doc.setTextColor(104, 74, 142); // Color morado del tema
    doc.text('Reporte de Gastos', 14, 20);

    // Configurar la tabla
    const tableColumn = ['Concepto', 'Fecha', 'Método', 'Monto'];
    const tableRows = expenses.map(expense => {
      // Asegurarse de que la fecha sea un objeto Date válido
      let fechaFormateada;
      try {
        const fecha = new Date(expense.fecha);
        fechaFormateada = fecha.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (error) {
        console.error('Error al formatear fecha:', error);
        fechaFormateada = String(expense.fecha);
      }

      return [
        expense.concepto || 'Sin concepto',
        fechaFormateada,
        expense.metodo || 'Sin método',
        `$${expense.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
      ];
    });

    // Agregar la tabla al documento
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30, halign: 'right' }
      },
      headStyles: {
        fillColor: [104, 74, 142],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 30 }
    });

    // Agregar total
    const total = expenses.reduce((sum, expense) => sum + (expense.monto || 0), 0);
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text(`Total: $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 14, finalY);

    // Nueva página para el resumen semanal
    doc.addPage();

    // Título de la sección
    doc.setFontSize(20);
    doc.setTextColor(104, 74, 142);
    doc.text('Resumen Semanal', 14, 20);

    // Filtrar gastos de la última semana
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - 7);
    
    const weeklyExpenses = expenses.filter(expense => 
      new Date(expense.fecha) >= startDate && 
      new Date(expense.fecha) <= now
    );

    // Agrupar gastos por concepto para la gráfica
    const groupedExpenses = weeklyExpenses.reduce((acc, expense) => {
      acc[expense.concepto] = (acc[expense.concepto] || 0) + expense.monto;
      return acc;
    }, {} as Record<string, number>);

    // Crear la gráfica usando Chart.js
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(groupedExpenses),
          datasets: [{
            data: Object.values(groupedExpenses),
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40'
            ]
          }]
        },
        options: {
          responsive: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom'
            }
          }
        }
      });

      // Esperar a que la gráfica se renderice
      await new Promise(resolve => setTimeout(resolve, 100));

      // Convertir la gráfica a imagen y agregarla al PDF (centrada)
      const imageData = canvas.toDataURL('image/png');
      doc.addImage(imageData, 'PNG', 30, 30, 150, 120);

      // Destruir la gráfica para liberar memoria
      chart.destroy();

      // Agregar detalle de gastos semanales debajo de la gráfica
      const weeklyExpensesFormatted = weeklyExpenses.map(expense => {
        const fecha = new Date(expense.fecha);
        return [
          `${fecha.getDate()}`,
          fecha.toLocaleString('es-MX', { month: 'short' }).toUpperCase(),
          expense.concepto,
          expense.metodo,
          `$${expense.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
        ];
      });

      // Agregar la tabla de detalle debajo de la gráfica
      autoTable(doc, {
        head: [['Día', 'Mes', 'Concepto', 'Método', 'Monto']],
        body: weeklyExpensesFormatted,
        startY: 160, // Posición debajo de la gráfica
        styles: {
          fontSize: 10,
          cellPadding: 3,
          overflow: 'linebreak',
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: 20 }, // Día
          1: { cellWidth: 25 }, // Mes
          2: { cellWidth: 'auto' }, // Concepto
          3: { cellWidth: 35 }, // Método
          4: { cellWidth: 35, halign: 'right' } // Monto
        },
        headStyles: {
          fillColor: [104, 74, 142],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      // Agregar total semanal
      const totalSemanal = weeklyExpenses.reduce((sum, expense) => sum + expense.monto, 0);
      const finalYSemanal = (doc as any).lastAutoTable.finalY + 5;
      doc.setFontSize(12);
      doc.setTextColor(104, 74, 142);
      doc.text(`Total Semanal: $${totalSemanal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 14, finalYSemanal);
    }

    // Guardar el PDF
    doc.save('reporte-gastos.pdf');
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error('Error al generar el archivo PDF');
  }
}; 