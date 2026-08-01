import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCheckCircle, HiSparkles, HiReceiptPercent } from 'react-icons/hi2';
import { SectionHeader } from '../components/SectionHeader';
import { useAppData } from '../hooks/useAppData';
import { formatCurrency, formatPercent } from '../utils/formatters';

function buildDefaultAllocations(splitType, memberIds, amount) {
  if (splitType === 'percentage') {
    const even = Number((100 / memberIds.length).toFixed(2));
    return memberIds.map((memberId, index) => ({
      memberId,
      value: index === memberIds.length - 1 ? Number((100 - even * index).toFixed(2)) : even,
    }));
  }

  if (splitType === 'custom') {
    const even = Number((amount / memberIds.length).toFixed(2));
    return memberIds.map((memberId, index) => ({
      memberId,
      value: index === memberIds.length - 1 ? Number((amount - even * index).toFixed(2)) : even,
    }));
  }

  return [];
}

export function CreateExpensePage() {
  const { addExpense, groups, users } = useAppData();
  const navigate = useNavigate();
  const defaultGroup = groups[0];
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    groupId: defaultGroup.id,
    title: '',
    description: '',
    category: 'Operations',
    amount: '5200',
    splitType: 'equal',
    memberIds: defaultGroup.memberIds,
    date: today,
  });
  const [allocations, setAllocations] = useState(buildDefaultAllocations('equal', defaultGroup.memberIds, 5200));
  const [error, setError] = useState('');

  const selectedGroup = groups.find((group) => group.id === form.groupId) ?? defaultGroup;
  const selectedMembers = users.filter((user) => form.memberIds.includes(user.id));
  const amount = Number(form.amount || 0);

  const handleGroupChange = (groupId) => {
    const group = groups.find((entry) => entry.id === groupId);
    if (!group) return;

    setForm((current) => ({ ...current, groupId, memberIds: group.memberIds }));
    setAllocations(buildDefaultAllocations(form.splitType, group.memberIds, amount || 0));
  };

  const handleSplitTypeChange = (splitType) => {
    setForm((current) => ({ ...current, splitType }));
    setAllocations(buildDefaultAllocations(splitType, form.memberIds, amount || 0));
  };

  const handleMemberToggle = (memberId) => {
    const nextMembers = form.memberIds.includes(memberId)
      ? form.memberIds.filter((id) => id !== memberId)
      : [...form.memberIds, memberId];

    if (nextMembers.length < 2) return;

    setForm((current) => ({ ...current, memberIds: nextMembers }));
    setAllocations(buildDefaultAllocations(form.splitType, nextMembers, amount || 0));
  };

  const handleAllocationChange = (memberId, value) => {
    setAllocations((current) =>
      current.map((entry) => (entry.memberId === memberId ? { ...entry, value: Number(value) } : entry)),
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.splitType === 'percentage') {
      const totalPercent = allocations.reduce((total, entry) => total + Number(entry.value), 0);
      if (Math.abs(totalPercent - 100) > 0.5) {
        setError('Percentage split must total 100%.');
        return;
      }
    }

    if (form.splitType === 'custom') {
      const totalAmount = allocations.reduce((total, entry) => total + Number(entry.value), 0);
      if (Math.abs(totalAmount - amount) > 1) {
        setError('Custom split must match total amount.');
        return;
      }
    }

    const expenseId = addExpense({
      ...form,
      amount,
      allocations,
    });

    navigate(`/groups/${form.groupId}`, { replace: true, state: { createdExpenseId: expenseId } });
  };

  return (
    <div className="space-y-6 pb-6">
      <SectionHeader
        badge="GPay Split Engine"
        description="Capture a new group expense with equal, percentage, or custom split logic."
        title="Add & Split Expense"
      />

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <form className="rounded-[30px] bg-white p-6 border border-[#e8edf5] shadow-sm space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-text">Group Pod</span>
              <select
                className="w-full h-12 rounded-full border border-gray-200 bg-[#f8fafd] px-4 text-xs font-bold text-text outline-none focus:border-brand"
                onChange={(event) => handleGroupChange(event.target.value)}
                value={form.groupId}
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-text">Category</span>
              <select
                className="w-full h-12 rounded-full border border-gray-200 bg-[#f8fafd] px-4 text-xs font-bold text-text outline-none focus:border-brand"
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                value={form.category}
              >
                <option>Operations</option>
                <option>Meals</option>
                <option>Travel</option>
                <option>Marketing</option>
                <option>Research</option>
                <option>Events</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-text">Expense Title</span>
              <input
                className="w-full h-12 rounded-full border border-gray-200 bg-[#f8fafd] px-4 text-xs font-semibold text-text outline-none focus:border-brand"
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="e.g. Launch Dinner / Taxi claim"
                value={form.title}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-text">Date</span>
              <input
                className="w-full h-12 rounded-full border border-gray-200 bg-[#f8fafd] px-4 text-xs font-semibold text-text outline-none focus:border-brand"
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                type="date"
                value={form.date}
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-text">Description</span>
            <textarea
              className="w-full h-24 rounded-2xl border border-gray-200 bg-[#f8fafd] p-4 text-xs font-medium text-text outline-none focus:border-brand"
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Add details for team context..."
              value={form.description}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-text">Total Amount (₹)</span>
              <input
                className="w-full h-12 rounded-full border border-gray-200 bg-[#f8fafd] px-4 text-sm font-extrabold text-brand outline-none focus:border-brand"
                min="1"
                onChange={(event) => {
                  const nextAmount = event.target.value;
                  setForm((current) => ({ ...current, amount: nextAmount }));
                  if (form.splitType !== 'custom') {
                    setAllocations(buildDefaultAllocations(form.splitType, form.memberIds, Number(nextAmount || 0)));
                  }
                }}
                step="0.01"
                type="number"
                value={form.amount}
              />
            </label>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-text">Split Mode</span>
              <div className="grid grid-cols-3 gap-1.5">
                {['equal', 'custom', 'percentage'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleSplitTypeChange(type)}
                    className={`h-12 rounded-full border text-xs font-bold transition capitalize ${
                      form.splitType === type
                        ? 'border-brand bg-brand text-white shadow-sm'
                        : 'border-gray-200 bg-white text-text-subtle hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-text">Select Group Members</span>
              <span className="text-brand">{selectedMembers.length} active</span>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {selectedGroup.memberIds.map((memberId) => {
                const member = users.find((user) => user.id === memberId);
                const isSelected = form.memberIds.includes(memberId);

                return (
                  <button
                    key={memberId}
                    type="button"
                    onClick={() => handleMemberToggle(memberId)}
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-brand bg-brand/10 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                      {member.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-text truncate">{member.name}</p>
                      <p className="text-[10px] text-text-subtle truncate">{member.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">{error}</p> : null}

          <button
            type="submit"
            className="w-full h-12 rounded-full bg-brand text-white font-bold text-xs shadow-md shadow-brand/20 hover:bg-[#1669d1] transition flex items-center justify-center gap-2"
          >
            <HiCheckCircle className="text-lg" />
            Create & Split Expense
          </button>
        </form>

        <div className="space-y-4">
          <div className="rounded-[30px] bg-white p-6 border border-[#e8edf5] shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand">
                <HiReceiptPercent className="text-2xl" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand">Live Split Preview</p>
                <h2 className="text-xl font-extrabold text-text mt-0.5">
                  {form.title || 'Untitled Expense'}
                </h2>
              </div>
            </div>

            <p className="text-xs text-text-subtle leading-relaxed">
              {form.description || 'Add context so members understand the expense breakdown.'}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-2xl bg-[#f8fafd] p-4 border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">Amount</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-brand">
                  {formatCurrency(amount)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f8fafd] p-4 border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">Split Mode</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-text capitalize">
                  {form.splitType}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
