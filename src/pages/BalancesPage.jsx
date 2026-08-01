import { useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { StatusPill } from '../components/StatusPill';
import { useAppData } from '../hooks/useAppData';
import { calculatePortfolioBalances } from '../services/reconciliation';
import { formatCurrency } from '../utils/formatters';
import { GPaySendMoneyModal } from '../components/GPaySendMoneyModal';
import { HiBanknotes, HiCheckCircle } from 'react-icons/hi2';

export function BalancesPage() {
  const { expenses, expenseVersions, groups, payments, users } = useAppData();
  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const [payRecipient, setPayRecipient] = useState(null);

  const groupedBalances = calculatePortfolioBalances(groups, expenses, expenseVersions, payments, users);
  const visibleRows =
    selectedGroupId === 'all'
      ? groupedBalances.flatMap(({ group, rows }) => rows.map((row) => ({ ...row, groupName: group.name })))
      : groupedBalances
          .filter(({ group }) => group.id === selectedGroupId)
          .flatMap(({ group, rows }) => rows.map((row) => ({ ...row, groupName: group.name })));

  const paidTotal = visibleRows.reduce((total, row) => total + row.paid, 0);
  const remainingTotal = visibleRows.reduce((total, row) => total + row.remaining, 0);
  const refundTotal = visibleRows.reduce((total, row) => total + row.refund, 0);
  const settledCount = visibleRows.filter((row) => row.status === 'paid').length;

  return (
    <div className="space-y-6 pb-6">
      <SectionHeader
        badge="Balance Intelligence"
        description="Review every member's paid amount, expected share, remaining due, and refund status with instant 1-click GPay settlement."
        title="Balances & Dues"
        actions={
          <select
            className="h-11 rounded-full border border-gray-200 bg-white px-4 text-xs font-bold text-text outline-none focus:border-brand w-full sm:w-auto"
            onChange={(event) => setSelectedGroupId(event.target.value)}
            value={selectedGroupId}
          >
            <option value="all">All Groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        }
      />

      <section className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[24px] bg-white p-4 sm:p-5 border border-[#e8edf5] shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">Total Paid</p>
          <p className="mt-1 sm:mt-2 font-display text-xl sm:text-2xl font-extrabold text-text">
            {formatCurrency(paidTotal)}
          </p>
        </div>
        <div className="rounded-[24px] bg-white p-4 sm:p-5 border border-[#e8edf5] shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">Expected Share</p>
          <p className="mt-1 sm:mt-2 font-display text-xl sm:text-2xl font-extrabold text-text">
            {formatCurrency(visibleRows.reduce((total, row) => total + row.shouldPay, 0))}
          </p>
        </div>
        <div className="rounded-[24px] bg-white p-4 sm:p-5 border border-[#e8edf5] shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Remaining Dues</p>
          <p className="mt-1 sm:mt-2 font-display text-xl sm:text-2xl font-extrabold text-amber-600">
            {formatCurrency(remainingTotal)}
          </p>
        </div>
        <div className="rounded-[24px] bg-white p-4 sm:p-5 border border-[#e8edf5] shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand">Refund Balance</p>
          <p className="mt-1 sm:mt-2 font-display text-xl sm:text-2xl font-extrabold text-brand">
            {formatCurrency(refundTotal)}
          </p>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-4 sm:p-6 border border-[#e8edf5] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-subtle">Member Breakdown</p>
            <h2 className="text-lg sm:text-xl font-extrabold text-text mt-0.5 sm:mt-1">
              {settledCount} of {visibleRows.length} members settled
            </h2>
          </div>
        </div>

        {/* Mobile Card View (< sm) */}
        <div className="grid gap-3 sm:hidden">
          {visibleRows.map((row) => (
            <div
              key={`mobile-${row.groupName}-${row.member.id}`}
              className="rounded-2xl bg-[#f8fafd] p-4 border border-gray-100 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xs font-bold text-white shadow-sm">
                    {row.member.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-text text-xs">{row.member.name}</p>
                    <p className="text-[10px] text-text-subtle">{row.groupName}</p>
                  </div>
                </div>
                <StatusPill status={row.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                <div>
                  <span className="text-text-subtle text-[10px] block">Paid Amount</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(row.paid)}</span>
                </div>
                <div>
                  <span className="text-text-subtle text-[10px] block">Remaining Due</span>
                  <span className="font-extrabold text-amber-600">{formatCurrency(row.remaining)}</span>
                </div>
              </div>

              {row.remaining > 0 ? (
                <button
                  type="button"
                  onClick={() => setPayRecipient(row.member)}
                  className="w-full h-9 rounded-full bg-brand text-white text-xs font-bold hover:bg-[#1669d1] active:scale-95 transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <HiBanknotes className="text-sm" /> Pay {formatCurrency(row.remaining)} via GPay
                </button>
              ) : (
                <div className="w-full h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] flex items-center justify-center gap-1">
                  <HiCheckCircle className="text-sm" /> Fully Settled
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Table View (>= sm) */}
        <div className="hidden sm:block overflow-x-auto scrollbar-thin">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-text-subtle uppercase tracking-wider font-bold">
                <th className="pb-3">Member</th>
                <th className="pb-3">Group</th>
                <th className="pb-3">Paid</th>
                <th className="pb-3">Should Pay</th>
                <th className="pb-3">Remaining</th>
                <th className="pb-3">Refund</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">GPay Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleRows.map((row) => (
                <tr key={`${row.groupName}-${row.member.id}`} className="hover:bg-slate-50 transition">
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                        {row.member.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-text">{row.member.name}</p>
                        <p className="text-[10px] text-text-subtle">{row.member.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-text-subtle font-medium">{row.groupName}</td>
                  <td className="py-3.5 text-emerald-700 font-bold">{formatCurrency(row.paid)}</td>
                  <td className="py-3.5 text-text-subtle">{formatCurrency(row.shouldPay)}</td>
                  <td className="py-3.5 text-amber-600 font-extrabold">{formatCurrency(row.remaining)}</td>
                  <td className="py-3.5 text-brand font-extrabold">{formatCurrency(row.refund)}</td>
                  <td className="py-3.5"><StatusPill status={row.status} /></td>
                  <td className="py-3.5">
                    {row.remaining > 0 ? (
                      <button
                        type="button"
                        onClick={() => setPayRecipient(row.member)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand text-white text-[11px] font-bold hover:bg-[#1669d1] transition shadow-sm"
                      >
                        <HiBanknotes /> Pay {formatCurrency(row.remaining)}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                        <HiCheckCircle /> Settled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <GPaySendMoneyModal
        isOpen={Boolean(payRecipient)}
        onClose={() => setPayRecipient(null)}
        recipient={payRecipient}
      />
    </div>
  );
}
