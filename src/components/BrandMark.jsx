import { motion } from 'framer-motion';

export function BrandMark({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_2px_10px_rgba(60,64,67,0.14)] border border-slate-100 overflow-hidden"
      >
        {/* Authentic Google G Pay Logo Simulation */}
        <div className="flex items-center justify-center text-xl font-black tracking-tighter">
          <span className="text-[#4285f4]">G</span>
          <span className="text-[#ea4335]">P</span>
          <span className="text-[#fbbc05]">a</span>
          <span className="text-[#34a853]">y</span>
        </div>
      </motion.div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-display text-lg font-extrabold tracking-tight text-text">
            {compact ? 'Google Pay' : 'Google Pay Engine'}
          </p>
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand uppercase tracking-wider">
            DSRE
          </span>
        </div>
        {!compact ? (
          <p className="text-xs text-text-subtle font-medium">Dynamic Settlement Reconciliation System</p>
        ) : (
          <p className="text-[11px] text-text-subtle font-medium">Settlement & Reconciliation Surface</p>
        )}
      </div>
    </div>
  );
}
