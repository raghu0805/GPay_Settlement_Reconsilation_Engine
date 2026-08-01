import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowLeft, HiEllipsisVertical, HiSparkles, HiGift, HiXMark, HiChevronRight, HiExclamationTriangle } from 'react-icons/hi2';
import { formatCurrency } from '../utils/formatters';

export function GPayChatThreadModal({ isOpen, onClose, contact, onPayClick, onRequestClick, onScratchClick }) {
  const [message, setMessage] = useState('');

  if (!isOpen || !contact) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="relative w-full max-w-md overflow-hidden rounded-t-[32px] sm:rounded-[32px] bg-[#f8f9fa] shadow-2xl border border-gray-200 flex flex-col h-[90vh] sm:h-[650px]"
        >
          {/* Top Header matching Reference Image 1 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 text-text-subtle transition"
              >
                <HiArrowLeft className="text-xl" />
              </button>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-brand text-white font-bold text-sm overflow-hidden shrink-0">
                {contact.image ? (
                  <img src={contact.image} alt={contact.name} className="h-full w-full object-cover" />
                ) : (
                  contact.avatar || contact.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-text text-sm truncate">{contact.name}</h3>
                <p className="text-[11px] text-text-subtle truncate">{contact.phone || contact.upiId}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button type="button" className="p-2 rounded-full hover:bg-slate-100 text-text-subtle">
                <HiEllipsisVertical className="text-xl" />
              </button>
            </div>
          </div>

          {/* Chat Timeline Stream matching Reference Image 1 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#f0f4f9] to-[#f8f9fa]">
            <div className="text-center my-2">
              <span className="rounded-full bg-gray-200/70 px-3 py-1 text-[10px] font-bold text-text-subtle">
                27 November 2026
              </span>
            </div>

            {/* Card 1: Payment Failed Card */}
            <div className="mx-auto max-w-xs rounded-2xl bg-white p-4 shadow-sm border border-gray-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-600 flex items-center gap-1">
                  <HiExclamationTriangle /> Payment of ₹ 3,142 failed
                </span>
                <HiChevronRight className="text-text-subtle" />
              </div>
              <p className="text-[10px] text-text-subtle">12 November • Bank Server Busy</p>
            </div>

            {/* Card 2: Successful Paid Card (Ref Image 1) */}
            <div className="mx-auto max-w-xs rounded-2xl bg-white p-5 shadow-md border border-gray-100 text-center space-y-2">
              <p className="text-3xl font-extrabold text-text">₹ 37,142</p>
              <div className="flex items-center justify-center gap-1 text-xs text-emerald-600 font-bold">
                <span>Paid • 27 November</span>
                <HiChevronRight />
              </div>
            </div>

            {/* Card 3: Earned Scratch Card Reward Badge (Ref Image 1) */}
            <button
              type="button"
              onClick={onScratchClick}
              className="mx-auto max-w-xs w-full rounded-full bg-brand/10 hover:bg-brand/20 border border-brand/20 p-3 text-xs font-bold text-brand flex items-center justify-center gap-2 transition"
            >
              <span>You earned scratch card! 💳</span>
              <span className="rounded-full bg-brand text-white px-2 py-0.5 text-[10px]">Claim</span>
            </button>
          </div>

          {/* Bottom Chat Bar matching Reference Image 1 */}
          <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPayClick(contact)}
              className="h-10 px-5 rounded-full bg-brand text-white font-bold text-xs hover:bg-[#1669d1] transition shadow-md shrink-0"
            >
              Pay
            </button>
            <button
              type="button"
              onClick={() => onRequestClick(contact)}
              className="h-10 px-4 rounded-full bg-[#e8f0fe] text-brand font-bold text-xs hover:bg-brand/20 transition shrink-0"
            >
              Request
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type.. 🎁"
                className="w-full h-10 rounded-full bg-[#f1f4f9] px-4 pr-9 text-xs text-text outline-none focus:ring-2 focus:ring-brand/20"
              />
              <button
                type="button"
                onClick={onScratchClick}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand text-lg"
              >
                🎁
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
