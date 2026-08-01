import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  HiBellAlert,
  HiHome,
  HiMagnifyingGlass,
  HiSquares2X2,
  HiSparkles,
  HiUserCircle,
  HiWallet,
  HiPlus,
  HiQrCode,
  HiCamera,
  HiDevicePhoneMobile,
} from 'react-icons/hi2';
import { BrandMark } from '../components/BrandMark';
import { PageTransition } from '../components/PageTransition';
import { useAppData } from '../hooks/useAppData';
import { GPayQrScannerModal } from '../components/GPayQrScannerModal';
import { GPaySendMoneyModal } from '../components/GPaySendMoneyModal';
import { GPayPayByPhoneModal } from '../components/GPayPayByPhoneModal';

const navigation = [
  { label: 'Home', to: '/', icon: HiHome },
  { label: 'Groups', to: '/groups', icon: HiSquares2X2 },
  { label: 'Balances', to: '/balances', icon: HiWallet },
  { label: 'Notifications', to: '/notifications', icon: HiBellAlert },
  { label: 'Profile', to: '/profile', icon: HiUserCircle },
];

export function AppLayout() {
  const { currentUser, notifications, users } = useAppData();
  const location = useLocation();
  const navigate = useNavigate();

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isPayByPhoneOpen, setIsPayByPhoneOpen] = useState(false);
  const [sendMoneyRecipient, setSendMoneyRecipient] = useState(null);

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const primaryNavigation = navigation.slice(0, 5);

  const handleSelectUserFromScanner = (user) => {
    setSendMoneyRecipient(user);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-text font-sans selection:bg-brand/20">
      {/* Top Header - GPay App Surface */}
      <header className="sticky top-0 z-30 bg-[#f8f9fa]/95 backdrop-blur-md border-b border-[#e4ebf5]">
        <div className="mx-auto max-w-[1240px] px-3 py-2.5 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            {/* Brand Logo */}
            <Link to="/" className="shrink-0 focus:outline-none">
              <BrandMark compact />
            </Link>

            {/* Search Bar Input matching Reference Image 2 */}
            <div className="flex-1 max-w-xl mx-2">
              <div
                onClick={() => navigate('/search')}
                className="flex items-center gap-2 sm:gap-3 h-11 px-3 sm:px-4 rounded-full bg-white border border-[#dce3ed] text-text-subtle shadow-sm hover:border-brand/40 hover:shadow-md transition cursor-pointer"
              >
                <HiMagnifyingGlass className="text-xl text-brand shrink-0" />
                <span className="text-xs sm:text-sm truncate font-medium">Pay friends and merchants...</span>
                <div className="ml-auto flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPayByPhoneOpen(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-600 hover:text-white transition"
                    title="Pay using Phone Number"
                  >
                    <HiDevicePhoneMobile className="text-base" />
                    <span className="hidden sm:inline">Pay Phone</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsQrModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold hover:bg-brand hover:text-white transition"
                    title="Scan any QR code"
                  >
                    <HiQrCode className="text-base" />
                    <span className="hidden sm:inline">Scan QR</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Top Right User & Alert Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-full bg-white border border-[#e0e7f1] text-text hover:bg-brand/10 hover:text-brand transition shadow-sm sm:hidden"
                title="Scan QR Code"
              >
                <HiCamera className="text-xl" />
              </button>

              <Link
                className="relative grid h-10 w-10 place-items-center rounded-full bg-white border border-[#e0e7f1] text-text hover:bg-[#eef4ff] transition shadow-sm"
                to="/notifications"
                title="Notifications"
              >
                <HiBellAlert className="text-xl text-text-subtle" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-extrabold text-white shadow-sm animate-pulse">
                    {unreadCount}
                  </span>
                ) : null}
              </Link>

              <Link
                className="flex items-center gap-2 rounded-full bg-white border border-[#e0e7f1] p-1 pr-3 hover:border-brand/40 transition shadow-sm"
                to="/profile"
              >
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-tr from-brand to-[#4285f4] text-xs font-extrabold text-white shadow-sm overflow-hidden">
                  {currentUser.image ? (
                    <img src={currentUser.image} alt={currentUser.name} className="h-full w-full object-cover" />
                  ) : (
                    currentUser.avatar
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-text leading-tight">{currentUser.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-text-subtle">@gpay</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="mt-2.5 hidden lg:flex items-center justify-between border-t border-slate-200/60 pt-2.5">
            <div className="flex items-center gap-1.5">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-brand text-white shadow-md shadow-brand/20'
                        : 'text-text-subtle hover:bg-white hover:text-text'
                    }`
                  }
                >
                  <item.icon className="text-base" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/expenses/new"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand/20 hover:bg-[#1669d1] transition"
              >
                <HiPlus className="text-base" />
                <span>Pay / Request Split</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[1240px] px-3 pb-28 pt-4 sm:px-4 lg:px-6 lg:pb-12">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* Floating Action Button (FAB) on Mobile */}
      <Link
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-bold text-white shadow-xl shadow-brand/30 hover:bg-[#1669d1] active:scale-95 transition lg:hidden"
        to="/expenses/new"
      >
        <HiPlus className="text-xl" />
        <span>Pay / Split</span>
      </Link>

      {/* GPay Authentic Bottom Navigation Bar (Mobile / Tablet) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e4ebf5] bg-white/95 backdrop-blur-md px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:hidden">
        <div className="mx-auto max-w-md grid grid-cols-5 gap-1">
          {primaryNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-2xl transition-all ${
                  isActive ? 'text-brand font-extrabold' : 'text-text-subtle font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`grid h-7 w-12 place-items-center rounded-full transition-all ${
                      isActive ? 'bg-[#c2e7ff] text-[#041e49]' : ''
                    }`}
                  >
                    <item.icon className="text-xl" />
                  </div>
                  <span className="text-[11px] leading-none">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Global Interactive GPay Modals */}
      <GPayQrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        users={users}
        onSelectUserToPay={handleSelectUserFromScanner}
      />

      <GPaySendMoneyModal
        isOpen={Boolean(sendMoneyRecipient)}
        onClose={() => setSendMoneyRecipient(null)}
        recipient={sendMoneyRecipient}
      />

      <GPayPayByPhoneModal
        isOpen={isPayByPhoneOpen}
        onClose={() => setIsPayByPhoneOpen(false)}
      />
    </div>
  );
}
