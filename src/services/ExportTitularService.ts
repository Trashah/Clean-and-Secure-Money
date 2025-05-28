import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Gasto {
  concepto: string;
  fecha: string;
  metodo: string;
  monto: number;
  usuario: string;
  rol: string;
}

interface ExpenseReport {
  gastos: Gasto[];
  columns: { header: string; key: string; }[];
}

export const exportTitularToPDF = (data: ExpenseReport) => {
  try {
    // Crear nuevo documento PDF
    const doc = new jsPDF();

    // Configurar el título principal
    doc.setFontSize(24);
    doc.setTextColor(104, 74, 142);
    doc.text('Reporte de Gastos Familiar', 14, 20);

    // Preparar los datos para la tabla
    const tableColumn = data.columns.map(col => col.header);
    const tableRows = data.gastos.map(gasto => [
      gasto.concepto || 'Sin concepto',
      formatDate(gasto.fecha),
      gasto.metodo || 'Sin método',
      formatMoney(gasto.monto),
      gasto.usuario || 'Usuario no disponible',
      gasto.rol || 'No especificado'
    ]);

    // Configurar y generar la tabla
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
        0: { cellWidth: 'auto' }, // Concepto
        1: { cellWidth: 25 },     // Fecha
        2: { cellWidth: 25 },     // Método
        3: { cellWidth: 25 },     // Monto
        4: { cellWidth: 40 },     // Usuario
        5: { cellWidth: 25 }      // Rol
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

    // Calcular y mostrar el total
    const total = data.gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(104, 74, 142);
    doc.text(`Total General: ${formatMoney(total)}`, 14, finalY);

    // Agregar fecha de generación
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generado el: ${formatDate(new Date().toISOString())}`, 14, doc.internal.pageSize.height - 10);

    // Descargar el PDF
    doc.save('reporte-gastos-familiar.pdf');
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error('Error al generar el PDF. Por favor, intenta de nuevo.');
  }
};

// Funciones auxiliares
const formatDate = (date: string): string => {
  try {
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return String(date);
  }
};

const formatMoney = (amount: number): string => {
  return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}; 