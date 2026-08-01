import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowLeft, HiEye, HiCheck, HiSparkles, HiCreditCard, HiDevicePhoneMobile, HiQrCode, HiPencilSquare } from 'react-icons/hi2';
import { formatCurrency } from '../utils/formatters';
import { openRazorpayCheckout } from '../services/razorpay';
import { generateUpiPayLink, generateUpiQrUrl } from '../utils/upi';

export function GPaySendMoneyModal({ isOpen, onClose, recipient, defaultAmount = '100', onPaymentComplete }) {
  const [amount, setAmount] = useState(defaultAmount);
  const [note, setNote] = useState('Payment');
  const [step, setStep] = useState('amount'); // 'amount' | 'bank_selector' | 'upi_pin' | 'upi_qr' | 'processing' | 'success'
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [customKeyId, setCustomKeyId] = useState('');
  
  // Real Recipient UPI ID field (editable by user to send real money to any real UPI ID)
  const defaultUpi = recipient?.upiId || 'imrag@okicici';
  const [realUpiId, setRealUpiId] = useState(defaultUpi);

  if (!isOpen || !recipient) return null;

  const activeUpiId = realUpiId.trim() || 'imrag@okicici';
  const upiDeepLink = generateUpiPayLink({
    upiId: activeUpiId,
    name: recipient.name,
    amount: Number(amount) || 1,
    note: note || 'Payment via GPay Web App',
  });
  const upiQrUrl = generateUpiQrUrl({
    upiId: activeUpiId,
    name: recipient.name,
    amount: Number(amount) || 1,
    note: note || 'Payment via GPay Web App',
  });

  const handleKeypadPress = (val) => {
    if (val === 'back') {
      if (step === 'amount') setAmount((prev) => prev.slice(0, -1));
      if (step === 'upi_pin') setPin((prev) => prev.slice(0, -1));
    } else if (val === '.') {
      if (step === 'amount' && !amount.includes('.')) setAmount((prev) => prev + '.');
    } else {
      if (step === 'amount' && amount.length < 7) setAmount((prev) => prev + val);
      if (step === 'upi_pin' && pin.length < 4) setPin((prev) => prev + val);
    }
  };

  const handleProceedToBank = (e) => {
    if (e) e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter amount');
      return;
    }
    setError('');
    setStep('bank_selector');
  };

  const handleLaunchRealGPayApp = () => {
    // Triggers real GPay / PhonePe app installed on user's mobile device via upi:// protocol
    window.location.href = upiDeepLink;
  };

  const handleSimulatePayment = () => {
    setError('');
    setStep('processing');
    setTimeout(() => {
      const generatedId = `pay_gpay_${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      setPaymentId(generatedId);
      setStep('success');
      if (onPaymentComplete) {
        onPaymentComplete({
          paymentId: generatedId,
          amount: Number(amount),
          recipientName: recipient.name,
        });
      }
    }, 700);
  };

  const handleTriggerRazorpay = () => {
    setError('');
    openRazorpayCheckout({
      amount: Number(amount),
      recipientName: recipient.name,
      note: note || 'GPay Real Payment',
      keyId: customKeyId.trim() || undefined,
      onSuccess: (data) => {
        setPaymentId(data.paymentId);
        setStep('success');
        if (onPaymentComplete) {
          onPaymentComplete(data);
        }
      },
      onFailure: (errMsg) => {
        setError(errMsg || 'Razorpay Gateway Error');
      },
    });
  };

  const handleConfirmPin = () => {
    if (pin.length < 4) {
      setError('Enter 4-Digit UPI PIN');
      return;
    }
    handleSimulatePayment();
  };

  const handleReset = () => {
    setStep('amount');
    setPin('');
    setNote('Payment');
    setPaymentId('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="relative w-full max-w-md overflow-hidden rounded-t-[32px] sm:rounded-[32px] bg-white shadow-2xl flex flex-col h-[90vh] sm:h-[680px]"
        >
          {/* STEP 1: AMOUNT INPUT SCREEN */}
          {step === 'amount' && (
            <div className="flex-1 flex flex-col justify-between bg-white select-none overflow-y-auto">
              {/* Top Blue Header Card */}
              <div className="bg-[#1a73e8] text-white p-6 rounded-b-[32px] space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={handleReset} className="p-1 rounded-full hover:bg-white/10">
                    <HiArrowLeft className="text-xl" />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#1a73e8] font-bold text-xs">
                      {recipient.avatar || recipient.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-semibold block leading-tight">{recipient.name}</span>
                      {recipient.phone && <span className="text-[10px] text-white/80 font-mono block">{recipient.phone}</span>}
                    </div>
                  </div>
                  <span className="w-6" />
                </div>

                <div className="text-center py-2 space-y-1">
                  <p className="text-xs text-white/80 font-medium">Paying {recipient.name}</p>
                  <h2 className="text-4xl font-extrabold tracking-tight">₹ {amount || '0'}</h2>
                </div>

                {/* Real UPI ID Input Field */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-white/80 block">
                    Enter Real Recipient UPI ID:
                  </label>
                  <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5 text-xs">
                    <HiPencilSquare className="text-white text-base shrink-0" />
                    <input
                      type="text"
                      value={realUpiId}
                      onChange={(e) => setRealUpiId(e.target.value)}
                      placeholder="e.g. yourname@okicici or phone@paytm"
                      className="bg-transparent text-white font-mono placeholder-white/60 outline-none flex-1 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white/15 rounded-full px-4 py-2 text-xs">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What's this for?"
                    className="bg-transparent text-white placeholder-white/70 outline-none flex-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleProceedToBank}
                    className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#1a73e8] font-bold hover:scale-105 transition shrink-0"
                  >
                    →
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-rose-600 text-center font-bold">{error}</p>}

              {/* White Keypad */}
              <div className="p-6 bg-white space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleKeypadPress(num)}
                      className="h-13 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-xl font-bold text-text transition flex items-center justify-center"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    key="back"
                    type="button"
                    onClick={() => handleKeypadPress('back')}
                    className="h-13 rounded-2xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-lg font-bold text-text-subtle transition flex items-center justify-center"
                  >
                    ⌫
                  </button>
                  <button
                    key="0"
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    className="h-13 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-xl font-bold text-text transition flex items-center justify-center"
                  >
                    0
                  </button>
                  <button
                    key="dot"
                    type="button"
                    onClick={() => handleKeypadPress('.')}
                    className="h-13 rounded-2xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-xl font-bold text-text-subtle transition flex items-center justify-center"
                  >
                    .
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BANK & REAL PAYMENT METHOD SELECTOR */}
          {step === 'bank_selector' && (
            <div className="flex-1 flex flex-col justify-between bg-white overflow-y-auto">
              <div className="bg-[#1a73e8] text-white p-6 rounded-b-[32px] space-y-3">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setStep('amount')} className="p-1">
                    <HiArrowLeft className="text-xl" />
                  </button>
                </div>
                <div className="text-center py-2">
                  <p className="text-xs text-white/80">Paying {recipient.name}</p>
                  <h2 className="text-4xl font-extrabold">₹ {amount}</h2>
                  <p className="text-xs font-mono text-white/80 mt-1">Real UPI: {activeUpiId}</p>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                {/* Real GPay App Trigger */}
                <button
                  type="button"
                  onClick={handleLaunchRealGPayApp}
                  className="w-full p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500/40 text-left hover:bg-emerald-100/60 transition flex items-center justify-between group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-600 text-white">
                      <HiDevicePhoneMobile className="text-xl" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-emerald-900">Launch Real GPay App on Phone</p>
                      <p className="text-[11px] text-emerald-700">Send real money to {activeUpiId}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition">→</span>
                </button>

                {/* Real UPI QR Code */}
                <button
                  type="button"
                  onClick={() => setStep('upi_qr')}
                  className="w-full p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-left hover:bg-blue-100/60 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-white">
                      <HiQrCode className="text-lg" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand">Show Real UPI QR Code for {activeUpiId}</p>
                      <p className="text-[10px] text-text-subtle">Scan with GPay on phone to pay real money</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-brand">View QR</span>
                </button>

                {/* Razorpay Gateway Input */}
                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-text flex items-center gap-1.5">
                      <HiCreditCard className="text-brand text-base" /> Razorpay Payment Gateway
                    </p>
                  </div>
                  <input
                    type="text"
                    value={customKeyId}
                    onChange={(e) => setCustomKeyId(e.target.value)}
                    placeholder="Paste your Razorpay Key ID (rzp_live_...)"
                    className="w-full px-3 py-1.5 text-[11px] rounded-lg border border-gray-300 outline-none focus:border-brand font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleTriggerRazorpay}
                    className="w-full h-9 rounded-xl bg-brand text-white font-bold text-xs hover:bg-[#1669d1] transition"
                  >
                    Open Razorpay Gateway
                  </button>
                </div>

                {/* Interactive GPay Simulation */}
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  className="w-full h-11 rounded-full bg-gray-100 text-text font-bold text-xs hover:bg-gray-200 transition"
                >
                  Instant UI Simulation (Demo Mode)
                </button>

                {error && <p className="text-xs text-rose-600 text-center font-bold">{error}</p>}
              </div>
            </div>
          )}

          {/* STEP 2.5: REAL UPI QR CODE DISPLAY */}
          {step === 'upi_qr' && (
            <div className="flex-1 flex flex-col justify-between bg-white p-6 text-center select-none">
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setStep('bank_selector')} className="p-1">
                  <HiArrowLeft className="text-xl" />
                </button>
                <span className="text-xs font-bold text-text">Real UPI QR Code</span>
                <span className="w-6" />
              </div>

              <div className="my-auto space-y-4">
                <div className="mx-auto max-w-[220px] rounded-2xl bg-white p-4 shadow-xl border border-gray-200">
                  <img src={upiQrUrl} alt="Real UPI QR Code" className="w-full h-auto mx-auto rounded-lg" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-text">₹ {amount}</h3>
                  <p className="text-xs font-bold text-brand">{recipient.name}</p>
                  <p className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block font-bold">
                    UPI: {activeUpiId}
                  </p>
                </div>
                <p className="text-[11px] text-text-subtle">
                  Scan this QR code with your mobile camera or GPay app to complete real transfer!
                </p>
              </div>

              <button
                type="button"
                onClick={handleSimulatePayment}
                className="w-full h-11 rounded-full bg-[#1a73e8] text-white font-bold text-xs shadow-md"
              >
                Mark Payment Complete
              </button>
            </div>
          )}

          {/* STEP 3: ENTER UPI PIN SCREEN */}
          {step === 'upi_pin' && (
            <div className="flex-1 flex flex-col justify-between bg-[#f8fafd] text-text select-none">
              <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-red-600 text-xs">HDFC</span>
                  <div>
                    <p className="font-bold text-xs text-text">{recipient.name}</p>
                    <p className="text-[10px] text-text-subtle font-mono">₹ {amount} ∨</p>
                  </div>
                </div>
                <span className="text-xs font-black tracking-widest text-emerald-600">UPI▶</span>
              </div>

              <div className="text-center py-6 space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-subtle">ENTER UPI PIN</span>
                  <button type="button" onClick={() => setShowPin(!showPin)} className="text-text-subtle">
                    <HiEye className="text-sm" />
                  </button>
                </div>

                <div className="flex justify-center items-center gap-4 py-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`h-4 w-4 rounded-full border-2 transition-all ${
                        pin.length > idx ? 'bg-text border-text scale-110' : 'border-gray-300 bg-transparent'
                      }`}
                    >
                      {showPin && pin[idx] ? <span className="text-[10px] text-white font-bold flex items-center justify-center">{pin[idx]}</span> : null}
                    </div>
                  ))}
                </div>

                {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}
              </div>

              <div className="p-6 bg-white space-y-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleKeypadPress(num)}
                      className="h-13 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-xl font-bold text-text transition flex items-center justify-center"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('back')}
                    className="h-13 rounded-2xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-lg font-bold text-text-subtle transition flex items-center justify-center"
                  >
                    ⌫
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    className="h-13 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-xl font-bold text-text transition flex items-center justify-center"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPin}
                    className="h-13 rounded-2xl bg-[#1a73e8] hover:bg-[#1669d1] active:scale-95 text-white transition flex items-center justify-center shadow-lg"
                  >
                    <HiCheck className="text-2xl stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3.5: PROCESSING ANIMATION SCREEN */}
          {step === 'processing' && (
            <div className="flex-1 bg-[#1a73e8] text-white flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="h-16 w-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-sm font-bold tracking-wide">Connecting securely with bank...</p>
              <p className="text-xs text-white/70">Paying ₹{amount} to {activeUpiId}</p>
            </div>
          )}

          {/* STEP 4: SUCCESS CELEBRATION SCREEN */}
          {step === 'success' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex-1 bg-[#1a73e8] text-white flex flex-col items-center justify-center p-8 text-center space-y-6"
            >
              <div className="grid h-28 w-28 place-items-center rounded-full bg-white shadow-2xl animate-bounce">
                <HiCheck className="text-6xl text-[#1a73e8] stroke-[3]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-3xl font-extrabold">₹ {amount}</h3>
                <p className="text-sm text-white/80">Paid to {recipient.name}</p>
                <p className="text-[11px] font-mono bg-white/20 px-3.5 py-1 rounded-full text-white inline-block mt-2">
                  UPI: {activeUpiId}
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="mt-6 px-8 h-12 rounded-full bg-white text-[#1a73e8] font-extrabold text-sm shadow-xl hover:bg-slate-100 active:scale-95 transition"
              >
                Done
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
