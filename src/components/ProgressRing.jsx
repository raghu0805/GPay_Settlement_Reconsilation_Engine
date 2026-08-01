export function ProgressRing({ value, size = 88, stroke = 10, label, sublabel, tone = '#1A73E8' }) {
  const angle = Math.min(Math.max(value, 0), 100) * 3.6;

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative grid place-items-center rounded-full bg-white"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${tone} ${angle}deg, rgba(210, 223, 244, 0.7) ${angle}deg)`,
        }}
      >
        <div
          className="grid place-items-center rounded-full bg-white text-center"
          style={{ width: size - stroke * 2, height: size - stroke * 2 }}
        >
          <span className="font-display text-lg font-semibold text-text">{Math.round(value)}%</span>
        </div>
      </div>
      <div>
        <p className="font-semibold text-text">{label}</p>
        {sublabel ? <p className="text-sm text-text-subtle">{sublabel}</p> : null}
      </div>
    </div>
  );
}
