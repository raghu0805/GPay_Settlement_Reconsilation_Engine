import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function QuickActionCard({ to, title, description, icon: Icon }) {
  return (
    <motion.div whileHover={{ y: -4 }}>
      <Link
        className="soft-card flex h-full flex-col gap-4 p-4 transition duration-200 hover:border-brand/20 hover:bg-[#fbfdff]"
        to={to}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f0fe] text-brand">
          <Icon className="text-xl" />
        </div>
        <div>
          <p className="font-display text-[15px] font-semibold tracking-[-0.02em] text-text">{title}</p>
          <p className="mt-1 text-[13px] leading-5 text-text-subtle">{description}</p>
        </div>
      </Link>
    </motion.div>
  );
}
