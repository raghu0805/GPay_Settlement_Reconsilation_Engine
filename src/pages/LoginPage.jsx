import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiXMark, HiCheckCircle } from 'react-icons/hi2';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from ?? '/';

  const handleKeypadPress = (val) => {
    if (val === 'back') {
      setPin((prev) => prev.slice(0, -1));
      setError('');
    } else if (pin.length < 4) {
      const nextPin = pin + val;
      setPin(nextPin);
      setError('');

      if (nextPin.length === 4) {
        setTimeout(() => {
          login();
          navigate(redirectPath, { replace: true });
        }, 200);
      }
    }
  };

  const handleQuickUnlock = () => {
    login();
    navigate(redirectPath, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#121316] text-white flex flex-col items-center justify-between p-6 select-none font-sans">
      {/* Top Header */}
      <div className="w-full max-w-sm flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => handleKeypadPress('back')}
          className="p-2 rounded-full hover:bg-white/10 text-white/80 transition"
        >
          ←
        </button>
        <div className="flex items-center gap-1 font-bold text-lg">
          <span className="text-[#4285f4]">G</span>
          <span className="text-[#ea4335]">P</span>
          <span className="text-[#fbbc05]">a</span>
          <span className="text-[#34a853]">y</span>
        </div>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-white/10 text-white/80 text-lg transition"
        >
          ⋮
        </button>
      </div>

      {/* Main Lock Display matching Reference Image 1 */}
      <div className="w-full max-w-sm text-center my-auto space-y-6">
        {/* Google Colorful G Logo */}
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white shadow-lg text-2xl font-black">
          <span className="text-[#4285f4]">G</span>
        </div>

        <div className="space-y-1">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">ENTER GOOGLE PIN</h2>
          <p className="text-xs text-white/60">melissa.mor@gmail.com</p>
        </div>

        {/* 4 PIN Dots ○ ○ ○ ○ */}
        <div className="flex items-center justify-center gap-4 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`h-4 w-4 rounded-full border-2 transition-all duration-200 ${
                pin.length > idx
                  ? 'bg-white border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.8)]'
                  : 'border-white/40 bg-transparent'
              }`}
            />
          ))}
        </div>

        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
      </div>

      {/* 3x4 Dark Keypad matching Reference Image 1 */}
      <div className="w-full max-w-xs space-y-6 pb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeypadPress(num)}
              className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-2xl font-semibold text-white transition flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleKeypadPress('back')}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-xl font-bold text-white/70 transition flex items-center justify-center active:scale-95"
          >
            ⌫
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-2xl font-semibold text-white transition flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleQuickUnlock}
            className="h-14 rounded-2xl bg-brand hover:bg-[#1669d1] text-xs font-bold text-white transition flex items-center justify-center active:scale-95 shadow-md"
          >
            UNLOCK
          </button>
        </div>
      </div>
    </div>
  );
}
