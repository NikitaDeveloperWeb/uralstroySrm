import html2canvas from 'html2canvas';
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

function extractNumber(str: string): number {
  const match = String(str).match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

const ITEMS_PER_PAGE = 12;

export async function exportEstimateToPDF(options: EstimatePdfOptions) {
  const { title, subtitle, items, projectName, projectId, exportDate = new Date() } = options;

  if (!items || items.length === 0) {
    console.warn('Нет данных для экспорта в PDF');
    return;
  }

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const pdf = new jsPDF('p', 'mm', 'a4');

  for (let page = 0; page < totalPages; page++) {
    const startIdx = page * ITEMS_PER_PAGE;
    const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, items.length);
    const pageItems = items.slice(startIdx, endIdx);

    const pageTotalCost = pageItems.reduce((sum, item) => {
      const qty = extractNumber(item.quantity);
      const price = item.cost || 0;
      return sum + Math.round(qty * price * 100) / 100;
    }, 0);

    const grandTotal = items.reduce((sum, item) => {
      const qty = extractNumber(item.quantity);
      const price = item.cost || 0;
      return sum + Math.round(qty * price * 100) / 100;
    }, 0);

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
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background: #fff;
            color: #333;
            font-size: 7px;
            line-height: 1.1;
            padding: 8px 8px 15px 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 7px;
          }
          thead th {
            background: #1976d2;
            color: #fff;
            padding: 2px 5px;
            text-align: left;
            font-weight: 600;
            font-size: 6px;
            border: none;
          }
          tbody td {
            padding: 2px 5px;
            border-bottom: 0.5px solid #e0e0e0;
          }
          tbody tr:nth-child(even) { background: #f9f9f9; }
          tbody td:nth-child(1) { text-align: center; width: 3%; color: #666; }
          tbody td:nth-child(2) { font-weight: 500; }
          tbody td:nth-child(3) { color: #666; font-size: 6px; }
          tbody td:nth-child(4) { text-align: center; width: 10%; }
          tbody td:nth-child(5) { text-align: right; width: 16%; }
          tbody td:nth-child(6) { text-align: right; width: 16%; font-weight: 600; color: #1976d2; }
          .footer {
            border-top: 1px solid #1976d2;
            padding-top: 3px;
            text-align: right;
            font-size: 8px;
            font-weight: 700;
            color: #1976d2;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th style="width: 3%;">№</th>
              <th>Наименование</th>
              <th style="width: 12%;">Категория</th>
              <th style="width: 10%; text-align: center;">Кол-во</th>
              <th style="width: 16%; text-align: right;">Цена, ₽</th>
              <th style="width: 16%; text-align: right;">Сумма, ₽</th>
            </tr>
          </thead>
          <tbody>
            ${pageItems.map((item, index) => {
              const globalIndex = startIdx + index + 1;
              const qty = extractNumber(item.quantity);
              const price = item.cost || 0;
              const amount = Math.round(qty * price * 100) / 100;
              return `
              <tr>
                <td>${globalIndex}</td>
                <td>${item.name}</td>
                <td>${item.category || '—'}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${price.toLocaleString('ru-RU')}</td>
                <td style="text-align: right;">${amount.toLocaleString('ru-RU')}</td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        <div class="footer">${page === totalPages - 1 ? 'ИТОГО: ' + grandTotal.toLocaleString('ru-RU') + ' ₽' : 'Стр. ' + (page + 1) + ' из ' + totalPages}</div>
      </body>
      </html>
    `);
    doc.close();

    await new Promise(resolve => setTimeout(resolve, 500));

    const iframeBody = iframe.contentDocument?.body;
    if (!iframeBody) {
      console.error('❌ Не удалось получить body iframe');
      document.body.removeChild(iframe);
      continue;
    }

    try {
      const canvas = await html2canvas(iframeBody, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        foreignObjectRendering: true,
      });

      const imgData = canvas.toDataURL('image/png');

      if (imgData && imgData.length > 100 && canvas.width > 0 && canvas.height > 0) {
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const margin = 10;
        const imgWidth = pdfWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const offsetY = margin;

        if (page > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'PNG', margin, offsetY, imgWidth, imgHeight);
      }
    } catch (error) {
      console.error('❌ Ошибка экспорта страницы:', error);
    } finally {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    }
  }

  const fileName = `смета_${projectName ? projectName.replace(/\s+/g, '_') : 'project'}_${exportDate.toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
  console.log('✅ PDF saved successfully');
}
