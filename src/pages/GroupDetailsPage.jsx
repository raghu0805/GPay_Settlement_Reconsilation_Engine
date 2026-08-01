import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { HiEnvelope, HiPlus, HiUserPlus, HiBanknotes, HiSparkles } from 'react-icons/hi2';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { ExpenseCard } from '../components/ExpenseCard';
import { GroupGlyph } from '../components/GroupGlyph';
import { ModalShell } from '../components/ModalShell';
import { ProgressRing } from '../components/ProgressRing';
import { SectionHeader } from '../components/SectionHeader';
import { StatusPill } from '../components/StatusPill';
import { VersionTimeline } from '../components/VersionTimeline';
import { useAppData } from '../hooks/useAppData';
import { calculateGroupBalances, getExpenseVersions } from '../services/reconciliation';
import { formatCurrency } from '../utils/formatters';
import { GPaySendMoneyModal } from '../components/GPaySendMoneyModal';

const tabs = [
  { id: 'expenses', label: 'Expenses' },
  { id: 'members', label: 'Members' },
  { id: 'balances', label: 'Balances Table' },
  { id: 'activity', label: 'Activity' },
  { id: 'invite', label: 'Invite Member' },
];

export function GroupDetailsPage() {
  const { groupId } = useParams();
  const {
    activityLogs,
    createExpenseVersion,
    expenseVersions,
    expenses,
    getCurrentVersion,
    groups,
    inviteMember,
    payments,
    users,
  } = useAppData();

  const [activeTab, setActiveTab] = useState('expenses');
  const [editingExpense, setEditingExpense] = useState(null);
  const [historyExpense, setHistoryExpense] = useState(null);
  const [payRecipient, setPayRecipient] = useState(null);

  const [editAmount, setEditAmount] = useState('');
  const [editReason, setEditReason] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  const group = groups.find((entry) => entry.id === groupId);

  useEffect(() => {
    if (!editingExpense) {
      return;
    }
    const version = expenseVersions.find((entry) => entry.id === editingExpense.currentVersionId);
    setEditAmount(String(version?.amount ?? ''));
    setEditReason('');
  }, [editingExpense, expenseVersions]);

  if (!group) {
    return <Navigate replace to="/not-found" />;
  }

  const groupExpenses = expenses.filter((expense) => expense.groupId === group.id);
  const groupBalances = calculateGroupBalances(group, expenses, expenseVersions, payments, users);
  const groupActivity = activityLogs
    .filter((item) => item.groupId === group.id)
    .sort((left, right) => new Date(right.date) - new Date(left.date));

  const outstandingBalance = groupBalances.reduce((total, row) => total + row.remaining, 0);
  const refundBalance = groupBalances.reduce((total, row) => total + row.refund, 0);
  const settledMembers = groupBalances.filter((row) => row.status === 'paid').length;
  const settlementProgress = Math.round((settledMembers / (groupBalances.length || 1)) * 100);

  const handleVersionCreate = (event) => {
    event.preventDefault();
    if (!editingExpense) return;

    createExpenseVersion(editingExpense.id, {
      amount: Number(editAmount),
      reason: editReason || 'Version update',
    });
    setEditingExpense(null);
  };

  const handleInvite = (event) => {
    event.preventDefault();
    if (!inviteEmail) return;

    inviteMember(group.id, inviteEmail);
    setInviteMessage(`Invite drafted for ${inviteEmail}`);
    setInviteEmail('');
  };

  return (
    <div className="space-y-6 pb-6">
      <SectionHeader
        badge="Group Workspace"
        description={group.description}
        title={group.name}
        actions={
          <>
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 text-xs font-bold text-text hover:bg-gray-50 transition"
              to="/groups"
            >
              Back to Groups
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 text-xs font-bold text-white shadow-md shadow-brand/20 hover:bg-[#1669d1] transition"
              to="/expenses/new"
            >
              <HiPlus className="text-base" />
              Add Expense
            </Link>
          </>
        }
      />

      {/* Group Header Hero Card */}
      <section className="rounded-[30px] bg-white p-6 border border-[#e8edf5] shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="flex items-start gap-4">
            <div
              className="grid h-16 w-16 place-items-center rounded-2xl text-3xl text-white font-extrabold shadow-md shrink-0"
              style={{ background: `linear-gradient(135deg, ${group.accent}, #4285f4)` }}
            >
              <GroupGlyph icon={group.icon} />
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status="expense-updated" />
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
                  DSRE Engine Sync
                </span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-text-subtle">
                This Google Pay group pod synchronizes member splits and handles version changes automatically without altering past payment history.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-[#eef4ff] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">Outstanding</p>
                  <p className="mt-1 font-display text-lg font-extrabold text-text">
                    {formatCurrency(outstandingBalance)}
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Refunds</p>
                  <p className="mt-1 font-display text-lg font-extrabold text-emerald-800">
                    {formatCurrency(refundBalance)}
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-100 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">Members</p>
                  <p className="mt-1 font-display text-lg font-extrabold text-text">
                    {group.memberIds.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#f8fafd] p-5 border border-gray-100 flex flex-col justify-center">
            <ProgressRing
              label="Settlement Completion"
              sublabel={`${settledMembers} of ${groupBalances.length} members fully settled`}
              value={settlementProgress}
            />
          </div>
        </div>
      </section>

      {/* Tabs Bar */}
      <section className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-brand text-white shadow-md shadow-brand/20'
                : 'bg-white text-text-subtle hover:bg-slate-100 hover:text-text border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {/* Tab: Expenses */}
      {activeTab === 'expenses' ? (
        <section className="space-y-4">
          {groupExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              creator={users.find((user) => user.id === expense.createdBy)}
              currentVersion={getCurrentVersion(expense)}
              expense={expense}
              onEdit={setEditingExpense}
              onHistory={setHistoryExpense}
            />
          ))}
        </section>
      ) : null}

      {/* Tab: Members */}
      {activeTab === 'members' ? (
        <section className="grid gap-4 md:grid-cols-2">
          {groupBalances.map((row) => {
            const progress = row.shouldPay ? Math.min((row.paid / row.shouldPay) * 100, 100) : 100;

            return (
              <div key={row.member.id} className="rounded-[28px] bg-white p-5 border border-[#e8edf5] shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-sm font-bold text-white shadow-sm">
                      {row.member.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-text">{row.member.name}</h4>
                      <p className="text-xs text-text-subtle">{row.member.role}</p>
                    </div>
                  </div>
                  <StatusPill status={row.status} />
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-text-subtle">Paid: <strong className="text-text">{formatCurrency(row.paid)}</strong></span>
                  <span className="text-text-subtle">Due: <strong className="text-amber-600">{formatCurrency(row.remaining)}</strong></span>
                </div>

                {row.remaining > 0 ? (
                  <button
                    type="button"
                    onClick={() => setPayRecipient(row.member)}
                    className="w-full h-10 rounded-full bg-brand/10 hover:bg-brand text-brand hover:text-white font-bold text-xs transition flex items-center justify-center gap-2"
                  >
                    <HiBanknotes className="text-base" /> Settle {formatCurrency(row.remaining)} via GPay
                  </button>
                ) : (
                  <div className="w-full h-10 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5">
                    <HiSparkles className="text-base" /> Fully Settled
                  </div>
                )}
              </div>
            );
          })}
        </section>
      ) : null}

      {/* Tab: Balances Table */}
      {activeTab === 'balances' ? (
        <section className="rounded-[28px] bg-white p-6 border border-[#e8edf5] shadow-sm overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-text-subtle uppercase tracking-wider font-bold">
                  <th className="pb-3">Member</th>
                  <th className="pb-3">Paid</th>
                  <th className="pb-3">Should Pay</th>
                  <th className="pb-3">Remaining</th>
                  <th className="pb-3">Refund</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groupBalances.map((row) => (
                  <tr key={row.member.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 font-bold text-text">{row.member.name}</td>
                    <td className="py-3.5 text-text-subtle">{formatCurrency(row.paid)}</td>
                    <td className="py-3.5 text-text-subtle">{formatCurrency(row.shouldPay)}</td>
                    <td className="py-3.5 text-amber-600 font-bold">{formatCurrency(row.remaining)}</td>
                    <td className="py-3.5 text-brand font-bold">{formatCurrency(row.refund)}</td>
                    <td className="py-3.5"><StatusPill status={row.status} /></td>
                    <td className="py-3.5">
                      {row.remaining > 0 ? (
                        <button
                          type="button"
                          onClick={() => setPayRecipient(row.member)}
                          className="px-3 py-1.5 rounded-full bg-brand text-white text-[11px] font-bold hover:bg-[#1669d1] transition"
                        >
                          Pay
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold text-[11px]">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Tab: Activity */}
      {activeTab === 'activity' ? (
        <section className="rounded-[28px] bg-white p-6 border border-[#e8edf5] shadow-sm">
          <ActivityTimeline items={groupActivity} users={users} />
        </section>
      ) : null}

      {/* Tab: Invite Member */}
      {activeTab === 'invite' ? (
        <section className="rounded-[28px] bg-white p-6 border border-[#e8edf5] shadow-sm">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand">Invite Member</p>
              <h2 className="mt-1 text-xl font-extrabold text-text">Add member to group</h2>
              <p className="mt-2 text-xs text-text-subtle leading-relaxed">
                Invite team members via email address to join this group expense pod and participate in splits.
              </p>
            </div>
            <form className="space-y-4" onSubmit={handleInvite}>
              <div>
                <label className="block text-xs font-bold text-text mb-1.5">Email address</label>
                <div className="relative">
                  <HiEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-text-subtle" />
                  <input
                    className="w-full h-12 rounded-full border border-gray-200 bg-[#f8fafd] pl-11 pr-4 text-xs font-medium outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="colleague@googlepay.dev"
                    type="email"
                    value={inviteEmail}
                  />
                </div>
              </div>
              <button
                className="w-full h-11 rounded-full bg-brand text-white font-bold text-xs shadow-md hover:bg-[#1669d1] transition flex items-center justify-center gap-2"
                type="submit"
              >
                <HiUserPlus className="text-base" /> Send Group Invitation
              </button>
              {inviteMessage ? (
                <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                  {inviteMessage}
                </p>
              ) : null}
            </form>
          </div>
        </section>
      ) : null}

      {/* Modals */}
      <ModalShell
        description="Editing creates a brand new immutable version and never overwrites the previous record."
        isOpen={Boolean(editingExpense)}
        onClose={() => setEditingExpense(null)}
        title={editingExpense ? `Edit ${editingExpense.title}` : 'Edit expense'}
      >
        {editingExpense ? (
          <form className="space-y-4" onSubmit={handleVersionCreate}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-text">New amount</span>
                <input
                  className="w-full h-12 rounded-full border border-gray-200 bg-[#f8fafd] px-4 text-xs font-semibold outline-none focus:border-brand"
                  min="1"
                  onChange={(event) => setEditAmount(event.target.value)}
                  step="0.01"
                  type="number"
                  value={editAmount}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-text">Reason</span>
                <input
                  className="w-full h-12 rounded-full border border-gray-200 bg-[#f8fafd] px-4 text-xs font-semibold outline-none focus:border-brand"
                  onChange={(event) => setEditReason(event.target.value)}
                  placeholder="Reason for adjustment"
                  value={editReason}
                />
              </label>
            </div>
            <button className="w-full h-12 rounded-full bg-brand text-white font-bold text-xs shadow-md hover:bg-[#1669d1] transition" type="submit">
              Create New Version
            </button>
          </form>
        ) : null}
      </ModalShell>

      <ModalShell
        description="Every version is timestamped, attributed, and preserved for comparison."
        isOpen={Boolean(historyExpense)}
        onClose={() => setHistoryExpense(null)}
        title={historyExpense ? `${historyExpense.title} Version History` : 'Version history'}
      >
        {historyExpense ? (
          <VersionTimeline
            currentVersionId={historyExpense.currentVersionId}
            users={users}
            versions={getExpenseVersions(historyExpense.id, expenseVersions)}
          />
        ) : null}
      </ModalShell>

      <GPaySendMoneyModal
        isOpen={Boolean(payRecipient)}
        onClose={() => setPayRecipient(null)}
        recipient={payRecipient}
      />
    </div>
  );
}
