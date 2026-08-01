import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiBuildingLibrary,
  HiCreditCard,
  HiBolt,
  HiQrCode,
  HiArrowPath,
  HiCheckCircle,
  HiPlus,
  HiChevronRight,
  HiGift,
  HiTrophy,
  HiArrowRightOnRectangle,
} from 'react-icons/hi2';
import { useAppData } from '../hooks/useAppData';
import { useAuth } from '../hooks/useAuth';
import { GPayScratchCardModal } from '../components/GPayScratchCardModal';

export function ProfilePage() {
  const { currentUser } = useAppData();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isScratchCardOpen, setIsScratchCardOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-6 pb-6 select-none font-sans">
      {/* Top Profile Header matching Reference Image 2 */}
      <section className="relative overflow-hidden rounded-[36px] bg-gradient-to-b from-[#d3e3fd] via-[#e8f0fe] to-white p-6 shadow-sm border border-gray-200 space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 rounded-full bg-white/80 hover:bg-white text-text transition"
          >
            ←
          </button>
          <button type="button" className="p-2 rounded-full bg-white/80 hover:bg-white text-text">
            ⋮
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">{currentUser.name}</h1>
            <p className="text-xs font-semibold text-text-subtle">UPI ID: {currentUser.upiId || 'alexmercer@okicicibank'}</p>
            <p className="text-xs text-text-subtle">{currentUser.phone || '312198142'}</p>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#1a73e8] text-white px-3 py-1 text-xs font-bold shadow-sm">
                <HiCheckCircle className="text-sm" /> UPI number
              </span>
            </div>
          </div>

          <div className="grid h-20 w-20 place-items-center rounded-full bg-[#1a73e8] text-white font-extrabold text-2xl shadow-lg shadow-brand/20 shrink-0 overflow-hidden">
            {currentUser.image ? (
              <img src={currentUser.image} alt={currentUser.name} className="h-full w-full object-cover" />
            ) : (
              currentUser.avatar || 'AM'
            )}
          </div>
        </div>

        {/* Rewards Earned Summary Pills matching Reference Image 2 */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsScratchCardOpen(true)}
            className="rounded-2xl bg-amber-50 p-4 border border-amber-200/80 text-left hover:bg-amber-100/60 transition group"
          >
            <div className="flex items-center gap-2">
              <HiTrophy className="text-amber-600 text-lg" />
              <span className="text-xs font-bold text-amber-900">₹400</span>
            </div>
            <p className="text-[11px] font-semibold text-amber-800 mt-1">Rewards earned</p>
          </button>

          <button
            type="button"
            onClick={() => setIsScratchCardOpen(true)}
            className="rounded-2xl bg-[#eef4ff] p-4 border border-blue-200/80 text-left hover:bg-blue-100/60 transition group"
          >
            <div className="flex items-center gap-2">
              <HiGift className="text-brand text-lg" />
              <span className="text-xs font-bold text-brand">get ₹200</span>
            </div>
            <p className="text-[11px] font-semibold text-brand mt-1">Rewards earned</p>
          </button>
        </div>
      </section>

      {/* Set up payment methods Section matching Reference Image 2 */}
      <section className="rounded-[32px] bg-white p-6 border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-text">Set up payment methods 2/3</h2>
          <HiChevronRight className="text-text-subtle" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-[#f8fafd] p-4 border border-gray-200 text-center space-y-2">
            <div className="grid h-10 w-10 mx-auto place-items-center rounded-full bg-[#1a73e8] text-white">
              <HiBuildingLibrary className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-bold text-text">Bank account</p>
              <p className="text-[10px] text-text-subtle">3 accounts</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#f8fafd] p-4 border border-gray-200 text-center space-y-2">
            <div className="grid h-10 w-10 mx-auto place-items-center rounded-full bg-[#1a73e8] text-white">
              <HiCreditCard className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-bold text-text">RuPay credit card</p>
              <p className="text-[10px] text-text-subtle">Pay with UPI</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#f8fafd] p-4 border border-gray-200 text-center space-y-2">
            <div className="grid h-10 w-10 mx-auto place-items-center rounded-full bg-[#1a73e8] text-white">
              <HiBolt className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-bold text-text">UPI Lite</p>
              <p className="text-[10px] text-amber-600 font-bold">Balance: 200</p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Profile Options matching Reference Image 2 */}
      <section className="rounded-[32px] bg-white p-6 border border-gray-200/80 shadow-sm space-y-4">
        <div className="divide-y divide-gray-100">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-xs font-bold text-text">Pay with credit or debit cards</p>
              <p className="text-[11px] text-text-subtle">Contactless payments, bills, and more</p>
            </div>
            <button type="button" className="text-xs font-bold text-brand hover:underline">
              Add
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-xs font-bold text-text">Your QR code</p>
              <p className="text-[11px] text-text-subtle">use to receive money from any UPI app</p>
            </div>
            <HiQrCode className="text-xl text-brand" />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-xs font-bold text-text">Autopay</p>
              <p className="text-[11px] text-text-subtle">No pending requests</p>
            </div>
            <HiChevronRight className="text-text-subtle" />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-11 rounded-full bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition flex items-center justify-center gap-2"
          >
            <HiArrowRightOnRectangle className="text-base" /> Lock Google Pay
          </button>
        </div>
      </section>

      <GPayScratchCardModal
        isOpen={isScratchCardOpen}
        onClose={() => setIsScratchCardOpen(false)}
      />
    </div>
  );
}
