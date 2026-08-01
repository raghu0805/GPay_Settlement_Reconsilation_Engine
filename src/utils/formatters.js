const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0);
}

export function formatCompactNumber(value) {
  return compactNumberFormatter.format(Number(value) || 0);
}

export function formatDate(value, options = { day: 'numeric', month: 'short' }) {
  return new Intl.DateTimeFormat('en-IN', options).format(new Date(value));
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatRelativeDate(value) {
  const timestamp = new Date(value).getTime();
  const now = Date.now();
  const diffMinutes = Math.round((timestamp - now) / 60000);
  const absoluteMinutes = Math.abs(diffMinutes);

  if (absoluteMinutes < 60) {
    return `${absoluteMinutes || 1}m ${diffMinutes < 0 ? 'ago' : 'from now'}`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 24) {
    return `${Math.abs(diffHours)}h ${diffHours < 0 ? 'ago' : 'from now'}`;
  }

  const diffDays = Math.round(diffHours / 24);

  return `${Math.abs(diffDays)}d ${diffDays < 0 ? 'ago' : 'from now'}`;
}

export function formatPercent(value) {
  return `${Number(value).toFixed(0)}%`;
}

export function formatLabel(value) {
  return value
    .split(/[\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
