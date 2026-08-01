import { Link } from 'react-router-dom';
import { HiArrowRight, HiPlus, HiUsers, HiSparkles } from 'react-icons/hi2';
import { GroupGlyph } from '../components/GroupGlyph';
import { SectionHeader } from '../components/SectionHeader';
import { useAppData } from '../hooks/useAppData';
import { calculateGroupBalances } from '../services/reconciliation';
import { formatCurrency } from '../utils/formatters';

export function GroupsPage() {
  const { groups, expenses, expenseVersions, payments, users } = useAppData();

  const groupSummaries = groups.map((group) => {
    const balances = calculateGroupBalances(group, expenses, expenseVersions, payments, users);
    const outstandingBalance = balances.reduce((total, row) => total + row.remaining, 0);
    const refundBalance = balances.reduce((total, row) => total + row.refund, 0);

    return { group, balances, outstandingBalance, refundBalance };
  });

  return (
    <div className="space-y-6 pb-6">
      <SectionHeader
        badge="Collaborative Expense Pods"
        description="Each group is styled like an authentic Google Pay workspace with shared context, live member balances, and tap-friendly cards."
        title="Groups & Splitting"
        actions={
          <Link
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 text-xs font-bold text-white shadow-md shadow-brand/20 hover:bg-[#1669d1] transition"
            to="/expenses/new"
          >
            <HiPlus className="text-base" />
            Add Expense
          </Link>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {groupSummaries.map(({ group, balances, outstandingBalance, refundBalance }) => (
          <Link
            key={group.id}
            to={`/groups/${group.id}`}
            className="group relative flex flex-col justify-between gap-6 rounded-[30px] bg-white p-6 border border-[#e8edf5] shadow-sm hover:shadow-lg hover:border-brand/30 transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="grid h-16 w-16 place-items-center rounded-2xl text-2xl text-white font-extrabold shadow-md shrink-0 group-hover:scale-105 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${group.accent}, #4285f4)` }}
                >
                  <GroupGlyph icon={group.icon} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold tracking-tight text-text group-hover:text-brand transition">
                    {group.name}
                  </h3>
                  <p className="mt-1 text-xs text-text-subtle line-clamp-2 leading-relaxed">{group.description}</p>
                </div>
              </div>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#f8fafd] text-text-subtle group-hover:bg-brand group-hover:text-white transition">
                <HiArrowRight className="text-base" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#eef4ff] p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">Outstanding Balance</p>
                <p className="mt-1 font-display text-lg font-extrabold text-text">
                  {formatCurrency(outstandingBalance)}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Refund Exposure</p>
                <p className="mt-1 font-display text-lg font-extrabold text-emerald-800">
                  {formatCurrency(refundBalance)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex -space-x-2">
                {balances.map((row, idx) => (
                  <span
                    key={row.member.id}
                    className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-brand text-xs font-bold text-white shadow-sm"
                    title={row.member.name}
                  >
                    {row.member.avatar}
                  </span>
                ))}
              </div>
              <span className="text-xs font-bold text-text-subtle flex items-center gap-1">
                <HiUsers className="text-brand" /> {group.memberIds.length} members
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
