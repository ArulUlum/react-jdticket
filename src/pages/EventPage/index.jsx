import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CalendarDays } from 'lucide-react';

import insta from '../../assets/insta.svg';
import copy from '../../assets/copy.svg';

import EventSkeleton from './EventSkeleton';
import TicketModal from './components/TicketModal';
import RegistrationModal from './components/RegistrationModal';
import PaymentModal from './components/PaymentModal';

import { useEventDetail } from './hooks/useEventDetail';
import { resolvePaymentCodeByLabel, payments } from './lib/payments';
import {
  getSelectedTickets,
  hasPaidTicket,
  getPaymentFee,
  getTotalTicketPrice,
  getTotalPrice,
  totalTaxAmount,
} from './lib/pricing';

const urlBe = import.meta.env.VITE_URL_BE;

export default function EventPage() {
  const { url } = useParams();
  const { event, loading } = useEventDetail(url);

  const [isRegistered, setIsRegistered] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [quantities, setQuantities] = useState({});
  const [copied, setCopied] = useState(false);

  const [showPromoInput, setShowPromoInput] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const [selectedPayment, setSelectedPayment] = useState('');
  const [selectedPaymentGroup, setSelectedPaymentGroup] = useState(payments[0].group);

  const [registrationModal, setRegistrationModal] = useState(false);
  const [ticketModal, setTicketModal] = useState(false);

  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentPayload, setPaymentPayload] = useState(null);

  const [localInvoiceId] = useState(() => `INV${Date.now()}`);

  // init quantities when event loaded
  useEffect(() => {
    if (!event) return;

    const initialQuantities = {};
    if (event.list_ticket?.length === 1) {
      initialQuantities[event.list_ticket[0].id] = 1;
    } else {
      event.list_ticket?.forEach((t) => (initialQuantities[t.id] = 0));
    }
    setQuantities(initialQuantities);
  }, [event]);

  // title
  useEffect(() => {
    if (event?.name) document.title = `${event.name} - Kebbu`;
  }, [event?.name]);

  const selectedTickets = useMemo(() => getSelectedTickets(event, quantities), [event, quantities]);
  const isPaid = useMemo(() => hasPaidTicket(selectedTickets), [selectedTickets]);
  const totalTicketPrice = useMemo(() => getTotalTicketPrice(selectedTickets, quantities), [selectedTickets, quantities]);
  // const serviceFee = useMemo(() => getServiceFee(isPaid), [isPaid]);
  const taxFee = useMemo(() => totalTaxAmount(totalTicketPrice, event?.type_tax, event?.tax), [totalTicketPrice, event]);
  const platformFee = useMemo(() => totalTaxAmount(totalTicketPrice, event?.type_tax_kebbu, event?.tax_kebbu), [totalTicketPrice, event]);
  const paymentFee = useMemo(() => getPaymentFee(isPaid, totalTicketPrice), [isPaid, totalTicketPrice]);

  const totalPrice = useMemo(() => getTotalPrice(totalTicketPrice, platformFee, taxFee, paymentFee), [totalTicketPrice, platformFee, taxFee, paymentFee]);

  if (loading) return <EventSkeleton />;
  if (!event) return <p className="text-red-500">Event not found.</p>;

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  const formattedStartDate = format(startDate, 'EEE, d MMM yyyy');
  const startDay = format(startDate, 'd');
  const startMonth = format(startDate, 'MMM');
  const formattedStartTime = format(startDate, 'HH:mm');
  const formattedEndTime = format(endDate, 'HH:mm');

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }

  function increaseQty(ticketId) {
    setQuantities((prev) => ({ ...prev, [ticketId]: (prev[ticketId] || 0) + 1 }));
  }
  function decreaseQty(ticketId) {
    setQuantities((prev) => ({ ...prev, [ticketId]: Math.max((prev[ticketId] || 0) - 1, 0) }));
  }

  function handleRegister() {
    const total = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    if (total === 0) {
      setErrorMessage('Miniumum 1 ticket for registration');
      return;
    }
    setErrorMessage('');
    setRegistrationModal(true);
    setTicketModal(false);
  }

  async function submitRegistration() {
    if (!formData.name || !formData.email) {
      alert('Name and Email are required!');
      return;
    }

    const tickets = Object.entries(quantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([id, quantity]) => {
        const ticket = event.list_ticket.find((t) => String(t.id) === String(id));
        return {
          id: parseInt(id, 10),
          name: ticket?.name || '',
          price: ticket?.price || 0,
          quantity,
        };
      });

    setIsRegistered(true);

    try {
      const paymentCode = resolvePaymentCodeByLabel(selectedPayment);

      const payload = {
        name: formData.name,
        email: formData.email,
        no_hp: formData.phone,
        event_id: event.id,
        tickets,
        payment: paymentCode,
        fees: isPaid ? [{ type: 'platform', value: platformFee }, { type: 'tax', value: taxFee }, { type: 'payment', value: paymentFee }] : [],
        total: totalPrice,
      };

      if (!isPaid) {
        const response = await axios.post(`${urlBe}/events/regis`, payload);
        alert(response.data.message);
        setRegistrationModal(false);
      } else {
        setRegistrationModal(false);
        setPaymentPayload(payload);
        setPaymentModal(true);
      }
    } catch (err) {
      console.error(err);
      alert('Registrasi gagal.');
    } finally {
      setIsRegistered(false);
    }
  }

  return (
    <div className="mb-16 mt-4">
      <div className="flex flex-col md:flex-row gap-4 pb-2 justify-center items-start">
        {/* Left Panel */}
        <div className="w-full lg:max-w-[300px] pr-4 items-center">
          <div className="w-full max-w-[300px] mx-auto flex">
            <img
              src={event.image || 'https://wallpapercave.com/wp/wp9297718.jpg'}
              alt={event.name}
              className="rounded-xl w-full aspect-square object-cover mx-auto"
              style={{ aspectRatio: '1 / 1' }}
            />
          </div>

          {/* desktop extras */}
          <div className="hidden md:block">
            <div className="mt-6">
              <h3 className="text-responsive-item-title text-[#a2a2a2]">Host</h3>
              <hr className="border-t border-gray-300 my-2 opacity-20" />
              <div className="flex flex-row justify-between items-center">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      event.created_by.image ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(event.created_by?.name || 'User')}&background=random`
                    }
                    alt="Host Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-white text-responsive-sub-title">{event.created_by.name}</span>
                </div>

                <img src={insta} alt="Instagram Icon" className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-responsive-item-title text-[#a2a2a2]">{event.registered.total} Going</h3>
              <hr className="border-t border-gray-300 my-2 opacity-20" />
              <div className="flex items-center space-x-2 mb-1 mt-3">
                <div className="flex -space-x-3">
                  {event.registered.list.map((user, index) => (
                    <img
                      key={index}
                      src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-black object-cover"
                    />
                  ))}
                  {event.registered.others > 0 && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 opacity-80 text-white text-xs flex items-center justify-center border-2 border-black">
                      +{event.registered.others}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-white text-responsive-regular mt-1">
                {event.registered.list.map((user) => user.name).join(', ')}
                {event.registered.others > 0 && ` and ${event.registered.others} others`}
              </div>
            </div>

            <div className="mt-6 mb-4">
              <h3 className="text-responsive-item-title text-[#a2a2a2]">Share</h3>
              <hr className="border-t border-gray-300 my-2 opacity-20" />
              <div className="flex flex-row items-center gap-2">
                <img src={copy} alt="Copy Icon" className="w-5 h-5 cursor-pointer" onClick={handleCopy} />
                <p className="text-white text-responsive-regular mt-0.5">Copy link</p>
              </div>
            </div>

            <h3 className="text-responsive-item-title text-[#a2a2a2]">Contact the Host</h3>
            <h3 className="text-responsive-item-title text-[#a2a2a2]">Report Event</h3>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full space-y-8">
          <h1 className="text-responsive-title mb-1">{event.name}</h1>

          <div className="flex">
            <div className="w-12 h-12 rounded-md flex flex-col items-center justify-center text-white font-bold text-xs leading-none border border-white">
              <CalendarDays className="text-white w-7 h-7" />
            </div>
            <div className="flex flex-col ml-4">
              <p className="text-responsive-medium text-white">{formattedStartDate}</p>
              <p className="text-responsive-caption text-[#a2a2a2] mt-1">
                {formattedStartTime} - {formattedEndTime} WIB
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="w-12 h-12 rounded-md flex flex-col items-center justify-center text-white font-bold text-xs leading-none border border-white">
              <MapPin className="text-white w-7 h-7" />
            </div>
            <div className="flex flex-col ml-4">
              <p className="text-responsive-medium text-white">{event.location_name}</p>
              <p className="text-responsive-caption text-[#a2a2a2]">{event.location_address}</p>
            </div>
          </div>

          <button
            className="hidden md:block text-responsive-item-title text-white w-full py-2 mt-4 rounded bg-gradient-to-r from-[#44A08D] to-[#00594F] hover:from-[#58c1ac] hover:to-[#007467]"
            onClick={() => setTicketModal(true)}
          >
            Register
          </button>

          {/* About */}
          <div>
            <h2 className="text-responsive-sub-title text-[#a2a2a2] mb-2">About Event</h2>
            <hr className="border-t border-gray-300 my-2 opacity-20" />
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {event.description || 'No description provided.'}
            </p>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-responsive-sub-title text-[#a2a2a2] mb-2">Location</h2>
            <hr className="border-t border-gray-300 my-2 opacity-20" />
            <p className="text-responsive-item-title text-white">{event.location_name}</p>
            <p className="text-responsive-regular text-[#a2a2a2] mb-2">{event.location_address}</p>
            <iframe
              title="event-location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`}
              className="w-full h-60 rounded-lg border border-gray-700"
              loading="lazy"
            />
          </div>

          {/* mobile extras */}
          <div className="block md:hidden">
            <div className="mt-6">
              <h3 className="text-responsive-item-title text-[#a2a2a2]">Host</h3>
              <hr className="border-t border-gray-300 my-2 opacity-20" />
              <div className="flex flex-row justify-between items-center">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      event.created_by.image ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(event.created_by?.name || 'User')}&background=random`
                    }
                    alt="Host Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-white text-responsive-sub-title">{event.created_by.name}</span>
                </div>
                <img src={insta} alt="Instagram Icon" className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-responsive-item-title text-[#a2a2a2]">{event.registered.total} Going</h3>
              <hr className="border-t border-gray-300 my-2 opacity-20" />
              <div className="flex items-center space-x-2 mb-1 mt-3">
                <div className="flex -space-x-3">
                  {event.registered.list.map((user, index) => (
                    <img
                      key={index}
                      src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-black object-cover"
                    />
                  ))}
                  {event.registered.others > 0 && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 opacity-80 text-white text-xs flex items-center justify-center border-2 border-black">
                      +{event.registered.others}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-white text-responsive-regular mt-1">
                {event.registered.list.map((u) => u.name).join(', ')}
                {event.registered.others > 0 && ` and ${event.registered.others} others`}
              </div>
            </div>

            <div className="mt-6 mb-4">
              <h3 className="text-responsive-item-title text-[#a2a2a2]">Share</h3>
              <hr className="border-t border-gray-300 my-2 opacity-20" />
              <div className="flex flex-row items-center gap-2">
                <img src={copy} alt="Copy Icon" className="w-5 h-5 cursor-pointer" onClick={handleCopy} />
                <p className="text-white text-responsive-regular mt-0.5">Copy link</p>
              </div>
            </div>

            <h3 className="text-responsive-item-title text-[#a2a2a2] mb-2">Contact the Host</h3>
            <h3 className="text-responsive-item-title text-[#a2a2a2] mb-2">Report Event</h3>
          </div>
        </div>

        {/* mobile register fixed */}
        <div className="fixed left-0 bottom-5 w-full z-20 flex justify-center items-center md:hidden">
          <button
            className="text-responsive-item-title text-white w-full max-w-md py-2 rounded-lg bg-gradient-to-r from-[#44A08D] to-[#00594F] hover:from-[#58c1ac] hover:to-[#007467]"
            onClick={() => setTicketModal(true)}
          >
            Register
          </button>
        </div>

        {/* Copied toast */}
        <AnimatePresence>
          {copied && (
            <motion.div
              key="copy"
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: 0 }}
              transition={{ duration: 0.3, ease: 'easeIn' }}
              className="fixed top-5 -translate-x-1/2 bg-green-500 text-white z-50 overflow-y-auto shadow-xl px-4 py-2 rounded"
            >
              Copied to clipboard!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <TicketModal
          isOpen={ticketModal}
          onClose={() => setTicketModal(false)}
          event={event}
          quantities={quantities}
          increaseQty={increaseQty}
          decreaseQty={decreaseQty}
          errorMessage={errorMessage}
          onContinue={handleRegister}
        />

        <RegistrationModal
          isOpen={registrationModal}
          onClose={() => setRegistrationModal(false)}
          event={event}
          headerInfo={{ startDay, startMonth, formattedStartTime }}
          pricingInfo={{ selectedTickets, isPaid, platformFee, taxFee, paymentFee, totalPrice, quantities }}
          showPromoInput={showPromoInput}
          setShowPromoInput={setShowPromoInput}
          formData={formData}
          setFormData={setFormData}
          selectedPaymentGroup={selectedPaymentGroup}
          setSelectedPaymentGroup={setSelectedPaymentGroup}
          selectedPayment={selectedPayment}
          setSelectedPayment={setSelectedPayment}
          isSubmitting={isRegistered}
          onSubmit={submitRegistration}
        />

        <PaymentModal
          isOpen={paymentModal}
          onClose={() => setPaymentModal(false)}
          payload={paymentPayload}
          onSuccess={() => {
            // optional: close modal / navigate
            // setPaymentModal(false);
          }}
        />

      </div>
    </div>
  );
}
