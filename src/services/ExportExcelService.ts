import * as XLSX from 'xlsx';
import { Expense } from '../types/expense';

export const exportToExcel = async (expenses: Expense[]) => {
  try {
    // Preparar los datos para Excel
    const worksheetData = expenses.map(expense => ({
      'Concepto': expense.concepto || '',
      'Fecha': formatDate(expense.fecha),
      'Método de Pago': expense.metodo || '',
      'Monto': expense.monto
    }));

    // Calcular el total
    const total = expenses.reduce((sum, expense) => sum + (expense.monto || 0), 0);

    // Agregar una fila en blanco y el total
    worksheetData.push({
      'Concepto': '',
      'Fecha': '',
      'Método de Pago': '',
      'Monto': 0
    }, {
      'Concepto': '',
      'Fecha': '',
      'Método de Pago': 'Total:',
      'Monto': total
    });

    // Crear un nuevo libro de trabajo
    const workbook = XLSX.utils.book_new();

    // Crear la hoja de gastos
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Agregar la hoja de gastos al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Gastos');

    // Preparar hoja de resumen semanal
    // Filtrar gastos de la última semana
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - 7);
    
    const weeklyExpenses = expenses.filter(expense => 
      new Date(expense.fecha) >= startDate && 
      new Date(expense.fecha) <= now
    );

    // Preparar los datos del resumen
    const summaryData: any[] = [
      ['Resumen Semanal'], // Título
      [], // Fila vacía
      ['Detalle de Gastos por Concepto'], // Subtítulo para el resumen
      ['Concepto', 'Monto', 'Porcentaje'], // Encabezados
    ];

    // Agrupar gastos por concepto
    const groupedExpenses = weeklyExpenses.reduce((acc, expense) => {
      acc[expense.concepto] = (acc[expense.concepto] || 0) + expense.monto;
      return acc;
    }, {} as Record<string, number>);

    const totalSemanal = Object.values(groupedExpenses).reduce((a, b) => a + b, 0);

    // Agregar datos del resumen
    Object.entries(groupedExpenses).forEach(([concepto, monto]) => {
      summaryData.push([
        concepto,
        monto,
        (monto / totalSemanal * 100).toFixed(2) + '%'
      ]);
    });

    // Agregar total del resumen
    summaryData.push(
      [], // Fila vacía
      ['Total Semanal:', totalSemanal, '100%']
    );

    // Agregar espacio y detalle de gastos
    summaryData.push(
      [], // Fila vacía
      [], // Fila vacía
      ['Detalle de Gastos'], // Subtítulo para el detalle
      ['Día', 'Mes', 'Concepto', 'Método', 'Monto'] // Encabezados
    );

    // Agregar gastos detallados
    weeklyExpenses.forEach(expense => {
      const fecha = new Date(expense.fecha);
      summaryData.push([
        fecha.getDate(),
        fecha.toLocaleString('es-MX', { month: 'short' }).toUpperCase(),
        expense.concepto,
        expense.metodo,
        expense.monto
      ]);
    });

    // Crear la hoja de resumen
    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);

    // Ajustar estilos (ancho de columnas)
    const colWidths = [
      { wch: 20 }, // A
      { wch: 15 }, // B
      { wch: 15 }, // C
      { wch: 15 }, // D
      { wch: 15 }  // E
    ];
    summaryWorksheet['!cols'] = colWidths;

    // Agregar la hoja de resumen al libro
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen Semanal');

    // Generar el archivo y descargarlo
    XLSX.writeFile(workbook, 'reporte-gastos.xlsx');
  } catch (error) {
    console.error('Error al generar Excel:', error);
    throw new Error('Error al generar el archivo Excel');
  }
};

const formatDate = (date: string | Date): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return String(date);
  }
}; 