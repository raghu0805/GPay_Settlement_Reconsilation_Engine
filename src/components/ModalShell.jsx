import { AnimatePresence, motion } from 'framer-motion';
import { HiXMark } from 'react-icons/hi2';

export function ModalShell({ isOpen, title, description, children, onClose }) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#10213c]/40 p-0 sm:p-4 backdrop-blur-sm"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-2xl rounded-t-[32px] sm:rounded-[32px] bg-white p-5 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto"
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-xl sm:text-2xl font-bold tracking-tight text-text">{title}</p>
                {description ? <p className="mt-1 text-xs sm:text-sm text-text-subtle leading-relaxed">{description}</p> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-text-subtle hover:bg-slate-200 transition shrink-0"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>
            <div className="mt-5">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
