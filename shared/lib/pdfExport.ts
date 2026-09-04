import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReportEntry {
  id: number;
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
  totalAmount?: number;
  items?: Array<{
    id?: number;
    workName: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

export async function exportReportsToPDF(reports: ReportEntry[]) {
  if (!reports || reports.length === 0) {
    console.warn('Нет данных для экспорта в PDF');
    return;
  }

  // Создаем iframe для изоляции контента от страницы
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;
  doc.open();

  let html = `
    <div style="text-align: center; margin-bottom: 12px;">
      <h1 style="font-size: 14px; color: #1976d2; margin: 0;">Отчеты УралСтройCRM</h1>
      <p style="font-size: 9px; color: #666; margin: 4px 0 0 0;">Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</p>
    </div>
    <hr style="border: 1px solid #ddd; margin-bottom: 10px;">
  `;

  reports.forEach((report, index) => {
    html += `
      <div style="margin-bottom: 12px; page-break-inside: avoid; font-size: 9px;">
        <div style="background: #1976d2; color: white; padding: 5px; border-radius: 3px; margin-bottom: 6px; font-size: 9px;">
          <strong>${report.type === 'цех' ? 'Отчет цеха' : report.type}</strong>
        </div>
        <div style="margin-bottom: 5px; font-size: 9px;">
          <span style="color: #666;">Отчет №${report.id}</span>
          <span style="float: right; color: #666;">Период: ${new Date(report.periodStart).toLocaleDateString('ru-RU')} - ${new Date(report.periodEnd).toLocaleDateString('ru-RU')}</span>
        </div>
        <div style="margin-bottom: 5px; font-size: 9px;">
          <span style="color: #666;">Дата составления: ${new Date(report.date).toLocaleDateString('ru-RU')}</span>
        </div>
        ${report.employeeName ? `<div style="margin-bottom: 5px; font-size: 9px;"><strong>Сотрудник:</strong> ${report.employeeName}</div>` : ''}
        ${report.totalAmount ? `<div style="margin-bottom: 5px; font-size: 9px;"><strong>Заработок:</strong> <span style="color: #2e7d32; font-size: 11px;">${report.totalAmount.toLocaleString('ru-RU')} ₽</span></div>` : ''}
        ${report.items && report.items.length > 0 ? `
          <div style="margin-bottom: 5px; font-size: 9px;">
            <strong>Детализация:</strong>
            <table style="width: 100%; margin-top: 5px; border-collapse: collapse; font-size: 9px;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 4px; border: 1px solid #ddd; text-align: left;">Работа</th>
                  <th style="padding: 4px; border: 1px solid #ddd; text-align: right;">Кол-во</th>
                  <th style="padding: 4px; border: 1px solid #ddd; text-align: right;">Ставка</th>
                  <th style="padding: 4px; border: 1px solid #ddd; text-align: right;">Сумма</th>
                </tr>
              </thead>
              <tbody>
                ${report.items.map(item => `
                  <tr>
                    <td style="padding: 3px; border: 1px solid #ddd;">${item.workName}</td>
                    <td style="padding: 3px; border: 1px solid #ddd; text-align: right;">${item.quantity}</td>
                    <td style="padding: 3px; border: 1px solid #ddd; text-align: right;">${item.rate.toLocaleString('ru-RU')} ₽</td>
                    <td style="padding: 3px; border: 1px solid #ddd; text-align: right;"><strong>${item.amount.toLocaleString('ru-RU')} ₽</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
        ${report.workDone ? `<div style="margin-bottom: 5px; font-size: 9px;"><strong>Выполненные работы:</strong><br>${report.workDone}</div>` : ''}
        ${report.materials ? `<div style="margin-bottom: 5px; font-size: 9px;"><strong>Материалы:</strong><br>${report.materials}</div>` : ''}
        ${report.notes ? `<div style="margin-bottom: 5px; font-size: 9px;"><strong>Примечания:</strong><br>${report.notes}</div>` : ''}
        ${index < reports.length - 1 ? '<hr style="border: 1px solid #eee; margin-top: 10px;">' : ''}
      </div>
    `;
  });

  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @media print {
          @page { margin: 0; size: A4; }
          body { margin: 0; padding: 0; }
        }
      </style>
    </head>
    <body style="font-family: Arial, sans-serif; padding: 20px; background: #fff; color: #000;">
      ${html}
    </body>
    </html>
  `);
  doc.close();

  // Ждем загрузки iframe
  await new Promise(resolve => setTimeout(resolve, 500));

  const iframeBody = iframe.contentDocument?.body;
  if (!iframeBody) {
    console.error('❌ Не удалось получить body iframe');
    document.body.removeChild(iframe);
    return;
  }

  console.log('📄 Iframe content loaded, trying html2canvas...');

  try {
    const canvas = await html2canvas(iframeBody, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      foreignObjectRendering: false,
    });

    console.log('📊 Canvas:', {
      width: canvas.width,
      height: canvas.height,
      isEmpty: canvas.width === 0 || canvas.height === 0,
    });

    const imgData = canvas.toDataURL('image/png');
    
    if (!imgData || imgData.length < 100 || canvas.width === 0 || canvas.height === 0) {
      console.error('❌ html2canvas вернул пустой canvas');
      document.body.removeChild(iframe);
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`reports_${new Date().toISOString().split('T')[0]}.pdf`);
    console.log('✅ PDF saved successfully');
  } catch (error) {
    console.error('❌ Ошибка экспорта в PDF:', error);
  } finally {
    if (iframe.parentNode) {
      document.body.removeChild(iframe);
    }
  }
}

export async function exportSingleReportToPDF(report: ReportEntry) {
  await exportReportsToPDF([report]);
}
