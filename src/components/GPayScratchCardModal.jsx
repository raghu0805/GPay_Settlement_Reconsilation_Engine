import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiSparkles, HiGift, HiTrophy } from 'react-icons/hi2';

export function GPayScratchCardModal({ isOpen, onClose }) {
  const [scratched, setScratched] = useState(false);
  const rewards = [
    { amount: '₹150 Cashback', desc: 'DSRE Settlement Special Bonus credited to Bank Account!' },
    { amount: '₹250 Voucher', desc: 'Google Pay Merchant Pass Cashback reward' },
    { amount: '₹100 Instant Discount', desc: 'Applied on next group expense split' },
  ];
  const [reward] = useState(() => rewards[Math.floor(Math.random() * rewards.length)]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="relative w-full max-w-sm overflow-hidden rounded-t-[36px] sm:rounded-[36px] bg-gradient-to-b from-[#1a73e8] to-[#0b57d0] p-5 sm:p-6 text-white text-center shadow-2xl max-h-[92vh] overflow-y-auto"
        >
          {/* Top Drag Indicator on Mobile */}
          <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-2 sm:hidden" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <HiXMark className="text-xl" />
          </button>

          <div className="pt-1 pb-3 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-yellow-300">
              <HiTrophy /> Google Pay Rewards
            </div>
            <h3 className="text-xl sm:text-2xl font-black mt-1">You earned a Scratch Card!</h3>
            <p className="text-xs text-white/80">Tap to scratch and reveal your reward</p>
          </div>

          {/* Scratch Area */}
          <div className="my-3 relative h-48 sm:h-56 w-full rounded-3xl overflow-hidden shadow-inner flex items-center justify-center border-4 border-white/20">
            {scratched ? (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="h-full w-full bg-white text-text flex flex-col items-center justify-center p-5 text-center space-y-2"
              >
                <div className="grid h-14 w-14 place-items-center rounded-full bg-yellow-400 text-black shadow-lg animate-bounce">
                  <HiSparkles className="text-2xl" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand">Congratulations!</p>
                  <h4 className="text-2xl sm:text-3xl font-black text-text mt-0.5">{reward.amount}</h4>
                  <p className="text-xs text-text-subtle mt-1">{reward.desc}</p>
                </div>
              </motion.div>
            ) : (
              <button
                type="button"
                onClick={() => setScratched(true)}
                className="h-full w-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 text-black font-extrabold flex flex-col items-center justify-center p-5 cursor-pointer hover:opacity-95 transition group active:scale-98"
              >
                <HiGift className="text-5xl text-white drop-shadow-md group-hover:scale-110 transition-transform" />
                <span className="mt-2 text-base font-extrabold text-white tracking-wide">TAP TO SCRATCH</span>
                <span className="text-[10px] text-black/70 font-normal mt-0.5">Unlock instant GPay cashback</span>
              </button>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full h-12 rounded-full bg-white text-brand font-bold text-xs sm:text-sm shadow-lg hover:bg-slate-100 transition active:scale-95"
            >
              {scratched ? 'Claim Reward' : 'Scratch Later'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
