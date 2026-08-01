import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiMagnifyingGlass, HiBanknotes, HiDevicePhoneMobile } from 'react-icons/hi2';
import { SectionHeader } from '../components/SectionHeader';
import { useAppData } from '../hooks/useAppData';
import { formatCurrency } from '../utils/formatters';
import { GPaySendMoneyModal } from '../components/GPaySendMoneyModal';
import { GPayPayByPhoneModal } from '../components/GPayPayByPhoneModal';

export function SearchPage() {
  const { expenses, expenseVersions, groups, payments, users } = useAppData();
  const [query, setQuery] = useState('');
  const [payRecipient, setPayRecipient] = useState(null);
  const [isPayByPhoneOpen, setIsPayByPhoneOpen] = useState(false);
  const [phonePayInitial, setPhonePayInitial] = useState('');

  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const hasQuery = Boolean(deferredQuery);

  const matchingGroups = hasQuery
    ? groups.filter((group) =>
        `${group.name} ${group.description}`.toLowerCase().includes(deferredQuery),
      )
    : [];

  const matchingMembers = hasQuery
    ? users.filter((user) =>
        `${user.name} ${user.role} ${user.location} ${user.phone || ''} ${user.upiId || ''}`.toLowerCase().includes(deferredQuery),
      )
    : [];

  const matchingExpenses = hasQuery
    ? expenses.filter((expense) => {
        const version = expenseVersions.find((entry) => entry.id === expense.currentVersionId);
        return `${expense.title} ${expense.description} ${expense.category} ${version?.amount ?? ''}`
          .toLowerCase()
          .includes(deferredQuery);
      })
    : [];

  const matchingPayments = hasQuery
    ? payments.filter((payment) => {
        const member = users.find((user) => user.id === payment.memberId);
        const expense = expenses.find((entry) => entry.id === payment.expenseId);
        return `${member?.name ?? ''} ${payment.status} ${expense?.title ?? ''}`
          .toLowerCase()
          .includes(deferredQuery);
      })
    : [];

  return (
    <div className="space-y-6 pb-6">
      <SectionHeader
        badge="Unified Finder"
        description="Search across contacts, groups, expenses, and transaction logs with instant payment triggers."
        title="Search GPay Surface"
      />

      <section className="rounded-[30px] bg-white p-6 border border-[#e8edf5] shadow-sm space-y-4">
        <div className="relative">
          <HiMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-brand" />
          <input
            autoFocus
            className="w-full h-13 rounded-full border border-gray-200 bg-[#f8fafd] pl-12 pr-4 text-sm font-semibold text-text outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people, groups, bills, payments..."
            value={query}
          />
        </div>

        {!deferredQuery ? (
          <div className="rounded-2xl bg-[#f8fafd] p-4 space-y-2">
            <p className="text-xs font-bold text-text-subtle uppercase tracking-wider">Suggested Searches</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {['Ananya', 'Merchant onboarding', 'refund', 'travel', 'pending'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="rounded-full bg-white border border-gray-200 px-3.5 py-1.5 text-xs font-bold text-text-subtle hover:text-brand hover:border-brand/40 transition"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs font-bold text-text-subtle">
            Found {matchingGroups.length + matchingMembers.length + matchingExpenses.length + matchingPayments.length} results for &quot;{query}&quot;
          </p>
        )}
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {/* People / Contacts Search */}
        <div className="rounded-[28px] bg-white p-6 border border-[#e8edf5] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-text-subtle">Contacts & Members</p>
            <button
              type="button"
              onClick={() => {
                setPhonePayInitial(query);
                setIsPayByPhoneOpen(true);
              }}
              className="text-[11px] font-bold text-brand hover:underline flex items-center gap-1"
            >
              <HiDevicePhoneMobile className="text-sm" /> Pay Phone Number
            </button>
          </div>
          <div className="space-y-2.5">
            {matchingMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f8fafd] border border-gray-100 hover:border-brand/20 transition">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                    {member.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text">{member.name}</p>
                    <p className="text-[10px] text-text-subtle">{member.phone ? `${member.phone} • ` : ''}{member.role} • {member.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPayRecipient(member)}
                    className="px-3 py-1 rounded-full bg-brand text-white text-[11px] font-bold hover:bg-[#1669d1] transition flex items-center gap-1 shadow-sm"
                  >
                    <HiBanknotes /> Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPhonePayInitial(member.phone || member.name);
                      setIsPayByPhoneOpen(true);
                    }}
                    className="px-3 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold hover:bg-amber-600 transition flex items-center gap-1 shadow-sm"
                  >
                    Request
                  </button>
                </div>
              </div>
            ))}
            {!hasQuery ? <p className="text-xs text-text-subtle">Search members by name, phone number (+91), or location.</p> : null}
          </div>
        </div>

        {/* Groups Search */}
        <div className="rounded-[28px] bg-white p-6 border border-[#e8edf5] shadow-sm space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-text-subtle">Groups & Pods</p>
          <div className="space-y-2.5">
            {matchingGroups.map((group) => (
              <Link key={group.id} to={`/groups/${group.id}`} className="block p-3.5 rounded-2xl bg-[#f8fafd] border border-gray-100 hover:border-brand/20 transition">
                <p className="text-xs font-bold text-text">{group.name}</p>
                <p className="text-[11px] text-text-subtle mt-0.5">{group.description}</p>
              </Link>
            ))}
            {!hasQuery ? <p className="text-xs text-text-subtle">Search groups by name or description.</p> : null}
          </div>
        </div>

        {/* Expenses Search */}
        <div className="rounded-[28px] bg-white p-6 border border-[#e8edf5] shadow-sm space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-text-subtle">Expenses & Splits</p>
          <div className="space-y-2.5">
            {matchingExpenses.map((expense) => {
              const version = expenseVersions.find((entry) => entry.id === expense.currentVersionId);
              return (
                <Link key={expense.id} to={`/groups/${expense.groupId}`} className="block p-3.5 rounded-2xl bg-[#f8fafd] border border-gray-100 hover:border-brand/20 transition">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-text">{expense.title}</p>
                    <p className="text-xs font-extrabold text-brand">{formatCurrency(version?.amount ?? 0)}</p>
                  </div>
                  <p className="text-[11px] text-text-subtle mt-0.5">{expense.description}</p>
                </Link>
              );
            })}
            {!hasQuery ? <p className="text-xs text-text-subtle">Search expenses by title, category, or amount.</p> : null}
          </div>
        </div>

        {/* Payments Search */}
        <div className="rounded-[28px] bg-white p-6 border border-[#e8edf5] shadow-sm space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-text-subtle">Payments & Transactions</p>
          <div className="space-y-2.5">
            {matchingPayments.map((payment) => {
              const member = users.find((user) => user.id === payment.memberId);
              const expense = expenses.find((entry) => entry.id === payment.expenseId);
              return (
                <div key={payment.id} className="p-3.5 rounded-2xl bg-[#f8fafd] border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-text">{expense?.title}</p>
                    <p className="text-[10px] text-text-subtle">{member?.name} • Status: {payment.status}</p>
                  </div>
                  <p className="text-xs font-extrabold text-brand">{formatCurrency(payment.amount)}</p>
                </div>
              );
            })}
            {!hasQuery ? <p className="text-xs text-text-subtle">Search payments by member name or status.</p> : null}
          </div>
        </div>
      </section>

      <GPaySendMoneyModal
        isOpen={Boolean(payRecipient)}
        onClose={() => setPayRecipient(null)}
        recipient={payRecipient}
      />

      <GPayPayByPhoneModal
        isOpen={isPayByPhoneOpen}
        onClose={() => setIsPayByPhoneOpen(false)}
        initialPhone={phonePayInitial}
      />
    </div>
  );
}
