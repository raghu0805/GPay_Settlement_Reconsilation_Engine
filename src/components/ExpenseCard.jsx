import { formatCurrency, formatDate, formatLabel } from '../utils/formatters';
import { StatusPill } from './StatusPill';

export function ExpenseCard({ expense, creator, currentVersion, onEdit, onHistory }) {
  return (
    <div className="soft-card flex flex-col gap-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-xl font-semibold tracking-[-0.03em] text-text">{expense.title}</p>
            <StatusPill status={expense.status} />
          </div>
          <p className="max-w-xl text-sm text-text-subtle">{expense.description}</p>
        </div>
        <p className="font-display text-2xl font-semibold tracking-[-0.04em] text-text">
          {formatCurrency(currentVersion?.amount ?? 0)}
        </p>
      </div>
      <div className="grid gap-3 text-sm text-text-subtle sm:grid-cols-2 xl:grid-cols-5">
        <div>
          <p className="label">Created By</p>
          <p className="mt-1 font-medium text-text">{creator?.name}</p>
        </div>
        <div>
          <p className="label">Split Type</p>
          <p className="mt-1 font-medium text-text">{formatLabel(expense.splitType)}</p>
        </div>
        <div>
          <p className="label">Category</p>
          <p className="mt-1 font-medium text-text">{expense.category}</p>
        </div>
        <div>
          <p className="label">Date</p>
          <p className="mt-1 font-medium text-text">{formatDate(expense.date)}</p>
        </div>
        <div>
          <p className="label">Current Version</p>
          <p className="mt-1 font-medium text-text">Version {currentVersion?.versionNumber ?? 1}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="secondary-button" onClick={() => onEdit(expense)} type="button">
          Edit Expense
        </button>
        <button className="secondary-button" onClick={() => onHistory(expense)} type="button">
          View History
        </button>
      </div>
    </div>
  );
}
