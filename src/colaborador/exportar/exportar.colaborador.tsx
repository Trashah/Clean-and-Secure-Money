import React from 'react';
import './exportar.colaborador.css';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart } from 'chart.js';

// Definición de colores para la gráfica
const COLORS = [
  '#FF6384', // Rosa
  '#36A2EB', // Azul
  '#FFCE56', // Amarillo
  '#4BC0C0', // Verde agua
  '#9966FF', // Morado
  '#FF9F40', // Naranja
  '#B2EBF2', // Celeste
  '#FFCCBC', // Salmón
  '#C5CAE9', // Lavanda
  '#F8BBD0'  // Rosa claro
];

interface ExportarColaboradorProps {
  data: any[];
  onClose: () => void;
  periodo?: string;
  chartRef?: React.RefObject<any>;
  totalAmount: number;
}

interface Expense {
  concepto: string;
  fecha: string;
  metodo: string;
  monto: number;
  id: string;
  userId: string;
}

type GroupedExpenses = { [key: string]: number };

export default function ExportarColaborador({ 
  data, 
  onClose, 
  periodo = '', 
  chartRef,
  totalAmount 
}: ExportarColaboradorProps) {
  const handleExportExcel = () => {
    if (data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    try {
      // Crear un nuevo libro de trabajo
      const wb = XLSX.utils.book_new();

      // Preparar los datos del resumen
      const resumenData = [
        ['Resumen de Gastos'],
        [`Período: ${periodo}`],
        [`Total: $${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
        [],
        ['Distribución por Concepto'],
      ];

      // Agrupar gastos por concepto para el resumen
      const groupedExpenses = data.reduce((acc: GroupedExpenses, expense: Expense) => {
        acc[expense.concepto] = (acc[expense.concepto] || 0) + expense.monto;
        return acc;
      }, {});

      // Añadir los datos agrupados al resumen
      Object.entries<number>(groupedExpenses).forEach(([concepto, monto]) => {
        resumenData.push([
          concepto,
          `$${monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
        ]);
      });

      // Crear hoja de resumen
      const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      // Preparar los datos detallados
      const detalleData = data.map((expense: Expense) => ({
        Concepto: expense.concepto,
        Fecha: new Date(expense.fecha).toLocaleDateString('es-MX'),
        Método: expense.metodo,
        Monto: `$${expense.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
      }));

      // Crear hoja de detalle
      const wsDetalle = XLSX.utils.json_to_sheet(detalleData);
      XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle');

      // Generar el archivo y descargarlo
      const fileName = `gastos_${periodo.toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      onClose();
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      alert('Error al generar el archivo Excel. Por favor, intenta de nuevo.');
    }
  };

  const handleExportPDF = async () => {
    if (data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Configurar fuente para soportar caracteres especiales
      doc.setFont("helvetica");
      
      // Título principal
      doc.setFontSize(20);
      doc.setTextColor(74, 20, 140);
      doc.text('Reporte de Gastos', 14, 20);
      
      // Subtítulo con el período
      doc.setFontSize(12);
      doc.setTextColor(102, 102, 102);
      doc.text(`Período: ${periodo}`, 14, 30);

      // Añadir la gráfica si está disponible
      if (chartRef?.current) {
        const canvas = chartRef.current.canvas;
        const chartImage = canvas.toDataURL('image/png', 1.0);
        // Ajustar las dimensiones para mantener la forma circular
        const chartSize = 100; // Tamaño fijo para mantener proporción
        doc.addImage(chartImage, 'PNG', 55, 40, chartSize, chartSize);

        // Añadir el total debajo de la gráfica centrado
        doc.setFontSize(14);
        doc.setTextColor(74, 20, 140);
        const totalText = `Total: $${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
        const totalTextWidth = doc.getTextWidth(totalText);
        doc.text(totalText, (210 - totalTextWidth) / 2, 150);

        // Añadir distribución por concepto con mejor formato
        doc.setFontSize(12);
        doc.setTextColor(74, 20, 140);
        doc.text('Distribución por Concepto:', 14, 165);

        const groupedExpenses = data.reduce((acc: GroupedExpenses, expense: Expense) => {
          acc[expense.concepto] = (acc[expense.concepto] || 0) + expense.monto;
          return acc;
        }, {});

        let yPos = 175;
        const entries = Object.entries<number>(groupedExpenses);
        const porcentajes = entries.map(([_, monto]) => (monto / totalAmount) * 100);

        entries.forEach(([concepto, monto], index) => {
          const porcentaje = porcentajes[index].toFixed(1);
          const montoFormateado = monto.toLocaleString('es-MX', { minimumFractionDigits: 2 });
          const texto = `${concepto}: $${montoFormateado} (${porcentaje}%)`;
          
          // Agregar un punto de color antes del texto
          doc.setFillColor(COLORS[index % COLORS.length]);
          doc.circle(20, yPos - 1, 2, 'F');
          
          doc.text(texto, 25, yPos);
          yPos += 8;
        });

        // Tabla de detalle en nueva página
        doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(74, 20, 140);
        doc.text('Detalle de Gastos', 14, 20);
      }
      
      // Preparar los datos para la tabla
      const tableColumn = ["Concepto", "Fecha", "Método", "Monto"];
      const tableRows = data.map((expense: Expense) => [
        expense.concepto,
        new Date(expense.fecha).toLocaleDateString('es-MX'),
        expense.metodo,
        `$${expense.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
      ]);

      // Añadir la tabla
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: chartRef?.current ? 40 : 40,
        styles: { 
          fontSize: 10,
          font: "helvetica"
        },
        headStyles: { 
          fillColor: [74, 20, 140],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 50 }, // Concepto
          1: { cellWidth: 35 }, // Fecha
          2: { cellWidth: 35 }, // Método
          3: { cellWidth: 35 }  // Monto
        },
        margin: { top: 40 }
      });

      // Generar el archivo
      const fileName = `gastos_${periodo.toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      onClose();
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="export-modal">
      <div className="export-modal-content">
        <div className="export-header">
          <h2>Exportar en:</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="export-options">
          <div 
            className="export-option excel" 
            role="button" 
            tabIndex={0} 
            onClick={handleExportExcel}
            aria-label="Exportar a Excel"
          >
            <div className="export-icon">
              <img src="/pictures/excel-icon.png" alt="Excel" />
            </div>
            <span>Excel</span>
          </div>
          <div 
            className="export-option pdf" 
            role="button" 
            tabIndex={0} 
            onClick={handleExportPDF}
            aria-label="Exportar a PDF"
          >
            <div className="export-icon">
              <img src="/pictures/pdf-icon.png" alt="PDF" />
            </div>
            <span>PDF</span>
          </div>
        </div>
      </div>
    </div>
  );
}
