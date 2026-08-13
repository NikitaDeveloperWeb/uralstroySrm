import jsPDF from 'jspdf';

export interface EstimateItem {
  id?: number;
  name: string;
  quantity: string;
  cost: number;
  category?: string | null;
}

interface EstimatePdfOptions {
  title: string;
  subtitle?: string;
  items: EstimateItem[];
  projectName?: string;
  projectId?: number;
  exportDate?: Date;
}

export function exportEstimateToPDF(options: EstimatePdfOptions) {
  const { title, subtitle, items, projectName, projectId, exportDate = new Date() } = options;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Header
  doc.setFontSize(18);
  doc.setTextColor(25, 118, 210);
  doc.text('УралСтройCRM', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Document title
  doc.setFontSize(14);
  doc.setTextColor(26, 26, 26);
  doc.text(title, pageWidth / 2, y, { align: 'center' });

  // Subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, pageWidth / 2, y + 6, { align: 'center' });
    y += 6;
  }

  // Project info
  if (projectName) {
    y += 5;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Объект: ${projectName}`, margin, y);
    if (projectId) {
      doc.text(`ID: ${projectId}`, pageWidth - margin, y, { align: 'right' });
    }
    y += 6;
  }

  // Export date
  doc.text(
    `Дата экспорта: ${exportDate.toLocaleDateString('ru-RU')}`,
    margin,
    y
  );
  y += 10;

  // Separator
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Table header
  const col1 = margin;
  const col2 = margin + 10; // #
  const col3 = margin + contentWidth * 0.35; // name
  const col4 = margin + contentWidth * 0.55; // category
  const col5 = margin + contentWidth * 0.75; // quantity
  const col6 = margin + contentWidth * 0.90; // cost
  const tableHeaderHeight = 8;

  // Header background
  doc.setFillColor(240, 243, 250);
  doc.rect(col1, y, contentWidth, tableHeaderHeight, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);

  doc.text('#', col2, y + 6);
  doc.text('Наименование', col3, y + 6);
  doc.text('Категория', col4, y + 6);
  doc.text('Кол-во', col5, y + 6, { align: 'center' });
  doc.text('Стоимость (₽)', col6, y + 6, { align: 'right' });
  y += tableHeaderHeight;

  // Separator line
  doc.setDrawColor(220, 220, 220);
  doc.line(col1, y, col1 + contentWidth, y);
  y += 5;

  // Items
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  items.forEach((item, index) => {
    // Check if we need a new page
    if (y > 265) {
      doc.addPage();
      y = 20;
      // Re-draw header
      doc.setFillColor(240, 243, 250);
      doc.rect(col1, y, contentWidth, tableHeaderHeight, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('#', col2, y + 6);
      doc.text('Наименование', col3, y + 6);
      doc.text('Категория', col4, y + 6);
      doc.text('Кол-во', col5, y + 6, { align: 'center' });
      doc.text('Стоимость (₽)', col6, y + 6, { align: 'right' });
      y += tableHeaderHeight;
      doc.setDrawColor(220, 220, 220);
      doc.line(col1, y, col1 + contentWidth, y);
      y += 5;
    }

    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(col1, y - 4, contentWidth, 6, 'F');
    }

    doc.setTextColor(40, 40, 40);
    doc.text(String(index + 1), col2, y);
    doc.setFont('helvetica', 'bold');
    doc.text(item.name, col3, y);
    doc.setFont('helvetica', 'normal');
    doc.text(item.category || '—', col4, y);
    doc.text(item.quantity, col5, y, { align: 'center' });
    doc.text(item.cost.toLocaleString('ru-RU'), col6, y, { align: 'right' });
    y += 6;
  });

  // Total separator
  y += 3;
  doc.setDrawColor(25, 118, 210);
  doc.setLineWidth(0.5);
  doc.line(col1, y, col1 + contentWidth, y);
  y += 6;

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(25, 118, 210);
  const totalCost = items.reduce((sum, item) => sum + (item.cost || 0), 0);
  doc.text('ИТОГО:', col3, y);
  doc.text(`${totalCost.toLocaleString('ru-RU')} ₽`, col6, y, { align: 'right' });
  y += 12;

  // Footer note
  if (items.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Нет данных для отображения', pageWidth / 2, y, { align: 'center' });
  }

  // Page footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Страница ${i} из ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'УралСтройCRM — Смета',
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  const fileName = `смета_${projectName ? projectName.replace(/\s+/g, '_') : 'project'}_${exportDate.toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
