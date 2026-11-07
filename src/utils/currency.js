/**
 * Currency utility for Indian Rupee (INR - ₹) formatting
 */
export function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0.00';
  return '₹' + Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatINRCompact(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });
}
