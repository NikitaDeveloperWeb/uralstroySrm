import jsPDF from 'jspdf';
import type { ReportEntry } from '@/app/reports/page';

interface ReportExportData {
  type: string;
  date: string;
  periodStart: string;
  periodEnd: string;
  workDone: string;
  materials: string;
  notes: string;
  employeeName?: string;
  employeePaymentType?: string;
  hours?: number;
  squareMeters?: {
    сосна: number;
    липа: number;
    утепление: number;
    каркасы: number;
    стропила: number;
    обшивкаСтропил: number;
  };
}

const typeLabels: Record<string, string> = {
  цех: 'Отчет цеха',
  монтаж: 'Отчет монтажа',
  склад: 'Отчет складлера',
};

const typeColors: Record<string, [number, number, number]> = {
  цех: [59, 130, 246],
  монтаж: [147, 51, 234],
  склад: [34, 197, 94],
};

export function exportReportsToPDF(reports: ReportEntry[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(26, 26, 26);
  doc.text('Отчеты УралСтройCRM', pageWidth / 2, y, { align: 'center' });
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Дата формирования: ${new Date().toLocaleDateString('ru-RU')}`, pageWidth / 2, y, { align: 'center' });
  
  y += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  reports.forEach((report, index) => {
    // Check if we need a new page
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Report header with color
    const color = typeColors[report.type] || [150, 150, 150];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(typeLabels[report.type] || report.type, margin + 5, y + 7);
    y += 15;

    // Report number
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`Отчет №${report.id}`, pageWidth - margin, y, { align: 'right' });
    y += 8;

    // Period
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Период:`, margin, y);
    doc.setTextColor(40, 40, 40);
    doc.text(
      `${new Date(report.periodStart).toLocaleDateString('ru-RU')} - ${new Date(report.periodEnd).toLocaleDateString('ru-RU')}`,
      margin + 25,
      y
    );
    y += 7;

    // Date
    doc.setTextColor(60, 60, 60);
    doc.text(`Дата составления:`, margin, y);
    doc.setTextColor(40, 40, 40);
    doc.text(new Date(report.date).toLocaleDateString('ru-RU'), margin + 40, y);
    y += 10;

    // Employee (if цех)
    if (report.type === 'цех' && report.employeeName) {
      doc.setTextColor(60, 60, 60);
      doc.text(`Сотрудник:`, margin, y);
      doc.setTextColor(40, 40, 40);
      doc.text(report.employeeName, margin + 25, y);
      y += 7;
      
      if (report.employeePaymentType === 'сдельная') {
        // Square meters for piece rate
        if (report.squareMeters) {
          const m = report.squareMeters;
          const values = [
            { label: 'Сосна', value: m.сосна },
            { label: 'Липа', value: m.липа },
            { label: 'Утепление', value: m.утепление },
            { label: 'Каркасы', value: m.каркасы },
            { label: 'Стропила', value: m.стропила },
            { label: 'Обшивка стропил', value: m.обшивкаСтропил },
          ].filter(item => item.value > 0);

          if (values.length > 0) {
            doc.setTextColor(60, 60, 60);
            doc.text(`Квадратура (м²):`, margin, y);
            y += 6;
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(9);
            values.forEach((item, i) => {
              if (y > 270) {
                doc.addPage();
                y = 20;
              }
              doc.text(`• ${item.label}: ${item.value} м²`, margin + 5, y);
              y += 5;
            });
            doc.setFontSize(10);
            y += 3;
          }
        }

        // Calculate earnings
        const workTypeRates: Record<string, number> = {
          сосна: 350,
          липа: 400,
          утепление: 400,
          каркасы: 1000,
          стропила: 900,
          обшивкаСтропил: 300,
        };
        let total = 0;
        if (report.squareMeters) {
          for (const [key, value] of Object.entries(report.squareMeters)) {
            total += value * (workTypeRates[key] || 0);
          }
        }
        if (total > 0) {
          doc.setTextColor(34, 197, 94);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Заработок: ${total.toLocaleString('ru-RU')} ₽`, margin, y);
          doc.setFont('helvetica', 'normal');
          y += 10;
        }
      } else if (report.employeePaymentType === 'сменная' && report.hours) {
        const dailyRate = 2000;
        const earnings = report.hours * dailyRate;
        
        doc.setTextColor(60, 60, 60);
        doc.text(`Часов: ${report.hours}`, margin, y);
        y += 7;
        
        doc.setTextColor(34, 197, 94);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Заработок: ${earnings.toLocaleString('ru-RU')} ₽`, margin, y);
        doc.setFont('helvetica', 'normal');
        y += 10;
      }
    }

    // Work done
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Выполненные работы:', margin, y);
    doc.setFont('helvetica', 'normal');
    y += 7;
    doc.setTextColor(40, 40, 40);
    
    const workLines = doc.splitTextToSize(report.workDone, contentWidth - 10);
    workLines.forEach((line: string) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin + 5, y);
      y += 5;
    });
    y += 5;

    // Materials
    if (report.materials) {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'bold');
      doc.text('Материалы:', margin, y);
      doc.setFont('helvetica', 'normal');
      y += 7;
      doc.setTextColor(40, 40, 40);
      
      const matLines = doc.splitTextToSize(report.materials, contentWidth - 10);
      matLines.forEach((line: string) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin + 5, y);
        y += 5;
      });
      y += 5;
    }

    // Notes
    if (report.notes) {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'bold');
      doc.text('Примечания:', margin, y);
      doc.setFont('helvetica', 'normal');
      y += 7;
      doc.setTextColor(40, 40, 40);
      
      const noteLines = doc.splitTextToSize(report.notes, contentWidth - 10);
      noteLines.forEach((line: string) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin + 5, y);
        y += 5;
      });
      y += 5;
    }

    // Separator
    if (index < reports.length - 1) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 15;
    }
  });

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Страница ${i} из ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'УралСтройCRM',
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  doc.save(`reports_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportSingleReportToPDF(report: ReportEntry) {
  exportReportsToPDF([report]);
}
