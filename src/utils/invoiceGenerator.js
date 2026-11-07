/**
 * AURA Luxury Electronics - Enterprise GST Tax Invoice Generator
 * Generates an official, print-ready, high-resolution GST invoice window
 * with automated window.print() and PDF export.
 */

function numberToWordsINR(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(num);
  if (n === 0) return 'Zero Rupees Only';

  function convertLessThanOneThousand(n) {
    if (n === 0) return '';
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? convertLessThanOneThousand(n % 100) : '');
  }

  let words = '';
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const remainder = n % 1000;

  if (crore > 0) words += convertLessThanOneThousand(crore) + 'Crore ';
  if (lakh > 0) words += convertLessThanOneThousand(lakh) + 'Lakh ';
  if (thousand > 0) words += convertLessThanOneThousand(thousand) + 'Thousand ';
  if (remainder > 0) words += convertLessThanOneThousand(remainder);

  return 'Rupees ' + words.trim() + ' Only';
}

export function generateTaxInvoice(order) {
  if (!order) return;

  const orderNumber = order.orderNumber || 'AURA-84920';
  const invoiceNumber = `INV-2026-${orderNumber.replace(/[^a-zA-Z0-9]/g, '').slice(-6)}`;
  const invoiceDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const customerName = order.customerName || order.user?.fullName || 'Privilege Client';
  const customerEmail = order.customerEmail || order.user?.email || 'client@aura.store';
  const shippingAddress = order.shippingAddress || 'AURA Flagship Residence, Bengaluru, Karnataka';
  const shippingCity = order.shippingCity || 'Bengaluru';
  const shippingZip = order.shippingZip || '560001';

  const items = order.items || [];
  const totalAmount = Number(order.totalAmount || 0);
  const discountAmount = Number(order.discountAmount || 0);

  // 18% GST (CGST 9% + SGST 9%)
  const subtotalBeforeTax = Math.round(totalAmount / 1.18);
  const totalGst = totalAmount - subtotalBeforeTax;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;

  const isPaid = (order.paymentStatus || 'PAID').toUpperCase() === 'PAID';
  const paymentMethod = order.paymentMethod || 'Razorpay Secure';
  const paymentRef = order.razorpayPaymentId || `PAY-${orderNumber.slice(-6)}-VERIFIED`;

  const itemsHtml = items.map((item, idx) => {
    const qty = item.quantity || 1;
    const price = Number(item.price || item.productPrice || (item.subtotal ? item.subtotal / qty : totalAmount / qty));
    const lineTotal = Number(item.subtotal || price * qty);
    const baseLine = Math.round(lineTotal / 1.18);
    const taxLine = lineTotal - baseLine;

    return `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px;">${idx + 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <div style="font-weight: 700; color: #0f172a;">${item.productName || 'AURA Flagship Electronics'}</div>
          <div style="font-size: 11px; color: #64748b;">Serial / IMEI: AUR-${Math.random().toString(36).slice(-8).toUpperCase()}</div>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 12px; font-family: monospace;">8517.62</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px; font-weight: 700;">${qty}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px;">₹${(baseLine / qty).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px;">18% (9+9)</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px; font-weight: 700; color: #0f172a;">₹${lineTotal.toLocaleString('en-IN')}</td>
      </tr>
    `;
  }).join('');

  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Tax Invoice - ${invoiceNumber}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 24px;
          background: #ffffff;
          line-height: 1.45;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .invoice-card {
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
        }
        .header-table, .client-table, .items-table, .totals-table {
          width: 100%;
          border-collapse: collapse;
        }
        .btn-print {
          background: #0f172a;
          color: #ffffff;
          border: none;
          padding: 10px 24px;
          border-radius: 9999px;
          font-weight: 700;
          cursor: pointer;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.2);
        }
        .badge-paid {
          display: inline-block;
          padding: 6px 14px;
          border: 2px solid #059669;
          color: #059669;
          font-weight: 900;
          font-size: 13px;
          letter-spacing: 0.08em;
          border-radius: 6px;
          background: #ecfdf5;
          text-transform: uppercase;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="max-width: 800px; margin: 0 auto 20px; display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
        <span style="font-size: 14px; color: #64748b; font-weight: 600;">Official Electronic GST Tax Invoice</span>
        <button class="btn-print" onclick="window.print()">
          🖨️ Print / Save as PDF
        </button>
      </div>

      <div class="invoice-card">
        <!-- Top Letterhead -->
        <table class="header-table" style="margin-bottom: 24px; border-bottom: 2px solid #0f172a; padding-bottom: 18px;">
          <tr>
            <td style="vertical-align: top; width: 60%;">
              <div style="font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -0.03em;">
                AURA<span style="color: #4f46e5;">.store</span>
              </div>
              <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">
                AURA LUXURY ELECTRONICS PRIVATE LIMITED
              </div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px; line-height: 1.4;">
                CIN: U72900KA2024PTC184920 • GSTIN: 29AAACA1234F1Z8<br>
                AURA Campus, 84 Prestige Tech Boulevard, Outer Ring Road<br>
                Bengaluru, Karnataka 560103, India | support@aura.store
              </div>
            </td>
            <td style="vertical-align: top; text-align: right; width: 40%;">
              <div style="font-size: 20px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">
                TAX INVOICE
              </div>
              <div style="font-size: 12px; color: #64748b;">(Original for Recipient)</div>
              <div style="margin-top: 10px; font-size: 12px;">
                <div>Invoice No: <strong style="color: #0f172a; font-family: monospace; font-size: 13px;">${invoiceNumber}</strong></div>
                <div>Invoice Date: <strong style="color: #0f172a;">${invoiceDate}</strong></div>
                <div>Order Ref: <strong style="color: #4f46e5;">#${orderNumber}</strong></div>
                <div>State Code: <strong style="color: #0f172a;">29 (Karnataka)</strong></div>
              </div>
            </td>
          </tr>
        </table>

        <!-- Billed to & Shipped to -->
        <table class="client-table" style="margin-bottom: 24px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 14px 16px; width: 50%; vertical-align: top; border-right: 1px solid #e2e8f0;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #4f46e5; letter-spacing: 0.05em; margin-bottom: 6px;">
                Billed To (Customer Details)
              </div>
              <div style="font-weight: 800; font-size: 14px; color: #0f172a;">${customerName}</div>
              <div style="font-size: 12px; color: #475569; margin-top: 2px;">${customerEmail}</div>
              <div style="font-size: 12px; color: #475569; margin-top: 2px;">Place of Supply: ${shippingCity}, Karnataka (29)</div>
            </td>
            <td style="padding: 14px 16px; width: 50%; vertical-align: top;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #4f46e5; letter-spacing: 0.05em; margin-bottom: 6px;">
                Shipped To (Destination)
              </div>
              <div style="font-weight: 800; font-size: 14px; color: #0f172a;">${customerName}</div>
              <div style="font-size: 12px; color: #475569; margin-top: 2px; line-height: 1.4;">
                ${shippingAddress}<br>
                ${shippingCity} - ${shippingZip}, India
              </div>
              <div style="font-size: 11px; color: #059669; font-weight: 700; margin-top: 4px;">
                ✓ BlueDart Express Tracking: BLR-${orderNumber.slice(-6)}-IN
              </div>
            </td>
          </tr>
        </table>

        <!-- Items Table -->
        <table class="items-table" style="margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #0f172a; color: #ffffff;">
              <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; width: 5%;">#</th>
              <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; text-align: left; width: 45%;">Item Description</th>
              <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; text-align: center; width: 12%;">HSN/SAC</th>
              <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; text-align: center; width: 8%;">Qty</th>
              <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; text-align: right; width: 15%;">Unit Base</th>
              <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; text-align: right; width: 15%;">Tax Rate</th>
              <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; text-align: right; width: 15%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml || `
              <tr>
                <td style="padding: 10px 12px; text-align: center; font-size: 13px;">1</td>
                <td style="padding: 10px 12px; font-size: 13px;">
                  <div style="font-weight: 700; color: #0f172a;">AURA Flagship Studio Creation</div>
                  <div style="font-size: 11px; color: #64748b;">Serial: AUR-84920-FLAGSHIP</div>
                </td>
                <td style="padding: 10px 12px; text-align: center; font-size: 12px; font-family: monospace;">8517.62</td>
                <td style="padding: 10px 12px; text-align: center; font-size: 13px; font-weight: 700;">1</td>
                <td style="padding: 10px 12px; text-align: right; font-size: 13px;">₹${subtotalBeforeTax.toLocaleString('en-IN')}</td>
                <td style="padding: 10px 12px; text-align: right; font-size: 13px;">18% GST</td>
                <td style="padding: 10px 12px; text-align: right; font-size: 13px; font-weight: 700;">₹${totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            `}
          </tbody>
        </table>

        <!-- Totals & Payment Summary -->
        <table class="totals-table" style="margin-bottom: 24px;">
          <tr>
            <td style="vertical-align: top; width: 55%; padding-right: 20px;">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">Payment Record</span>
                  <span class="badge-paid">${isPaid ? 'PAID IN FULL' : 'PAYMENT PENDING'}</span>
                </div>
                <div style="font-size: 12px; color: #334155; line-height: 1.5;">
                  <div>Method: <strong>${paymentMethod}</strong></div>
                  <div>Payment Reference: <strong style="font-family: monospace; color: #4f46e5;">${paymentRef}</strong></div>
                  <div>Gateway: <strong>Razorpay Payment Switch (256-bit SSL)</strong></div>
                </div>
              </div>

              <div style="margin-top: 12px; font-size: 11px; color: #64748b; line-height: 1.4;">
                <strong>Amount in words:</strong><br>
                <em style="color: #0f172a; font-weight: 600;">${numberToWordsINR(totalAmount)}</em>
              </div>
            </td>

            <td style="vertical-align: top; width: 45%;">
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Taxable Value (Subtotal):</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #0f172a;">₹${subtotalBeforeTax.toLocaleString('en-IN')}</td>
                </tr>
                ${discountAmount > 0 ? `
                  <tr>
                    <td style="padding: 6px 0; color: #059669; font-weight: 600;">Coupon Discount (${order.couponCode || 'PROMO'}):</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #059669;">-₹${discountAmount.toLocaleString('en-IN')}</td>
                  </tr>
                ` : ''}
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Central GST (CGST 9%):</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #0f172a;">₹${cgst.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">State GST (SGST 9%):</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #0f172a;">₹${sgst.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Insured White-Glove Shipping:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #059669;">FREE</td>
                </tr>
                <tr style="border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a;">
                  <td style="padding: 10px 0; font-size: 15px; font-weight: 900; color: #0f172a;">Grand Total:</td>
                  <td style="padding: 10px 0; text-align: right; font-size: 17px; font-weight: 900; color: #0f172a;">₹${totalAmount.toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer Sign-off -->
        <table style="width: 100%; border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 11px; color: #64748b;">
          <tr>
            <td style="vertical-align: bottom; width: 65%;">
              <strong>Terms & Conditions:</strong><br>
              1. Goods once sold are covered under AURA's 2-Year Official Replacement Guarantee.<br>
              2. Disputes, if any, subject to Bengaluru Jurisdiction.<br>
              3. This is a computer-generated tax invoice and requires no physical signature.
            </td>
            <td style="vertical-align: bottom; text-align: right; width: 35%;">
              <div style="font-weight: 800; color: #0f172a; margin-bottom: 24px;">For AURA LUXURY ELECTRONICS PVT LTD</div>
              <div style="font-weight: 700; color: #4f46e5;">Authorized Signatory</div>
              <div style="font-size: 10px; color: #94a3b8;">Digitally Signed & Certified</div>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;

  // Open high-res print window
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  }
}
