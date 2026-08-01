/**
 * Real UPI Deep Link Generator for Google Pay & Indian Banking Standards (NPCI)
 * Generates valid upi:// pay links for instant real-money UPI transfers.
 */

export function generateUpiPayLink({
  upiId = 'raghu@okicici',
  name = 'Raghu Malhotra',
  amount = 100,
  note = 'GPay Web Payment',
}) {
  const cleanUpi = encodeURIComponent(upiId.trim());
  const cleanName = encodeURIComponent(name.trim());
  const cleanNote = encodeURIComponent(note.trim());
  const cleanAmount = Number(amount).toFixed(2);

  // Standard NPCI UPI Intent Format
  return `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${cleanAmount}&cu=INR&tn=${cleanNote}`;
}

export function generateUpiQrUrl({ upiId = 'raghu@okicici', name = 'Raghu Malhotra', amount = 100, note = 'GPay Payment' }) {
  const upiLink = generateUpiPayLink({ upiId, name, amount, note });
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;
}
