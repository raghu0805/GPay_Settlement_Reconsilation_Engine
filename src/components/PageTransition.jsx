import { motion } from 'framer-motion';

export function PageTransition({ children }) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
