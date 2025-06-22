import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

// Utility function to generate a PDF of all debts for a customer
export async function generateCustomerDebtsPdf(allDebtsResponse: any, customerName: string) {
  try {
    const allDebts = allDebtsResponse.content || allDebtsResponse;
    const total = allDebts.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
    // Build minimal HTML for PDF: S.No, Description, Amount, and total
    const html = `
      <html>
      <head><meta charset='utf-8'><style>
        body { font-family: Times New Roman, serif; font-size: 13px; color: #000; background: #fff; }
        table { width: 100%; border-collapse: collapse; margin-top: 18px; }
        th, td { border: 1px solid #000; padding: 5px 8px; text-align: left; background: #fff; color: #000; }
        th { font-weight: bold; }
        .total-row td { font-weight: bold; border-top: 2px solid #000; }
      </style></head>
      <body>
        <div style="font-size:16px;font-weight:bold;margin-bottom:10px;">Debts Report for ${customerName}</div>
        <table>
          <thead>
            <tr><th>S.No</th><th>Description</th><th>Amount</th></tr>
          </thead>
          <tbody>
            ${allDebts.map((d: any) => `
              <tr>
                <td>${d.serialNumber}</td>
                <td>${d.description}</td>
                <td>₹${d.amount}</td>
              </tr>
            `).join('')}
            <tr class='total-row'>
              <td colspan='2'>Total Amount</td>
              <td>₹${total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;
    const { uri } = await Print.printToFileAsync({ html });
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  } catch (e) {
    throw new Error('Failed to generate PDF');
  }
}
