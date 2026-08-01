import { motion } from 'framer-motion';

export function StatCard({ title, value, caption, icon: Icon, tone = 'brand' }) {
  const toneMap = {
    brand: 'bg-[#e8f0fe] text-brand',
    success: 'bg-[#e6f4ea] text-success',
    warning: 'bg-[#fef7e0] text-[#a57100]',
    danger: 'bg-[#fce8e6] text-danger',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="page-card flex min-h-[128px] flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label">{title}</p>
          <p className="mt-3 font-display text-[2rem] font-semibold tracking-[-0.04em] text-text">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${toneMap[tone]}`}>
          <Icon className="text-xl" />
        </div>
      </div>
      <p className="text-[13px] leading-5 text-text-subtle">{caption}</p>
    </motion.div>
  );
}
