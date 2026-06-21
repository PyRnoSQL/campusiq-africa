import jsPDF from 'jspdf';

export function generateReceiptPDF({ institution, student, fee }) {
  const doc = new jsPDF({ unit: 'pt', format: [320, 480] }); // receipt-sized page

  doc.setFillColor(20, 24, 43);
  doc.rect(0, 0, 320, 60, 'F');
  doc.setTextColor(246, 241, 231);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(institution?.name || 'CampusIQ Africa', 20, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Payment receipt', 20, 46);

  doc.setTextColor(20, 24, 43);
  let y = 90;
  const line = (label, value) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(91, 96, 114);
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 24, 43);
    doc.text(String(value ?? '—'), 150, y);
    y += 22;
  };

  line('Receipt No.', fee.receipt_no || '—');
  line('Student', `${student?.first_name || ''} ${student?.last_name || ''}`);
  line('Matricule', student?.matricule || '—');
  line('Fee type', fee.fee_type);
  line('Amount due', `${fee.amount_due} ${fee.currency}`);
  line('Amount paid', `${fee.amount_paid} ${fee.currency}`);
  line('Payment method', fee.payment_method || '—');
  line('Payment date', fee.payment_date || '—');
  line('Status', fee.status);

  doc.setDrawColor(228, 220, 201);
  doc.line(20, y + 4, 300, y + 4);
  y += 26;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(91, 96, 114);
  doc.text('This receipt was generated electronically and is valid without a signature.', 20, y, { maxWidth: 280 });
  doc.text(`Generated ${new Date().toLocaleString()}`, 20, y + 24);

  doc.save(`receipt_${fee.receipt_no || fee.id}.pdf`);
}
