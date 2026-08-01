import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiMagnifyingGlass,
  HiQrCode,
  HiUserPlus,
  HiBuildingLibrary,
  HiDevicePhoneMobile,
  HiSparkles,
  HiCreditCard,
  HiGift,
  HiChevronRight,
  HiArrowRight,
  HiPlus,
  HiBolt,
} from 'react-icons/hi2';
import { useAppData } from '../hooks/useAppData';
import { formatCurrency } from '../utils/formatters';
import { GPaySendMoneyModal } from '../components/GPaySendMoneyModal';
import { GPayScratchCardModal } from '../components/GPayScratchCardModal';
import { GPayQrScannerModal } from '../components/GPayQrScannerModal';
import { GPayChatThreadModal } from '../components/GPayChatThreadModal';
import { GPayPayByPhoneModal } from '../components/GPayPayByPhoneModal';

export function DashboardPage() {
  const { users, currentUser } = useAppData();

  const [selectedPayUser, setSelectedPayUser] = useState(null);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [isScratchCardOpen, setIsScratchCardOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isPayByPhoneOpen, setIsPayByPhoneOpen] = useState(false);

  const peopleContacts = users.slice(1, 10);
  const billLogos = [
    { name: 'HBO', color: 'bg-black text-white' },
    { name: 'Jio', color: 'bg-blue-600 text-white' },
    { name: 'Netflix', color: 'bg-red-600 text-white' },
    { name: 'Amazon', color: 'bg-amber-500 text-black' },
  ];

  return (
    <div className="space-y-6 pb-6 select-none font-sans">
      {/* Top Hero Banner matching Reference Image 2 */}
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#d3e3fd] via-[#e8f0fe] to-[#f0f4f9] p-6 shadow-sm border border-[#dce5f2]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
              Safe, simple, flexible loans
            </h1>
            <p className="text-xs sm:text-sm text-text-subtle">
              Instant approval directly into your bank account with Google Pay protection.
            </p>
            <button
              type="button"
              onClick={() => setIsScratchCardOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#1a73e8] text-white px-5 py-2.5 text-xs font-bold shadow-md hover:bg-[#1669d1] transition"
            >
              <span>Apply now</span>
              <HiArrowRight className="text-sm" />
            </button>
          </div>

          {/* Banner Graphic Simulation */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div className="h-28 w-28 rounded-2xl bg-white/80 p-3 shadow-md flex flex-col items-center justify-center text-center">
              <HiSparkles className="text-3xl text-yellow-500 animate-bounce" />
              <span className="text-[11px] font-bold text-text mt-1">₹400 Cashbacks</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Quick Action Cards matching Reference Image 2 */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <button
          type="button"
          onClick={() => setIsQrScannerOpen(true)}
          className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white border border-gray-200/80 shadow-sm hover:shadow-md hover:border-brand/30 transition text-center space-y-2 group"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f0fe] text-[#1a73e8] group-hover:scale-105 transition">
            <HiQrCode className="text-2xl" />
          </div>
          <span className="text-xs font-bold text-text group-hover:text-brand">Scan any QR code</span>
        </button>

        <button
          type="button"
          onClick={() => setIsPayByPhoneOpen(true)}
          className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white border border-gray-200/80 shadow-sm hover:shadow-md hover:border-brand/30 transition text-center space-y-2 group"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f0fe] text-[#1a73e8] group-hover:scale-105 transition">
            <HiDevicePhoneMobile className="text-2xl" />
          </div>
          <span className="text-xs font-bold text-text group-hover:text-brand">Pay phone number</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedPayUser(users[2])}
          className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white border border-gray-200/80 shadow-sm hover:shadow-md hover:border-brand/30 transition text-center space-y-2 group"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f0fe] text-[#1a73e8] group-hover:scale-105 transition">
            <HiBuildingLibrary className="text-2xl" />
          </div>
          <span className="text-xs font-bold text-text group-hover:text-brand">Bank transfer</span>
        </button>

        <button
          type="button"
          onClick={() => setIsScratchCardOpen(true)}
          className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white border border-gray-200/80 shadow-sm hover:shadow-md hover:border-brand/30 transition text-center space-y-2 group"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f0fe] text-[#1a73e8] group-hover:scale-105 transition">
            <HiDevicePhoneMobile className="text-2xl" />
          </div>
          <span className="text-xs font-bold text-text group-hover:text-brand">Mobile recharge</span>
        </button>
      </section>

      {/* 3 Sub-Action Service Pills matching Reference Image 2 */}
      <section className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-text hover:bg-slate-50 transition shrink-0 shadow-sm"
        >
          <HiCreditCard className="text-base text-brand" />
          <span>Tap & Pay View cards</span>
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-text hover:bg-slate-50 transition shrink-0 shadow-sm"
        >
          <HiBolt className="text-base text-amber-500" />
          <span>UPI Lite <strong className="text-brand">₹200</strong></span>
        </button>

        <button
          type="button"
          onClick={() => setIsScratchCardOpen(true)}
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-text hover:bg-slate-50 transition shrink-0 shadow-sm"
        >
          <HiGift className="text-base text-yellow-500" />
          <span>Rewards <strong className="text-brand">₹400</strong></span>
        </button>
      </section>

      {/* People Section matching Reference Image 2 */}
      <section className="rounded-[30px] bg-white p-6 border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-text">People</h2>
          <button type="button" className="text-xs font-bold text-brand hover:underline">
            View all
          </button>
        </div>

        {/* Circular Contact Avatars Grid matching Reference Image 2 */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 text-center">
          {/* Self Transfer Button */}
          <button
            type="button"
            onClick={() => setSelectedPayUser(currentUser)}
            className="flex flex-col items-center gap-2 group focus:outline-none"
          >
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[#e8f0fe] text-brand border-2 border-brand/20 shadow-sm group-hover:scale-105 transition">
              <HiUserPlus className="text-2xl" />
            </div>
            <span className="text-xs font-bold text-text truncate w-full">Self transfer</span>
          </button>

          {/* Contact Avatars */}
          {peopleContacts.map((contact) => (
            <motion.button
              key={contact.id}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setSelectedChatUser(contact)}
              className="flex flex-col items-center gap-2 group focus:outline-none"
            >
              <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 border-2 border-brand/30 shadow-sm font-bold text-sm overflow-hidden group-hover:border-brand transition">
                {contact.image ? (
                  <img src={contact.image} alt={contact.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-brand">{contact.avatar}</span>
                )}
              </div>
              <span className="text-xs font-bold text-text truncate w-full group-hover:text-brand">
                {contact.name.split(' ')[0]}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Bills & Recharges Section matching Reference Image 2 */}
      <section className="rounded-[30px] bg-white p-6 border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-text">Bills & recharges</h2>
          <button type="button" className="text-xs font-bold text-brand hover:underline flex items-center gap-1">
            Manage <HiChevronRight />
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 text-center">
          {billLogos.map((bill) => (
            <button
              key={bill.name}
              type="button"
              onClick={() => setIsScratchCardOpen(true)}
              className="flex flex-col items-center gap-2 group focus:outline-none"
            >
              <div className={`grid h-14 w-14 place-items-center rounded-full ${bill.color} font-extrabold text-sm shadow-md group-hover:scale-105 transition`}>
                {bill.name}
              </div>
              <span className="text-xs font-bold text-text group-hover:text-brand">{bill.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Modals & Screens */}
      <GPayChatThreadModal
        isOpen={Boolean(selectedChatUser)}
        onClose={() => setSelectedChatUser(null)}
        contact={selectedChatUser}
        onPayClick={(user) => {
          setSelectedChatUser(null);
          setSelectedPayUser(user);
        }}
        onRequestClick={(user) => {
          setSelectedChatUser(null);
          setSelectedPayUser(user);
        }}
        onScratchClick={() => {
          setSelectedChatUser(null);
          setIsScratchCardOpen(true);
        }}
      />

      <GPaySendMoneyModal
        isOpen={Boolean(selectedPayUser)}
        onClose={() => setSelectedPayUser(null)}
        recipient={selectedPayUser}
      />

      <GPayScratchCardModal
        isOpen={isScratchCardOpen}
        onClose={() => setIsScratchCardOpen(false)}
      />

      <GPayQrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        users={users}
        onSelectUserToPay={(user) => setSelectedPayUser(user)}
      />

      <GPayPayByPhoneModal
        isOpen={isPayByPhoneOpen}
        onClose={() => setIsPayByPhoneOpen(false)}
      />
    </div>
  );
}
