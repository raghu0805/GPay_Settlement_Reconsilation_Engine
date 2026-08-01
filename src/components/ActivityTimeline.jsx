import { formatDateTime } from '../utils/formatters';

export function ActivityTimeline({ items, users }) {
  const userMap = Object.fromEntries(users.map((user) => [user.id, user]));

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div className="flex gap-4" key={item.id}>
          <div className="mt-1 h-3 w-3 rounded-full bg-brand shadow-[0_0_0_6px_rgba(26,115,232,0.10)]" />
          <div className="min-w-0 flex-1 rounded-3xl border border-[#e8eef8] bg-white/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-text">{item.type}</p>
              <p className="text-xs text-text-subtle">{formatDateTime(item.date)}</p>
            </div>
            <p className="mt-1 text-sm text-text-subtle">{item.description}</p>
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-text-subtle">
              {userMap[item.actorId]?.name}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
