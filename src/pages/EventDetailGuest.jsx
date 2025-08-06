import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  CalendarDays
} from 'lucide-react';
import insta from '../assets/insta.svg';
import copy from '../assets/copy.svg';
import qris from '../assets/QRIS.svg';
import gopay from '../assets/Gopay.svg';
import ovo from '../assets/OVO.svg';
import dana from '../assets/DANA.svg';
import shoopePay from '../assets/Shopee-Pay.svg';
import bca from '../assets/BCA.svg';
import mandiri from '../assets/Mandiri.svg';
import bni from '../assets/BNI.svg';
import bri from '../assets/BRI.svg';
import creditCard from '../assets/Credit-Card.svg';

const urlBe = import.meta.env.VITE_URL_BE;

function EventDetailGuest() {
  const { url } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [quantities, setQuantities] = useState({});
  const [copied, setCopied] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [selectedPayment, setSelectedPayment] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Modal Refs
  const registrationModalRef = useRef(null);
  const ticketModalRef = useRef(null);


  const [registrationModal, setRegistrationModal] = useState(false);
  const [ticketModal, setTicketModal] = useState(false);
  // Tambahkan modal lainnya di sini...

  const modals = [
    { ref: registrationModalRef, isOpen: registrationModal, close: () => setRegistrationModal(false) },
    { ref: ticketModalRef, isOpen: ticketModal, close: () => setTicketModal(false) },
    // Tambahkan modal lain: { ref, isOpen, close }
  ];

  const payments = [
    { group: 'QRIS', items: [{ label: 'QRIS', icon: qris, code: 'QRIS' }] },
    {
      group: 'E-Wallet',
      items: [
        { label: 'Gopay', icon: gopay, code: 'GOPAY' },
        { label: 'OVO', icon: ovo, code: 'OVO' },
        { label: 'Dana', icon: dana, code: 'DANA' },
        { label: 'ShopeePay', icon: shoopePay, code: 'SHOPEEPAY' },
      ],
    },
    {
      group: 'Virtual Account',
      items: [
        { label: 'BCA Virtual Account', icon: bca, code: 'BCA' },
        { label: 'Mandiri Virtual Account', icon: mandiri, code: 'MANDIRI' },
        { label: 'BNI Virtual Account', icon: bni, code: 'BNI' },
        { label: 'BRI Virtual Account', icon: bri, code: 'BRI' },
      ],
    },
    {
      group: 'Credit Card',
      items: [{ label: 'Credit Card', icon: creditCard, code: 'CREDIT_CARD' }],
    },
  ];

  const [selectedPaymentGroup, setSelectedPaymentGroup] = useState(payments[0].group);

  // Helper: get selected tickets
  const getSelectedTickets = () => event?.list_ticket?.filter(ticket => quantities[ticket.id] > 0) || [];
  // Helper: check if any paid ticket selected
  const hasPaidTicket = () => getSelectedTickets().some(ticket => ticket.price > 0);
  // Helper: total ticket price
  const getTotalTicketPrice = () => getSelectedTickets().reduce((sum, ticket) => sum + (ticket.price * quantities[ticket.id]), 0);
  // Helper: service fee
  const getServiceFee = () => (hasPaidTicket() ? 2000 : 0);
  // Helper: total price
  const getTotalPrice = () => getTotalTicketPrice() + getServiceFee();

  // Fetch event data only when id changes
  useEffect(() => {
    fetchData(url);
  }, [url]);

  // Update document title when event changes
  useEffect(() => {
    if (event) {
      document.title = event.name + ' - Kebbu';
    }
  }, [event]);
  
  // Handle click outside modals
  useEffect(() => {
    const handleClickOutside = (event) => {
      modals.forEach(({ ref, isOpen, close }) => {
        if (isOpen && ref.current && !ref.current.contains(event.target)) {
          close();
        }
      });
    };

    // Cek apakah ada modal yang terbuka
    const anyOpen = modals.some(({ isOpen }) => isOpen);
    if (anyOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modals.map(m => m.isOpen).join()]);

  async function fetchData(url) {
    try {
      const response = await axios.get(`${urlBe}/events/detail/${url}`);
      const data = response.data.data;
      setEvent(data);
      const initialQuantities = {};
      if (data.list_ticket?.length === 1) {
        initialQuantities[data.list_ticket[0].id] = 1;
      } else {
        data.list_ticket?.forEach(ticket => {
          initialQuantities[ticket.id] = 0;
        });
      }
      setQuantities(initialQuantities);
    } catch (err) {
      setEvent(null);
      console.error('Failed to fetch sales report:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto pb-10 animate-pulse">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Left Panel */}
          <div className="md:col-span-1 space-y-4">
            <div className="w-full h-[300px] bg-gray-700 rounded-xl"></div>
            <div className="space-y-4 mt-6">
              <div className="h-4 bg-gray-700 w-20 rounded"></div>
              <div className="h-4 bg-gray-700 w-1/2 rounded"></div>
              <div className="h-4 bg-gray-800 w-3/4 rounded"></div>
            </div>
            <div className="space-y-2 mt-6">
              <div className="h-4 bg-gray-700 w-20 rounded"></div>
              <div className="h-4 bg-gray-700 w-32 rounded"></div>
            </div>
            <div className="space-y-2 mt-6">
              <div className="h-4 bg-gray-700 w-20 rounded"></div>
              <div className="h-4 bg-gray-700 w-40 rounded"></div>
            </div>
            <div className="h-4 bg-gray-700 w-32 mt-4 rounded"></div>
            <div className="h-4 bg-gray-700 w-40 rounded"></div>
          </div>

          {/* Right Panel */}
          <div className="md:col-span-2 space-y-6">
            <div className="h-8 bg-gray-700 w-1/2 rounded"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-700 rounded-md"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 w-32 rounded"></div>
                <div className="h-4 bg-gray-700 w-48 rounded"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-700 rounded-md"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 w-48 rounded"></div>
                <div className="h-4 bg-gray-700 w-32 rounded"></div>
              </div>
            </div>
            <div className="bg-[#1a1c29] p-6 rounded-lg border border-gray-700 space-y-4">
              <div className="h-6 bg-gray-700 w-32 rounded"></div>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-800 rounded-lg w-full"></div>
              ))}
              <div className="h-10 bg-gray-700 w-full rounded"></div>
            </div>
            <div>
              <div className="h-6 bg-gray-700 w-32 mb-2 rounded"></div>
              <div className="h-20 bg-gray-800 rounded"></div>
            </div>
            <div>
              <div className="h-6 bg-gray-700 w-32 mb-2 rounded"></div>
              <div className="h-60 bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return <p className="text-red-500">Event not found.</p>;

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  const formattedStartDate = format(startDate, 'EEE, d MMM yyyy');

  const startDay = format(startDate, 'd');         // contoh: "1"
  const startMonth = format(startDate, 'MMM');     // contoh: "May"
  const formattedStartTime = format(startDate, 'HH:mm');
  const formattedEndTime = format(endDate, 'HH:mm');

  function increaseQty(ticketId) {
    setQuantities(prev => ({ ...prev, [ticketId]: prev[ticketId] + 1 }));
  }
  function decreaseQty(ticketId) {
    setQuantities(prev => ({ ...prev, [ticketId]: Math.max(prev[ticketId] - 1, 0) }));
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
    console.log('Lanjut ke registrasi ' + total);
  }

  async function handleSubmitRegister(e) {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Name and Email are required!');
      return;
    }
    const tickets = Object.entries(quantities)
      .filter(([id, quantity]) => quantity > 0)
      .map(([id, quantity]) => {
        const ticket = event.list_ticket.find(t => String(t.id) === String(id));
        return {
          id: parseInt(id),
          name: ticket?.name || '',
          price: ticket?.price || 0,
          quantity
        };
      });
    setIsRegistered(true);
    try {
      // Find selected payment code
      let payment = '';
      if (selectedPayment) {
        for (const group of payments) {
          const found = group.items.find(item => item.label === selectedPayment);
          if (found) {
            payment = found.code;
            break;
          }
        }
      }
      const payload = {
        name: formData.name,
        email: formData.email,
        no_hp: formData.phone,
        event_id: event.id,
        tickets,
        payment,
        fees: hasPaidTicket()
          ? [{ type: 'Service fee', value: 2000 }]
          : [],
        total: getTotalPrice()
      };
      let response;
      if (!hasPaidTicket()) {
        // Free registration
        response = await axios.post(`${urlBe}/events/regis`, payload);
        alert(response.data.message);
        setRegistrationModal(false);
      } else {
        // Paid registration
        response = await axios.post(`${urlBe}/payment/create-invoice`, payload);
        if (response.data && response.data.data.invoice_url) {
          window.location.href = response.data.data.invoice_url;
        } else {
          alert(response.data.message || 'Invoice created. Please proceed to payment.');
          setRegistrationModal(false);
        }
      }
    } catch (err) {
      console.error(err);
      setIsRegistered(false);
      alert('Registrasi gagal.');
    }
  }


  return (
    <div className='mb-16 mt-4'>
      <div className="flex flex-col md:flex-row gap-4 pb-2 justify-center items-start">
        {/* Left Panel */}
        <div className="w-full lg:max-w-[300px] pr-4 items-center">
          {/* image */}
          <div className='w-full max-w-[300px] mx-auto flex'>
            <img
              src={event.image || 'https://wallpapercave.com/wp/wp9297718.jpg'}
              alt={event.name}
              className="rounded-xl w-full aspect-square object-cover mx-auto"
              style={{ aspectRatio: '1 / 1' }}
            />
          </div>
          {/* host */}
          <div className='hidden md:block'>
            <div className="mt-6">
              <h3 className="text-responsive-item-title text-[#a2a2a2]">Host</h3>
              <hr className="border-t border-gray-300 my-2 opacity-20" />
              <div className='flex flex-row justify-between items-center'>
                <div className="flex items-center gap-3">
                  <img
                    src={event.created_by.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.created_by?.name || 'User')}&background=random`}
                    alt="Host Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-white text-responsive-sub-title">{event.created_by.name}</span>
                </div>

                <img
                  src={insta}
                  alt="Instagram Icon"
                  className="w-6 h-6"
                />
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
                {event.registered.list.map(user => user.name).join(", ")}
                {event.registered.others > 0 && ` and ${event.registered.others} others`}
              </div>
            </div>

            <div className="mt-6 mb-4">
              <h3 className="text-responsive-item-title text-[#a2a2a2]">Share</h3>
              <hr className="border-t border-gray-300 my-2 opacity-20" />
              <div className="flex flex-row items-center gap-2">
                <img
                  src={copy}
                  alt="Copy Icon"
                  className="w-5 h-5 cursor-pointer"
                  onClick={handleCopy}
                />
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
            {/* Calendar Icon */}
            <div className="w-12 h-12 rounded-md flex flex-col items-center justify-center text-white font-bold text-xs leading-none border border-white">
              <CalendarDays className="text-white w-7 h-7" />
            </div>
            <div className="flex flex-col ml-4">
              <p className="text-responsive-medium text-white">
                {formattedStartDate}
              </p>
              <p className="text-responsive-caption text-[#a2a2a2] mt-1">
                {formattedStartTime} - {formattedEndTime} WIB
              </p>
            </div>
          </div>
          <div className="flex">
            {/* Map Pointer Icon */}
            <div className="w-12 h-12 rounded-md flex flex-col items-center justify-center text-white font-bold text-xs leading-none border border-white">
              <MapPin className="text-white w-7 h-7" />
            </div>

            <div className="flex flex-col ml-4">
              <p className="text-responsive-medium text-white">
                {event.location_name}
              </p>
              <p className="text-responsive-caption text-[#a2a2a2]">{event.location_address}</p>
            </div>
          </div>

          <button
            className="hidden md:block text-responsive-item-title text-white w-full py-2 mt-4 rounded bg-gradient-to-r from-[#44A08D] to-[#00594F] hover:from-[#58c1ac] hover:to-[#007467]"
            onClick={() => setTicketModal(true)}
          >
            Register
          </button>

          {/* About Section */}
          <div>
            <h2 className="text-responsive-sub-title text-[#a2a2a2] mb-2">About Event</h2>
            <hr className="border-t border-gray-300 my-2 opacity-20" />
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {event.description || 'No description provided.'}
            </p>
          </div>

          {/* Location Section */}
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
            ></iframe>
          </div>

          <div className='block md:hidden'>
            <div className="mt-6">
              <h3 className="text-responsive-item-title text-[#a2a2a2]">Host</h3>
              <hr className="border-t border-gray-300 my-2 opacity-20" />
              <div className='flex flex-row justify-between items-center'>
                <div className="flex items-center gap-3">
                  <img
                    src={event.created_by.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.created_by?.name || 'User')}&background=random`}
                    alt="Host Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-white text-responsive-sub-title">{event.created_by.name}</span>
                </div>

                <img
                  src={insta}
                  alt="Instagram Icon"
                  className="w-6 h-6"
                />
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
                {event.registered.list.map(user => user.name).join(", ")}
                {event.registered.others > 0 && ` and ${event.registered.others} others`}
              </div>
            </div>

            <div className="mt-6 mb-4">
              <h3 className="text-responsive-item-title text-[#a2a2a2]">Share</h3>
              <hr className="border-t border-gray-300 my-2 opacity-20" />
              <div className="flex flex-row items-center gap-2">
                <img
                  src={copy}
                  alt="Copy Icon"
                  className="w-5 h-5 cursor-pointer"
                  onClick={handleCopy}
                />
                <p className="text-white text-responsive-regular mt-0.5">Copy link</p>
              </div>
            </div>
            <h3 className="text-responsive-item-title text-[#a2a2a2] mb-2">Contact the Host</h3>
            <h3 className="text-responsive-item-title text-[#a2a2a2] mb-2">Report Event</h3>
          </div>
        </div>

        <div className='fixed left-0 bottom-5 w-full z-20 flex justify-center items-center md:hidden'>
          <button
            className="text-responsive-item-title text-white w-full max-w-md py-2 rounded-lg bg-gradient-to-r from-[#44A08D] to-[#00594F] hover:from-[#58c1ac] hover:to-[#007467]"
            onClick={() => setTicketModal(true)}
          >
            Register
          </button>
        </div>

        <AnimatePresence>
          {copied && (
            <motion.div
              key="copy"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: 0 }}
              transition={{ duration: 0.3, ease: "easeIn" }}
              className="fixed top-5 -translate-x-1/2 bg-green-500 text-white z-50 overflow-y-auto shadow-xl px-4 py-2 rounded"
            >
              Copied to clipboard!
            </motion.div>
          )}
        </AnimatePresence>

        {ticketModal && (
          <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div 
              className="bg-[#141717] w-[90%] max-w-md p-6 rounded-lg border border-[#212121]"
              ref={ticketModalRef}
            >
              <h2 className="text-responsive-sub-title text-white mb-2">Registration</h2>
              {event.list_ticket?.map(ticket => (
                <div
                  key={ticket.id}
                  className="flex mb-2 justify-between items-center bg-[#1C1D1D] rounded-lg px-4 py-2 border border-[#212121]"
                >
                  <div>
                    <h3 className="text-responsive-medium text-white">{ticket.name}</h3>
                    <p className="text-responsive-caption text-[#a2a2a2]">
                      {ticket.price === 0 ? 'Free' : `Rp ${ticket.price.toLocaleString()}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQty(ticket.id)}
                      className="w-6 h-6 bg-[#303030] text-white text-sm rounded flex items-center justify-center"
                    >
                      –
                    </button>
                    <span className="w-6 text-center">{quantities[ticket.id]}</span>
                    <button
                      onClick={() => increaseQty(ticket.id)}
                      className="w-6 h-6 bg-[#303030] text-white text-sm rounded flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              {errorMessage && (
                <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
              )}
              <button
                className="bg-white text-responsive-item-title text-[#141717] w-full py-2 mt-2 rounded hover:bg-[#ffffffe4]"
                onClick={handleRegister}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {registrationModal && (
          <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div
              ref={registrationModalRef}
              className="bg-[#141717] text-white rounded-xl shadow-lg w-[90%] max-w-md max-h-[90vh] overflow-y-auto p-6"
            >
              {/* Event Info */}
              <div className="border border-[#a2a2a2] rounded-xl p-4 w-full max-w-md mx-auto text-white">
                {/* Header: Gambar + Info */}
                <div className="flex gap-4 mb-4">
                  <img
                    src={event.image || 'https://wallpapercave.com/wp/wp9297718.jpg'}
                    alt="Event"
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div>
                    <h3 className="text-responsive-item-title">{event.name}</h3>
                    <p className="text-responsive-caption text-[#a2a2a2]">{startDay} {startMonth} at {formattedStartTime} WIB</p>
                    <p className="text-responsive-caption text-[#a2a2a2]">{event.location_name}</p>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-4">
                  <div
                    onClick={() => setShowPromoInput(!showPromoInput)}
                    className="text-[#13E7BD] text-responsive-caption cursor-pointer w-1/3"
                  >
                    Add Promo Code
                  </div>

                  {showPromoInput && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        className="flex-1 rounded border border-[#a2a2a2] bg-transparent px-3 py-2 text-responsive-regular focus:outline-none focus:border-cyan-400"
                      />
                      <button className="bg-white text-black px-4 rounded text-responsive-medium-normal">
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Harga */}
                <div className="space-y-1 text-responsive-caption text-[#a2a2a2]">
                  {getSelectedTickets().map(ticket => (
                    <div key={ticket.id} className="flex justify-between">
                      <span>{ticket.name} (x{quantities[ticket.id]})</span>
                      <span>{ticket.price === 0 ? 'FREE' : `Rp ${(ticket.price * quantities[ticket.id]).toLocaleString()}`}</span>
                    </div>
                  ))}
                  {hasPaidTicket() && (
                    <div className="flex justify-between">
                      <span>Service Fee</span>
                      <span>Rp 2.000</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-responsive-medium mt-1">
                  <span>Total Price</span>
                  <span>
                    {getSelectedTickets().length === 0 || getSelectedTickets().every(ticket => ticket.price === 0)
                      ? 'FREE'
                      : `Rp ${getTotalPrice().toLocaleString()}`}
                  </span>
                </div>
              </div>

              {/* User Info */}
              <div className="flex flex-col gap-3 w-full mt-4">
                <div className="text-white text-responsive-sub-title">Your Info</div>
                <div className="flex flex-col gap-1">
                  <label className="text-white text-responsive-caption-bold">Name *</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-[#1c1d1d] border border-gray-600 rounded-lg px-3 py-2 text-gray-400 w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-white text-responsive-caption-bold">Email *</label>
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-[#1c1d1d] border border-gray-600 rounded-lg px-3 py-2 text-gray-400 w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-white text-responsive-caption-bold">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="081XXXXXXX"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="bg-[#1c1d1d] border border-gray-600 rounded-lg px-3 py-2 text-gray-400 w-full"
                  />
                </div>
              </div>

              {/* Payment */}
              {/* Show payment only if at least one selected ticket is paid */}
              {hasPaidTicket() && (
                <div className="flex flex-col gap-3 w-full mt-4">
                  <div className="text-white text-responsive-sub-title">Payment</div>
                  <div className="flex flex-col gap-1 mb-2">
                    {payments.map((group) => (
                      <div key={group.group} className="flex flex-col gap-1">
                        <div
                          className={`text-responsive-caption-bold cursor-pointer py-1 rounded transition-colors duration-150 ${
                            selectedPaymentGroup === group.group
                              ? "text-white"
                              : "text-[#a2a2a2]"
                          }`}
                          onClick={() => {
                            if (selectedPaymentGroup !== group.group) {
                              setSelectedPaymentGroup(group.group);
                              setSelectedPayment(null); // reset selected payment
                            }
                          }}
                        >
                          {group.group}
                        </div>
                        {selectedPaymentGroup === group.group && (
                          <div className="flex flex-col gap-1 w-full">
                            {group.items.map((item) => (
                              <div
                                key={item.label}
                                className={`flex items-center gap-3 p-2 rounded-lg border w-full cursor-pointer ${
                                  selectedPayment === item.label
                                    ? "border-[#13E7BD] bg-[#1c1d1d]"
                                    : "border-[#212121] bg-[#1c1d1d]"
                                }`}
                                onClick={() => setSelectedPayment(item.label)}
                              >
                                <img src={item.icon} alt={item.label} className="w-9 h-9" />
                                <div className="text-[#a2a2a2] text-responsive-medium flex-1">
                                  {item.label}
                                </div>
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value={item.label}
                                  checked={selectedPayment === item.label}
                                  onChange={() => setSelectedPayment(item.label)}
                                  className="accent-[#13E7BD] w-5 h-5 cursor-pointer"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Continue */}
              <button
                className="bg-white text-[#1a1c29] font-bold rounded-lg py-3 w-full mt-4"
                onClick={handleSubmitRegister}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetailGuest;
