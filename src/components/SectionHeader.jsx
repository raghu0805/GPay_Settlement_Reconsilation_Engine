export function SectionHeader({ badge, title, description, actions }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2.5">
        {badge ? (
          <span className="inline-flex rounded-full bg-[#e9f1ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">
            {badge}
          </span>
        ) : null}
        <h1 className="section-title">{title}</h1>
        {description ? <p className="max-w-2xl text-sm leading-6 text-text-subtle lg:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
