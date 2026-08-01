import { startTransition, useEffect, useEffectEvent, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiBolt, HiCheckCircle, HiSparkles } from 'react-icons/hi2';
import { ProgressRing } from '../components/ProgressRing';
import { SectionHeader } from '../components/SectionHeader';
import { StatusPill } from '../components/StatusPill';
import { useAppData } from '../hooks/useAppData';
import { calculateExpenseSettlement, getExpenseVersions } from '../services/reconciliation';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export function DsrePage() {
  const { expenses, expenseVersions, groups, payments, users } = useAppData();
  const dsreExpenses = expenses.filter((expense) => getExpenseVersions(expense.id, expenseVersions).length > 1);
  const [selectedExpenseId, setSelectedExpenseId] = useState(dsreExpenses[0]?.id ?? '');
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutRef = useRef(null);

  const selectedExpense = dsreExpenses.find((expense) => expense.id === selectedExpenseId) ?? dsreExpenses[0];
  const versionHistory = selectedExpense ? getExpenseVersions(selectedExpense.id, expenseVersions) : [];
  const currentVersion = versionHistory.at(-1);
  const previousVersion = versionHistory.at(-2) ?? versionHistory.at(-1);
  const paymentSnapshot = payments.filter((payment) => payment.expenseId === selectedExpense?.id);
  const counts = {
    paid: paymentSnapshot.filter((payment) => payment.status === 'paid').length,
    pending: paymentSnapshot.filter((payment) => payment.status === 'pending').length,
    failed: paymentSnapshot.filter((payment) => payment.status === 'failed').length,
  };

  const runCalculation = useEffectEvent((expense) => {
    if (!expense) {
      setResult(null);
      setIsProcessing(false);
      return;
    }

    setResult(calculateExpenseSettlement(expense, expenseVersions, payments, users));
    setIsProcessing(false);
  });

  useEffect(() => {
    runCalculation(selectedExpense);
  }, [selectedExpense, runCalculation]);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const handleCompute = () => {
    if (!selectedExpense) {
      return;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setIsProcessing(true);
    timeoutRef.current = window.setTimeout(() => {
      startTransition(() => {
        runCalculation(selectedExpense);
      });
    }, 650);
  };

  const settlementProgress = result?.rows?.length
    ? (result.settledCount / result.rows.length) * 100
    : 0;
  const group = groups.find((entry) => entry.id === selectedExpense?.groupId);

  return (
    <div className="space-y-6 pb-6">
      <SectionHeader
        badge="Core Innovation"
        description="Compare expense versions, preserve immutable payment history, and compute net dues or refunds through the Dynamic Settlement Reconciliation Engine."
        title="DSRE Analytics & Diff Engine"
        actions={
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 text-xs font-bold text-white shadow-md shadow-brand/20 hover:bg-[#1669d1] transition w-full sm:w-auto"
            onClick={handleCompute}
            type="button"
          >
            <HiBolt className="text-base" />
            {isProcessing ? 'Processing Engine...' : 'Generate Settlement'}
          </button>
        }
      />

      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[30px] bg-white p-4 sm:p-6 border border-[#e8edf5] shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand">Input Payload</p>
              <h2 className="text-lg sm:text-xl font-extrabold text-text mt-0.5">Version Comparison</h2>
            </div>
            <select
              className="h-10 rounded-full border border-gray-200 bg-[#f8fafd] px-4 text-xs font-bold text-text outline-none focus:border-brand w-full sm:w-[220px]"
              onChange={(event) => setSelectedExpenseId(event.target.value)}
              value={selectedExpenseId}
            >
              {dsreExpenses.map((expense) => (
                <option key={expense.id} value={expense.id}>
                  {expense.title}
                </option>
              ))}
            </select>
          </div>

          {selectedExpense ? (
            <>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#eef4ff] p-4 border border-blue-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">Previous Version</p>
                  <p className="mt-1 sm:mt-2 font-display text-xl sm:text-2xl font-extrabold text-text">
                    {formatCurrency(previousVersion?.amount ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-text-subtle">{previousVersion?.reason}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase text-text-subtle">
                    {formatDateTime(previousVersion?.date ?? new Date().toISOString())}
                  </p>
                </div>
                <div className="rounded-2xl bg-brand/10 p-4 border border-brand/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand">Current Version</p>
                  <p className="mt-1 sm:mt-2 font-display text-xl sm:text-2xl font-extrabold text-brand">
                    {formatCurrency(currentVersion?.amount ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-text-subtle">{currentVersion?.reason}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase text-brand">
                    {formatDateTime(currentVersion?.date ?? new Date().toISOString())}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Paid</p>
                  <p className="mt-0.5 text-lg font-extrabold text-emerald-700">{counts.paid}</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Pending</p>
                  <p className="mt-0.5 text-lg font-extrabold text-amber-600">{counts.pending}</p>
                </div>
                <div className="rounded-2xl bg-rose-50 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Failed</p>
                  <p className="mt-0.5 text-lg font-extrabold text-rose-600">{counts.failed}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#f8fafd] p-4 border border-gray-100 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-text-subtle">Processing Pipeline</p>
                <div className="space-y-1.5 text-xs text-text-subtle leading-relaxed">
                  <p>1. Compares version diff ({formatCurrency(previousVersion?.amount ?? 0)} → {formatCurrency(currentVersion?.amount ?? 0)}).</p>
                  <p>2. Recalculates exact member share requirements.</p>
                  <p>3. Matches against immutable payment ledger records.</p>
                  <p>4. Emits collection requests and refund orders automatically.</p>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="rounded-[30px] bg-white p-4 sm:p-6 border border-[#e8edf5] shadow-sm space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand">Output Result</p>
              <h2 className="text-lg sm:text-xl font-extrabold text-text mt-0.5">Settlement Calculation</h2>
            </div>
            {group ? (
              <Link
                className="px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-text hover:bg-slate-50 transition shrink-0"
                to={`/groups/${group.id}`}
              >
                Open Group
              </Link>
            ) : null}
          </div>

          <div className="rounded-2xl bg-[#f8fafd] p-4 border border-gray-100">
            <ProgressRing
              label="Members fully settled"
              sublabel={`${result?.settledCount ?? 0} of ${result?.rows?.length ?? 0} members complete`}
              value={settlementProgress}
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl bg-emerald-50 p-3 sm:p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Settled</p>
              <p className="mt-1 font-display text-lg sm:text-xl font-extrabold text-emerald-900">
                {result?.settledCount ?? 0}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 sm:p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Remaining</p>
              <p className="mt-1 font-display text-lg sm:text-xl font-extrabold text-amber-900 truncate">
                {formatCurrency(result?.collectionTotal ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl bg-[#eef4ff] p-3 sm:p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand">Refund</p>
              <p className="mt-1 font-display text-lg sm:text-xl font-extrabold text-brand truncate">
                {formatCurrency(result?.refundTotal ?? 0)}
              </p>
            </div>
          </div>

          {/* Mobile Card List (< sm) */}
          <div className="grid gap-2.5 sm:hidden">
            {result?.rows?.map((row) => (
              <div key={`dsre-mobile-${row.memberId}`} className="rounded-2xl bg-[#f8fafd] p-3.5 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-text text-xs">{row.member.name}</p>
                  <StatusPill status={row.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-text-subtle text-[10px] block">Shares (Old → New)</span>
                    <span className="font-semibold text-text">{formatCurrency(row.oldShare)} → {formatCurrency(row.newShare)}</span>
                  </div>
                  <div>
                    <span className="text-text-subtle text-[10px] block">Due / Refund</span>
                    <span className="font-bold text-amber-600">{formatCurrency(row.remaining)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= sm) */}
          <div className="hidden sm:block overflow-x-auto scrollbar-thin rounded-2xl border border-gray-100 p-3">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-text-subtle uppercase tracking-wider font-bold">
                  <th className="pb-3">Member</th>
                  <th className="pb-3">Old Share</th>
                  <th className="pb-3">New Share</th>
                  <th className="pb-3">Paid</th>
                  <th className="pb-3">Remaining</th>
                  <th className="pb-3">Refund</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result?.rows?.map((row) => (
                  <tr key={row.memberId} className="hover:bg-slate-50 transition">
                    <td className="py-3 font-bold text-text">{row.member.name}</td>
                    <td className="py-3 text-text-subtle">{formatCurrency(row.oldShare)}</td>
                    <td className="py-3 text-text-subtle">{formatCurrency(row.newShare)}</td>
                    <td className="py-3 text-emerald-700 font-bold">{formatCurrency(row.paid)}</td>
                    <td className="py-3 text-amber-600 font-extrabold">{formatCurrency(row.remaining)}</td>
                    <td className="py-3 text-brand font-extrabold">{formatCurrency(row.refund)}</td>
                    <td className="py-3"><StatusPill status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl bg-[#0f172a] p-4 sm:p-5 text-white space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
              <HiSparkles className="text-yellow-400 text-base shrink-0" />
              <span>Immutable Ledger Guarantee</span>
            </div>
            <p className="text-[11px] sm:text-xs text-white/70 leading-relaxed">
              Past payment records are never modified. All adjustments are computed continuously on top of immutable payment logs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
