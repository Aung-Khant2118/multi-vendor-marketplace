export function formatCurrency(value) {
  const n = Number(value) || 0;
  return `MMK ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US');
}

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const STATUS_PILL_CLASSES = {
  PENDING: 'vpill-yellow',
  CONFIRMED: 'vpill-blue',
  PROCESSING: 'vpill-blue',
  SHIPPED: 'vpill-orange',
  DELIVERED: 'vpill-green',
  COMPLETED: 'vpill-green',
  CANCELLED: 'vpill-red',
};

export const PAYMENT_STATUS_LABELS = {
  PENDING: 'Pending',
  COMPLETED: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

export function getStatusPill(status) {
  return {
    cls: STATUS_PILL_CLASSES[status] || 'vpill-gray',
    label: STATUS_LABELS[status] || status,
  };
}

export function formatPaymentInfo(paymentMethod, paymentStatus) {
  if (!paymentMethod) return '—';
  const methodLabel = paymentMethod === 'CASH_ON_DELIVERY' ? 'COD' : paymentMethod;
  const statusLabel = PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus || 'Pending';
  return `${methodLabel} • ${statusLabel}`;
}
