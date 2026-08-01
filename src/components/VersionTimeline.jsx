import { formatCurrency, formatDateTime } from '../utils/formatters';

export function VersionTimeline({ versions, users, currentVersionId }) {
  const userMap = Object.fromEntries(users.map((user) => [user.id, user]));

  return (
    <div className="relative ml-2 border-l border-brand/12 pl-6">
      {versions.map((version, index) => (
        <div className="relative pb-6 last:pb-0" key={version.id}>
          <span className="absolute -left-[34px] top-2 h-4 w-4 rounded-full border-4 border-white bg-brand shadow-[0_0_0_6px_rgba(26,115,232,0.10)]" />
          <div className={`soft-card p-4 ${currentVersionId === version.id ? 'border-brand/25 bg-brand/4' : ''}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold tracking-[-0.03em] text-text">
                  Version {version.versionNumber}
                </p>
                <p className="mt-1 text-sm text-text-subtle">{version.reason}</p>
              </div>
              <p className="font-display text-xl font-semibold tracking-[-0.03em] text-text">
                {formatCurrency(version.amount)}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-subtle">
              <span>{formatDateTime(version.date)}</span>
              <span>Edited by {userMap[version.editorId]?.name}</span>
              {index < versions.length - 1 ? <span>Immutable payment trail preserved</span> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
