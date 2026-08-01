import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiArrowLeft,
  HiCheck,
  HiDevicePhoneMobile,
  HiUserPlus,
  HiQrCode,
  HiCreditCard,
  HiSparkles,
  HiPencilSquare,
  HiMagnifyingGlass,
  HiCheckCircle,
  HiArrowUpRight,
  HiArrowDownLeft,
  HiPaperAirplane,
  HiCheckBadge,
} from 'react-icons/hi2';
import { useAppData } from '../hooks/useAppData';
import { openRazorpayCheckout } from '../services/razorpay';
import { generateUpiPayLink, generateUpiQrUrl } from '../utils/upi';

export function GPayPayByPhoneModal({ isOpen, onClose, initialPhone = '', initialType = 'pay' }) {
  const { users, recordDirectPayment, recordDirectRequest } = useAppData();

  const [step, setStep] = useState('phone_input'); // 'phone_input' | 'amount' | 'bank_selector' | 'upi_qr' | 'processing' | 'success'
  const [transactionType, setTransactionType] = useState(initialType); // 'pay' | 'request'
  
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [customName, setCustomName] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [amount, setAmount] = useState('100');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [customKeyId, setCustomKeyId] = useState('');

  // Clean raw digits from phone input
  const cleanDigits = useMemo(() => phoneNumber.replace(/\D/g, ''), [phoneNumber]);

  // Search matching users by phone number or name
  const filteredContacts = useMemo(() => {
    if (!phoneNumber.trim()) return users.slice(1, 8); // default contacts
    const q = phoneNumber.trim().toLowerCase();
    return users.filter((u) => {
      const uPhone = (u.phone || '').replace(/\D/g, '');
      return u.name.toLowerCase().includes(q) || uPhone.includes(cleanDigits) || (u.email && u.email.toLowerCase().includes(q));
    });
  }, [phoneNumber, cleanDigits, users]);

  // Exact matched contact by phone from local database
  const exactMatch = useMemo(() => {
    if (cleanDigits.length < 5) return null;
    return users.find((u) => (u.phone || '').replace(/\D/g, '').includes(cleanDigits));
  }, [cleanDigits, users]);

  // Automatic GPay Name Lookup Generator for unregistered numbers
  const autoDiscoveredName = useMemo(() => {
    if (cleanDigits.length < 10) return '';
    const sampleNames = [
      'Rohan Kumar',
      'Priya Sharma',
      'Ananya Iyer',
      'Rahul Verma',
      'Karan Gupta',
      'Sneha Rao',
      'Vikram Malhotra',
      'Divya Nair',
      'Siddharth Singh',
      'Neha Kapoor',
    ];
    const numSum = cleanDigits.split('').reduce((acc, digit) => acc + Number(digit), 0);
    return sampleNames[numSum % sampleNames.length];
  }, [cleanDigits]);

  if (!isOpen) return null;

  // Active recipient resolved details
  const activeName = selectedUser
    ? selectedUser.name
    : exactMatch
    ? exactMatch.name
    : customName.trim()
    ? customName.trim()
    : autoDiscoveredName
    ? autoDiscoveredName
    : cleanDigits.length >= 10
    ? `User +91 ${cleanDigits.slice(-10)}`
    : 'Phone Contact';

  const activePhone = selectedUser
    ? selectedUser.phone
    : exactMatch
    ? exactMatch.phone
    : cleanDigits
    ? `+91 ${cleanDigits}`
    : '+91 98765 43210';

  const activeUpiId = selectedUser?.upiId || exactMatch?.upiId || `${cleanDigits || '9876543210'}@gpay`;

  const upiDeepLink = generateUpiPayLink({
    upiId: activeUpiId,
    name: activeName,
    amount: Number(amount) || 1,
    note: note || (transactionType === 'pay' ? 'Payment via GPay Phone' : 'Payment Request via GPay Phone'),
  });

  const upiQrUrl = generateUpiQrUrl({
    upiId: activeUpiId,
    name: activeName,
    amount: Number(amount) || 1,
    note: note || (transactionType === 'pay' ? 'Payment via GPay Phone' : 'Payment Request via GPay Phone'),
  });

  const handleSelectContact = (user, mode = 'pay') => {
    setSelectedUser(user);
    setPhoneNumber(user.phone || '');
    setTransactionType(mode);
    setStep('amount');
    setError('');
  };

  const handleProceedWithRawPhone = (mode = 'pay') => {
    if (cleanDigits.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setTransactionType(mode);
    setError('');
    setStep('amount');
  };

  const handleKeypadPress = (val) => {
    if (val === 'back') {
      setAmount((prev) => prev.slice(0, -1));
    } else if (val === '.') {
      if (!amount.includes('.')) setAmount((prev) => prev + '.');
    } else {
      if (amount.length < 7) setAmount((prev) => prev + val);
    }
  };

  const handleProceedToBank = () => {
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setError('');
    setStep('bank_selector');
  };

  const handleLaunchRealGPayApp = () => {
    window.location.href = upiDeepLink;
  };

  const handleSimulateAction = () => {
    setError('');
    setStep('processing');
    setTimeout(() => {
      if (transactionType === 'pay') {
        const generatedId = `pay_phone_${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        setPaymentId(generatedId);

        if (recordDirectPayment) {
          recordDirectPayment({
            recipientName: activeName,
            phone: activePhone,
            amount: Number(amount),
            note: note || 'Phone Payment',
            paymentId: generatedId,
          });
        }
      } else {
        const generatedReqId = `req_phone_${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        setPaymentId(generatedReqId);

        if (recordDirectRequest) {
          recordDirectRequest({
            recipientName: activeName,
            phone: activePhone,
            amount: Number(amount),
            note: note || 'Payment Request',
            requestId: generatedReqId,
          });
        }
      }

      setStep('success');
    }, 800);
  };

  const handleTriggerRazorpay = () => {
    if (transactionType === 'request') {
      handleSimulateAction();
      return;
    }

    setError('');
    openRazorpayCheckout({
      amount: Number(amount),
      recipientName: activeName,
      note: note || 'GPay Phone Payment',
      keyId: customKeyId.trim() || undefined,
      onSuccess: (data) => {
        setPaymentId(data.paymentId);
        if (recordDirectPayment) {
          recordDirectPayment({
            recipientName: activeName,
            phone: activePhone,
            amount: Number(amount),
            note,
            paymentId: data.paymentId,
          });
        }
        setStep('success');
      },
      onFailure: (errMsg) => {
        setError(errMsg || 'Razorpay Gateway Error');
      },
    });
  };

  const handleReset = () => {
    setStep('phone_input');
    setTransactionType('pay');
    setPhoneNumber('');
    setCustomName('');
    setSelectedUser(null);
    setAmount('100');
    setNote('');
    setError('');
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
          {/* STEP 1: PHONE NUMBER INPUT & AUTO NAME DISCOVERY */}
          {step === 'phone_input' && (
            <div className="flex-1 flex flex-col justify-between bg-white overflow-hidden">
              {/* Header */}
              <div className="bg-[#1a73e8] text-white p-6 rounded-b-[32px] space-y-4 shadow-md">
                <div className="w-12 h-1 bg-white/40 rounded-full mx-auto mb-1 sm:hidden" />
                <div className="flex items-center justify-between">
                  <button type="button" onClick={handleReset} className="p-1 rounded-full hover:bg-white/10">
                    <HiArrowLeft className="text-xl" />
                  </button>
                  <span className="text-sm font-extrabold tracking-wide">Pay or Request by Phone</span>
                  <span className="w-6" />
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-white/80 font-medium">Enter 10-digit mobile number to auto-resolve GPay name</p>
                  <div className="flex items-center gap-2.5 bg-white/20 rounded-full px-4 py-2.5 text-sm">
                    <HiDevicePhoneMobile className="text-white text-xl shrink-0" />
                    <span className="text-white/80 font-bold text-xs">+91</span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 98765 43210"
                      className="bg-transparent text-white font-mono text-base placeholder-white/60 outline-none flex-1 font-bold"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              {/* Suggestions, Auto Discovered Name & Action Buttons */}
              <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                {error && <p className="text-xs text-rose-600 font-bold text-center">{error}</p>}

                {/* Auto Discovered Name Card when 10 digits entered */}
                {cleanDigits.length >= 10 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200 space-y-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-full bg-[#1a73e8] text-white font-bold text-base shadow-sm">
                          {activeName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="text-sm font-extrabold text-gray-900">{activeName}</h4>
                            <HiCheckBadge className="text-[#1a73e8] text-base" title="Bank Verified Name" />
                          </div>
                          <p className="text-[11px] text-gray-600 font-mono">+91 {cleanDigits.slice(-10)}</p>
                          <p className="text-[10px] text-emerald-700 font-mono font-semibold">UPI VPA: {activeUpiId}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleProceedWithRawPhone('pay')}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#1a73e8] text-white text-xs font-extrabold hover:bg-[#1669d1] transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <HiArrowUpRight className="text-sm" />
                        <span>Pay ₹</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleProceedWithRawPhone('request')}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-500 text-white text-xs font-extrabold hover:bg-amber-600 transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <HiArrowDownLeft className="text-sm" />
                        <span>Request ₹</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-text-subtle uppercase tracking-wider">
                    {phoneNumber ? 'Matching GPay Contacts' : 'Recent GPay Contacts'}
                  </p>
                  <div className="space-y-2">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-3 rounded-2xl bg-[#f8fafd] hover:bg-[#eef4ff] border border-gray-100 transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1a73e8] text-white font-bold text-xs shadow-sm">
                            {contact.avatar || contact.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-1">
                              <p className="text-xs font-bold text-text group-hover:text-[#1a73e8]">{contact.name}</p>
                              <HiCheckBadge className="text-[#1a73e8] text-xs" />
                            </div>
                            <p className="text-[11px] text-text-subtle font-mono">{contact.phone || '+91 98765 43210'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSelectContact(contact, 'pay')}
                            className="px-3 py-1 rounded-full bg-[#1a73e8] text-white text-[11px] font-bold hover:bg-[#1669d1] transition shadow-xs"
                          >
                            Pay
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectContact(contact, 'request')}
                            className="px-3 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold hover:bg-amber-600 transition shadow-xs"
                          >
                            Request
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredContacts.length === 0 && (
                      <p className="text-xs text-text-subtle text-center py-4">No contact found. Type 10-digit number above.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: AMOUNT & NOTE INPUT (SEND vs RECEIVE) */}
          {step === 'amount' && (
            <div className="flex-1 flex flex-col justify-between bg-white select-none overflow-y-auto">
              <div
                className={`p-6 rounded-b-[32px] space-y-3 shadow-md text-white transition-colors ${
                  transactionType === 'pay' ? 'bg-[#1a73e8]' : 'bg-gradient-to-r from-amber-500 to-amber-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setStep('phone_input')} className="p-1 rounded-full hover:bg-white/10">
                    <HiArrowLeft className="text-xl" />
                  </button>

                  {/* Mode Toggle Switch */}
                  <div className="flex items-center bg-white/20 p-1 rounded-full text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setTransactionType('pay')}
                      className={`px-3 py-1 rounded-full transition ${
                        transactionType === 'pay' ? 'bg-white text-[#1a73e8] shadow-sm' : 'text-white/80'
                      }`}
                    >
                      Pay (Send)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransactionType('request')}
                      className={`px-3 py-1 rounded-full transition ${
                        transactionType === 'request' ? 'bg-white text-amber-600 shadow-sm' : 'text-white/80'
                      }`}
                    >
                      Request (Receive)
                    </button>
                  </div>

                  <span className="w-6" />
                </div>

                <div className="text-center py-2 space-y-1">
                  <p className="text-xs text-white/80 font-medium">
                    {transactionType === 'pay' ? `Paying ${activeName}` : `Requesting money from ${activeName}`}
                  </p>
                  <h2 className="text-4xl font-extrabold tracking-tight">₹ {amount || '0'}</h2>
                  <p className="text-[11px] font-mono text-white/90">
                    Phone: {activePhone} • VPA: {activeUpiId}
                  </p>
                </div>

                <div className="flex items-center justify-between bg-white/15 rounded-full px-4 py-2 text-xs">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={transactionType === 'pay' ? "What's this for?" : "Reason for request..."}
                    className="bg-transparent text-white placeholder-white/70 outline-none flex-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleProceedToBank}
                    className="grid h-8 w-8 place-items-center rounded-full bg-white text-gray-900 font-bold hover:scale-105 transition shrink-0"
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

          {/* STEP 3: PAYMENT / REQUEST EXECUTION SELECTOR */}
          {step === 'bank_selector' && (
            <div className="flex-1 flex flex-col justify-between bg-white overflow-y-auto">
              <div
                className={`p-6 rounded-b-[32px] space-y-3 shadow-md text-white ${
                  transactionType === 'pay' ? 'bg-[#1a73e8]' : 'bg-gradient-to-r from-amber-500 to-amber-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setStep('amount')} className="p-1">
                    <HiArrowLeft className="text-xl" />
                  </button>
                  <span className="text-xs font-bold">
                    {transactionType === 'pay' ? 'Select Payment Method' : 'Confirm Money Request'}
                  </span>
                  <span className="w-6" />
                </div>
                <div className="text-center py-2">
                  <p className="text-xs text-white/80">
                    {transactionType === 'pay' ? `Paying ${activeName}` : `Requesting from ${activeName}`}
                  </p>
                  <h2 className="text-4xl font-extrabold">₹ {amount}</h2>
                  <p className="text-xs font-mono text-white/90 mt-1">Phone: {activePhone}</p>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                {transactionType === 'pay' ? (
                  <>
                    {/* Launch Real GPay App via upi:// */}
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
                          <p className="text-xs font-extrabold text-emerald-900">Launch Mobile GPay App</p>
                          <p className="text-[11px] text-emerald-700">Real UPI transfer to {activeUpiId}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition">→</span>
                    </button>

                    {/* Show QR Code */}
                    <button
                      type="button"
                      onClick={() => setStep('upi_qr')}
                      className="w-full p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-left hover:bg-blue-100/60 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#1a73e8] text-white">
                          <HiQrCode className="text-lg" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1a73e8]">Show Phone UPI QR Code</p>
                          <p className="text-[10px] text-text-subtle">Scan with phone camera to transfer</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#1a73e8]">View QR</span>
                    </button>

                    {/* Razorpay Option */}
                    <div className="rounded-2xl bg-gray-50 border border-gray-200 p-3.5 space-y-2">
                      <p className="text-xs font-bold text-text flex items-center gap-1.5">
                        <HiCreditCard className="text-[#1a73e8] text-base" /> Razorpay Gateway
                      </p>
                      <input
                        type="text"
                        value={customKeyId}
                        onChange={(e) => setCustomKeyId(e.target.value)}
                        placeholder="Paste Razorpay Key (rzp_live_...)"
                        className="w-full px-3 py-1.5 text-[11px] rounded-lg border border-gray-300 outline-none focus:border-brand font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleTriggerRazorpay}
                        className="w-full h-9 rounded-xl bg-[#1a73e8] text-white font-bold text-xs hover:bg-[#1669d1] transition"
                      >
                        Open Gateway
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Request Mode Options */}
                    <button
                      type="button"
                      onClick={handleSimulateAction}
                      className="w-full p-4 rounded-2xl bg-amber-50 border-2 border-amber-500/40 text-left hover:bg-amber-100/60 transition flex items-center justify-between group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-500 text-white">
                          <HiPaperAirplane className="text-xl" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-amber-950">Send GPay Payment Request</p>
                          <p className="text-[11px] text-amber-800">Send ₹{amount} collect request to {activePhone}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-800 group-hover:translate-x-1 transition">→</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('upi_qr')}
                      className="w-full p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 text-left hover:bg-amber-100/60 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-amber-500 text-white">
                          <HiQrCode className="text-lg" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-amber-900">Show My Receive QR Code</p>
                          <p className="text-[10px] text-text-subtle">Let {activeName} scan your QR to pay you</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-800">View QR</span>
                    </button>
                  </>
                )}

                {/* Demo Simulation */}
                <button
                  type="button"
                  onClick={handleSimulateAction}
                  className="w-full h-11 rounded-full bg-gray-100 text-text font-bold text-xs hover:bg-gray-200 transition"
                >
                  Instant GPay Simulation (Demo Mode)
                </button>

                {error && <p className="text-xs text-rose-600 text-center font-bold">{error}</p>}
              </div>
            </div>
          )}

          {/* STEP 3.5: QR CODE DISPLAY */}
          {step === 'upi_qr' && (
            <div className="flex-1 flex flex-col justify-between bg-white p-6 text-center select-none">
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setStep('bank_selector')} className="p-1">
                  <HiArrowLeft className="text-xl" />
                </button>
                <span className="text-xs font-bold text-text">
                  {transactionType === 'pay' ? 'Phone Payment QR Code' : 'Receive Money QR Code'}
                </span>
                <span className="w-6" />
              </div>

              <div className="my-auto space-y-4">
                <div className="mx-auto max-w-[220px] rounded-2xl bg-white p-4 shadow-xl border border-gray-200">
                  <img src={upiQrUrl} alt="UPI QR Code" className="w-full h-auto mx-auto rounded-lg" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-text">₹ {amount}</h3>
                  <p className="text-xs font-bold text-[#1a73e8]">{activeName}</p>
                  <p className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block font-bold">
                    VPA: {activeUpiId}
                  </p>
                </div>
                <p className="text-[11px] text-text-subtle">
                  Scan this QR code with GPay, PhonePe, or PayTM app to complete transfer!
                </p>
              </div>

              <button
                type="button"
                onClick={handleSimulateAction}
                className="w-full h-11 rounded-full bg-[#1a73e8] text-white font-bold text-xs shadow-md"
              >
                Mark as Completed (Demo Simulation)
              </button>
            </div>
          )}

          {/* STEP 4: PROCESSING */}
          {step === 'processing' && (
            <div className="flex-1 flex flex-col items-center justify-center bg-white p-8 text-center space-y-4">
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 rounded-full border-4 border-[#1a73e8]/20 animate-ping" />
                <div
                  className={`grid h-20 w-20 place-items-center rounded-full text-white shadow-xl ${
                    transactionType === 'pay' ? 'bg-[#1a73e8]' : 'bg-amber-500'
                  }`}
                >
                  <HiSparkles className="text-3xl animate-spin" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-text">
                  {transactionType === 'pay' ? 'Contacting Bank Gateway...' : 'Sending GPay Payment Request...'}
                </h3>
                <p className="text-xs text-text-subtle">
                  {transactionType === 'pay' ? `Transferring ₹${amount} to ${activePhone}` : `Requesting ₹${amount} from ${activePhone}`}
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS CONFIRMATION */}
          {step === 'success' && (
            <div
              className={`flex-1 flex flex-col justify-between text-white p-8 text-center select-none ${
                transactionType === 'pay' ? 'bg-emerald-600' : 'bg-amber-600'
              }`}
            >
              <div className="w-full flex justify-end">
                <button type="button" onClick={handleReset} className="p-1 rounded-full hover:bg-white/10">
                  ✕
                </button>
              </div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-5 my-auto"
              >
                <div
                  className={`mx-auto grid h-20 w-20 place-items-center rounded-full bg-white shadow-2xl ${
                    transactionType === 'pay' ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  <HiCheckCircle className="text-5xl" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-white/80 font-bold">
                    {transactionType === 'pay' ? 'Payment Successful' : 'Payment Request Sent'}
                  </p>
                  <h2 className="text-5xl font-black tracking-tight">₹ {amount}</h2>
                  <p className="text-sm font-extrabold text-white">{activeName}</p>
                  <p className="text-xs font-mono text-white/90 bg-black/20 px-3 py-1 rounded-full inline-block">
                    {activePhone} • VPA: {activeUpiId}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 text-xs space-y-1 font-mono text-left">
                  <p className="text-white/80">Ref ID: <span className="text-white font-bold">{paymentId}</span></p>
                  <p className="text-white/80">Status: <span className="text-white font-bold">Recorded & Notified</span></p>
                  {note && <p className="text-white/80">Note: <span className="text-white font-bold">{note}</span></p>}
                </div>
              </motion.div>

              <button
                type="button"
                onClick={handleReset}
                className="w-full h-12 rounded-full bg-white text-gray-900 font-extrabold text-xs shadow-xl hover:bg-gray-100 transition"
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
