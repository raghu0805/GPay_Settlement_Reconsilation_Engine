import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiQrCode, HiSparkles, HiCamera, HiBolt } from 'react-icons/hi2';

export function GPayQrScannerModal({ isOpen, onClose, users, onSelectUserToPay }) {
  const [flashlight, setFlashlight] = useState(false);
  const [scannedUser, setScannedUser] = useState(null);

  if (!isOpen) return null;

  const handleSimulateScan = (user) => {
    setScannedUser(user);
    setTimeout(() => {
      onSelectUserToPay(user);
      onClose();
      setScannedUser(null);
    }, 900);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="relative w-full max-w-md overflow-hidden rounded-t-[32px] sm:rounded-[32px] bg-[#121316] text-white shadow-2xl border border-white/10 max-h-[92vh] overflow-y-auto"
        >
          {/* Top Drag Handle on Mobile */}
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-2 sm:hidden" />

          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shrink-0">
                <HiQrCode className="text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base">Scan any QR Code</h3>
                <p className="text-[10px] sm:text-xs text-white/60">GPay UPI & Merchant Scanner</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setFlashlight(!flashlight)}
                className={`p-2 rounded-full transition ${flashlight ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                title="Toggle Flashlight"
              >
                <HiBolt className="text-base" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              >
                <HiXMark className="text-base" />
              </button>
            </div>
          </div>

          {/* Scanner Camera Viewport */}
          <div className="relative flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-black/80 to-[#181a20]">
            {/* Viewfinder Frame */}
            <div className={`relative h-56 w-56 sm:h-64 sm:w-64 rounded-3xl border-2 transition-all duration-300 flex items-center justify-center overflow-hidden ${flashlight ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)]' : 'border-brand shadow-[0_0_30px_rgba(26,115,232,0.3)]'}`}>
              {/* Corner Markers */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-5 h-5 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-4 border-r-4 border-white rounded-br-lg" />

              {/* Animated Laser Scan Line */}
              <motion.div
                animate={{ y: [-100, 100, -100] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-3 right-3 h-1 bg-gradient-to-r from-transparent via-brand to-transparent shadow-[0_0_15px_#1a73e8]"
              />

              {/* Center icon or scanned feedback */}
              {scannedUser ? (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-2 p-3 bg-brand rounded-2xl text-white font-bold text-xs"
                >
                  <HiSparkles className="text-2xl animate-bounce" />
                  <span>Found {scannedUser.name}!</span>
                </motion.div>
              ) : (
                <div className="text-center text-white/50 text-[11px] px-4">
                  <HiCamera className="text-3xl mx-auto mb-1.5 opacity-40 animate-pulse" />
                  Point camera at GPay QR
                </div>
              )}
            </div>

            <p className="mt-3 text-[11px] text-white/70 text-center max-w-xs">
              Supports GPay, PhonePe, Paytm & Bank UPI QR Codes
            </p>

            {/* Quick Demo Scan Targets */}
            <div className="mt-5 w-full">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2.5 text-center">
                Tap contact to simulate instant scan:
              </p>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSimulateScan(user)}
                    className="flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 hover:bg-brand transition text-xs font-semibold text-white active:scale-95"
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20 text-[10px] font-bold">
                      {user.avatar}
                    </span>
                    <span>{user.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
