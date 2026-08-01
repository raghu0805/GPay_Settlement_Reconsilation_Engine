import { formatLabel } from '../utils/formatters';

const statusClasses = {
  paid: 'bg-success/12 text-success',
  pending: 'bg-warning/18 text-[#A57100]',
  overdue: 'bg-danger/12 text-danger',
  refund: 'bg-brand/10 text-brand',
  'payment-request': 'bg-warning/18 text-[#A57100]',
  'refund-request': 'bg-brand/10 text-brand',
  'expense-updated': 'bg-brand/10 text-brand',
  'settlement-complete': 'bg-success/12 text-success',
  completed: 'bg-success/12 text-success',
  approved: 'bg-brand/10 text-brand',
  rejected: 'bg-danger/12 text-danger',
};

export function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {formatLabel(status)}
    </span>
  );
}
