import { useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { StatusPill } from '../components/StatusPill';
import { useAppData } from '../hooks/useAppData';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { GPaySendMoneyModal } from '../components/GPaySendMoneyModal';
import { HiCheck, HiXMark, HiBanknotes } from 'react-icons/hi2';

export function NotificationsPage() {
  const { markNotificationRead, notifications, refundRequests, setRefundStatus, users } = useAppData();
  const [filter, setFilter] = useState('all');
  const [payRecipient, setPayRecipient] = useState(null);

  const visibleNotifications =
    filter === 'unread'
      ? notifications.filter((notification) => !notification.read)
      : notifications;

  return (
    <div className="space-y-6 pb-6">
      <SectionHeader
        badge="Notification Center"
        description="Keep payment requests, refund approvals, expense version changes, and settlement events in one place."
        title="Notifications & Approval Queue"
        actions={
          <div className="flex gap-2">
            {['all', 'unread'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  filter === option
                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                    : 'bg-white text-text-subtle border border-gray-200 hover:bg-slate-50'
                }`}
              >
                {option[0].toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        }
      />

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {visibleNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-[28px] p-5 border shadow-sm transition ${
                notification.read
                  ? 'bg-white border-[#e8edf5]'
                  : 'bg-brand/5 border-brand/30 shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base text-text">{notification.title}</h3>
                    <StatusPill status={notification.type} />
                  </div>
                  <p className="text-xs text-text-subtle leading-relaxed">{notification.message}</p>
                </div>
                {!notification.read ? (
                  <button
                    type="button"
                    onClick={() => markNotificationRead(notification.id)}
                    className="px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-text-subtle hover:text-brand hover:border-brand/40 transition shrink-0"
                  >
                    Mark Read
                  </button>
                ) : null}
              </div>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-text-subtle">
                {formatDateTime(notification.date)}
              </p>
            </div>
          ))}
        </div>

        {/* Refund Approval Queue */}
        <div className="rounded-[30px] bg-white p-6 border border-[#e8edf5] shadow-sm space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand">Refund Requests</p>
            <h2 className="text-xl font-extrabold text-text mt-1">Approval Queue</h2>
          </div>

          <div className="space-y-3">
            {refundRequests.map((refund) => {
              const sender = users.find((user) => user.id === refund.senderId);
              const receiver = users.find((user) => user.id === refund.receiverId);

              return (
                <div key={refund.id} className="rounded-2xl border border-gray-100 bg-[#f8fafd] p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-text">
                        {sender?.name} → {receiver?.name}
                      </p>
                      <p className="text-[10px] text-text-subtle">{formatDateTime(refund.date)}</p>
                    </div>
                    <StatusPill status={refund.status} />
                  </div>

                  <p className="font-display text-2xl font-extrabold text-text">
                    {formatCurrency(refund.amount)}
                  </p>

                  {refund.status === 'pending' ? (
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setRefundStatus(refund.id, 'approved')}
                        className="flex-1 h-9 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-1"
                      >
                        <HiCheck /> Approve Refund
                      </button>
                      <button
                        type="button"
                        onClick={() => setRefundStatus(refund.id, 'rejected')}
                        className="h-9 px-3.5 rounded-full bg-gray-200 text-text-subtle text-xs font-bold hover:bg-gray-300 transition flex items-center justify-center gap-1"
                      >
                        <HiXMark /> Reject
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
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
