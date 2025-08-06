import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import capacity from '../assets/capacity.png';
import grupRegis from '../assets/grup-regist.png';
import regis from '../assets/regis.png';
import promo from '../assets/promo.png';
import {
  IdCard,
  UserRound,
  Mail,
  Phone,
  MessageSquarePlus,
  Link,
  CircleDot,
  CheckSquare2,
  ChevronDown,
  ChevronsUpDown,
  ChevronsRight,
  ArrowUpToLine
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const urlBe = import.meta.env.VITE_URL_BE;

const TicketsPage = ({ id, event }) => {
  const [data, setData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState('Question per User');
  const [groupBookingEnabled, setGroupBookingEnabled] = useState(true);
  const [ticketQty, setTicketQty] = useState(5);
  const [taxPercentage, setTaxPercentage] = useState(10);
  const [selectedTicketType, setSelectedTicketType] = useState("Any Ticket Type");
  const [ticketPrice, setTicketPrice] = useState("150000");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [ticketDetail, setTicketDetail] = useState(null);
  document.title = 'Ticket Detail - Kebbu';

  // new ticket
  const [ticketName, setTicketName] = useState("");
  const [requireApproval, setRequireApproval] = useState(true);
  const [hideTicket, setHideTicket] = useState(false);
  const [pricingType, setPricingType] = useState("Free");
  const [showDescription, setShowDescription] = useState(false);
  const [showTicketLimit, setShowTicketLimit] = useState(false);
  const [showSalesDate, setShowSalesDate] = useState(false);
  const [showBundling, setShowBundling] = useState(false);
  const [description, setDescription] = useState("");
  const [ticketLimit, setTicketLimit] = useState("");
  const [bundleQty, setBundleQty] = useState(2);
  const [startDate, setStartDate] = useState("2025-06-13");
  const [startTime, setStartTime] = useState("01:00");
  const [endDate, setEndDate] = useState("2025-06-15");
  const [endTime, setEndTime] = useState("22:00");

  // Modal Refs
  const registrationModalRef = useRef(null);
  const capacityModalRef = useRef(null);
  const groupModalRef = useRef(null);
  const taxModalRef = useRef(null);
  const newTicketModalRef = useRef(null);
  const ticketDetailRef = useRef(null);
  // Tambahkan modal lainnya di sini...

  // Modal States
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isTicketDetailOpen, setIsTicketDetailOpen] = useState(false);
  // Tambahkan modal lainnya di sini...

  const modals = [
    { ref: registrationModalRef, isOpen: isRegistrationModalOpen, close: () => setIsRegistrationModalOpen(false) },
    { ref: capacityModalRef, isOpen: isCapacityModalOpen, close: () => setIsCapacityModalOpen(false) },
    { ref: groupModalRef, isOpen: isGroupModalOpen, close: () => setIsGroupModalOpen(false) },
    { ref: taxModalRef, isOpen: isTaxModalOpen, close: () => setIsTaxModalOpen(false) },
    { ref: newTicketModalRef, isOpen: isNewTicketModalOpen, close: () => resetNewTicketModal() },
    { ref: ticketDetailRef, isOpen: isTicketDetailOpen, close: () => closeTicketDetail() }
    // Tambahkan modal lain: { ref, isOpen, close }
  ];

  const resetNewTicketModal = () => {
    setTicketName("");
    setRequireApproval(true);
    setHideTicket(false);
    setPricingType("Free");
    setTicketPrice("150000");

    // Reset dynamic sections
    setShowDescription(false);
    setShowTicketLimit(false);
    setShowSalesDate(false);
    setShowBundling(false);

    setDescription("");
    setTicketLimit("");
    setBundleQty(2);
    setStartDate("2025-06-13");
    setStartTime("01:00");
    setEndDate("2025-06-15");
    setEndTime("22:00");

    // Terakhir, tutup modal
    setIsNewTicketModalOpen(false);
  };

  const createNewTicket = async () => {
    try {
      const response = await axios.post(`${urlBe}/ticket/create`, {
        event_id: data.id,
        name: ticketName,
        approval: requireApproval,
        hide: hideTicket,
        pricing_type: pricingType,
        price: pricingType === "Free" ? 0 : parseInt(ticketPrice.replace(/\D/g, ""), 10),
        description: showDescription ? description : "",
        max_capacity: showTicketLimit ? parseInt(ticketLimit.replace(/\D/g, ""), 10) : null,
        start_date: showSalesDate ? `${startDate}T${startTime}:00` : null,
        end_date: showSalesDate ? `${endDate}T${endTime}:00` : null,
        bundle_qty: showBundling ? bundleQty : null,
      }, {
        headers: {
          'x-jdticket': localStorage.getItem('token') || '',
        },
      });
      console.log('Ticket created:', response.data);
      resetNewTicketModal();
      fetchData(id); // Refresh data after creating new ticket
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('❌ Failed to create ticket. Please try again.');
    }
  };

  const formatPrice = (value) => {
    const number = value.replace(/\D/g, "");
    return Number(number).toLocaleString("id-ID");
  };

  useEffect(() => {
    fetchData(id);

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

  }, [id, modals.map(m => m.isOpen).join()]);

  const fetchData = async (id) => {
    try {
      const response = await axios.get(`${urlBe}/events/ticket-overview/${id}`, {
        headers: { 'x-jdticket': localStorage.getItem('token') || '', },
      });
      setData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch sales report:', err);
    }
  };

  const fetchTicketDetail = async (ticketId) => {
    try {
      const res = await axios.get(`${urlBe}/ticket/detail/${ticketId}`, {
        headers: {
          'x-jdticket': localStorage.getItem('token') || '',
        },
      });
      setTicketDetail(res.data.data);
      setIsTicketDetailOpen(true);
    } catch (err) {
      console.error('Failed to fetch ticket:', err);
    }
  };

  const closeTicketDetail = () => {
    setIsTicketDetailOpen(false);
    setTimeout(() => setTicketDetail(null), 300); // tunggu animasi selesai sebelum hapus data
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString).toLocaleDateString("en-GB", {
      weekday: 'short',
      day: 'numeric',
      month: 'long'
    });

    const parts = date.split(" ");
    return `${parts[0]}, ${parts[1]} ${parts[2]}`;
  };
  const formatTime = (isoString) => new Date(isoString).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });


  return (
    <div>
      {/* Summary Cards */}
      <div className="flex gap-3 justify-between items-center">
        <div
          className="bg-[#141717] rounded-xl px-4 py-4 w-full flex-1 cursor-pointer hover:bg-[#1d1f1f] transition"
          onClick={() => setIsRegistrationModalOpen(true)}
        >
          <div className="flex items-center gap-4">
            <img src={regis} alt="Registration Icon" className="w-10 h-10 object-contain" />
            <div>
              <div className="text-xl font-['Satoshi-Bold',_sans-serif]">Registration</div>
              <div className="text-sm text-[#A2A2A2]">{!event.is_register ? 'Closed' : 'Open'}</div>
            </div>
          </div>
        </div>

        <div
          className="bg-[#141717] rounded-xl px-4 py-4 w-full flex-1 cursor-pointer hover:bg-[#1d1f1f] transition"
          onClick={() => setIsCapacityModalOpen(true)}
        >
          <div className="flex items-center gap-4">
            <img src={capacity} alt="Capacity Icon" className="w-10 h-10 object-contain" />
            <div>
              <div className="text-xl font-['Satoshi-Bold',_sans-serif]">Capacity</div>
              <div className="text-sm text-[#A2A2A2]">{event.max_capacity === null ? 'Unlimited' : event.max_capacity}</div>
            </div>
          </div>
        </div>

        <div
          className="bg-[#141717] rounded-xl px-4 py-4 w-full flex-1 cursor-pointer hover:bg-[#1d1f1f] transition"
          onClick={() => setIsGroupModalOpen(true)}
        >
          <div className="flex items-center gap-4">
            <img src={grupRegis} alt="Group Booking Icon" className="w-10 h-10 object-contain" />
            <div>
              <div className="text-xl font-['Satoshi-Bold',_sans-serif]">Group Booking</div>
              <div className="text-sm text-[#A2A2A2]">{!event.group_register ? 'off' : event.group_register}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isRegistrationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div ref={registrationModalRef} className="bg-[#141717] text-white p-6 rounded-xl w-[350px] shadow-lg font-['Satoshi-Regular',_sans-serif]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#2A2A2A] rounded-full flex items-center justify-center">
                <img src={regis} alt="Icon" className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-['Satoshi-Bold',_sans-serif]">Registration</h2>
            </div>
            <p className="text-sm text-[#A2A2A2] mb-2">
              Turn off registration to stop accepting new attendees, including those with invitations.
            </p>
            <p className="text-sm text-[#A2A2A2] mb-4">
              When registration is open, guest capacity and ticket availability rules will still apply.
            </p>

            <div className="flex items-center justify-between mb-6">
              <span className="text-white text-sm">Accept Registration</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-green-500 transition"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
              </label>
            </div>

            <button
              className="w-full py-2 rounded-lg bg-white text-black font-['Satoshi-Bold',_sans-serif]"
              onClick={() => setIsModalOpen(false)}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
      {isCapacityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div ref={capacityModalRef} className="bg-[#141717] text-white p-6 rounded-xl w-[400px] shadow-lg font-['Satoshi-Regular',_sans-serif]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#2A2A2A] rounded-full flex items-center justify-center">
                <img src={capacity} alt="Capacity Icon" className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-['Satoshi-Bold',_sans-serif]">Capacity</h2>
            </div>

            <p className="text-sm text-[#A2A2A2] mb-4">
              Sign-ups will close by themselves when we hit full capacity — but don’t worry, only confirmed guests are counted!
            </p>

            <div className="flex items-center bg-[#1f1f1f] rounded-md px-3 py-2 mb-4 justify-between">
              <input
                type="text"
                className="bg-transparent text-white text-sm outline-none flex-1 font-['Satoshi-Medium',_sans-serif]"
                placeholder="Unlimited"
                disabled
              />
              <div className="flex gap-2">
                <button className="text-white bg-[#2d2d2d] rounded px-2 py-1 text-lg">+</button>
                <button className="text-white bg-[#2d2d2d] rounded px-2 py-1 text-lg">−</button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-white text-sm">Waitlist Enabled After Max Capacity</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-green-500 transition"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                className="w-1/2 py-2 rounded-lg bg-[#2d2d2d] text-[#A2A2A2] font-['Satoshi-Bold',_sans-serif]"
                onClick={() => setIsCapacityModalOpen(false)}
              >
                Remove Limit
              </button>
              <button
                className="w-1/2 py-2 rounded-lg bg-white text-black font-['Satoshi-Bold',_sans-serif]"
                onClick={() => setIsCapacityModalOpen(false)}
              >
                Set Limit
              </button>
            </div>
          </div>
        </div>
      )}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div ref={groupModalRef} className="bg-[#141717] text-white p-6 rounded-xl w-[400px] shadow-lg font-['Satoshi-Regular',_sans-serif]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#2A2A2A] rounded-full flex items-center justify-center">
                <img src={grupRegis} alt="Group Booking Icon" className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-['Satoshi-Bold',_sans-serif]">Group Booking</h2>
            </div>

            <p className="text-sm text-[#A2A2A2] mb-4">
              Allow guests to book multiple tickets in one go — perfect for friends or group signups.
            </p>

            {/* Group Booking Toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-sm">Group Booking</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={groupBookingEnabled}
                  onChange={() => setGroupBookingEnabled(!groupBookingEnabled)}
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-green-500 transition"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
              </label>
            </div>

            {/* Qty Limit */}
            <div className="mb-6">
              <label className="text-sm block mb-1">Ticket Limit</label>
              <div className="flex items-center bg-[#1f1f1f] rounded-md px-3 py-2 justify-between">
                <span className="text-sm text-white">Qty</span>
                <input
                  type="text"
                  value={`${ticketQty} tickets per user`}
                  disabled
                  className="bg-transparent text-white text-sm outline-none text-right flex-1 mx-2"
                />
                <div className="flex gap-2">
                  <button
                    className="text-white bg-[#2d2d2d] rounded px-2 py-1 text-lg"
                    onClick={() => setTicketQty(prev => Math.min(prev + 1, 10))}
                  >
                    +
                  </button>
                  <button
                    className="text-white bg-[#2d2d2d] rounded px-2 py-1 text-lg"
                    onClick={() => setTicketQty(prev => Math.max(prev - 1, 1))}
                  >
                    −
                  </button>
                </div>
              </div>
            </div>

            <button
              className="w-full py-2 rounded-lg bg-white text-black font-['Satoshi-Bold',_sans-serif]"
              onClick={() => setIsGroupModalOpen(false)}
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Ticket Info Cards */}
      <div className="mt-8">
        {/* Header: Title + Add Tax Fee Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-['Satoshi-Bold',_sans-serif] text-white">Ticket Category</h2>
          <button
            onClick={() => setIsTaxModalOpen(true)}
            className="text-sm bg-[#1C1D1D] text-white px-3 py-1 font-['Satoshi-Medium',_sans-serif] rounded-md hover:bg-[#3A3A3A] transition flex items-center gap-1"
          >
            Add Tax Fee (%) <span className="text-lg">+</span>
          </button>
        </div>

        {/* Grid of Ticket Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3 font-['Satoshi-Medium',_sans-serif]">
          {data?.list_ticket.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#141717] rounded-xl px-4 pt-4 w-full flex-1 cursor-pointer hover:bg-[#1d1f1f] transition"
              onClick={() => fetchTicketDetail(item.id)}
            >
              {/* Top row: Name and optional badge */}
              <div className="flex justify-between items-center mb-2 ">
                <div className="text-sm text-white ">{item.name}</div>
                {item.is_approval && (
                  <span className="text-xs bg-[#3C2F14] text-[#F5C249] px-2 py-0.5 rounded-full ">
                    Need Approval
                  </span>
                )}
              </div>

              {/* Price and capacity */}
              <div className="flex justify-between items-center">
                <div className="text-xl font-['Satoshi-Bold',_sans-serif] mb-3">
                  {item.price === 0 ? "FREE" : item.price.toLocaleString('id-ID')}
                </div>
                <div className="text-xl font-['Satoshi-Bold',_sans-serif] mb-3">
                  {item.max_capacity === null ? "∞" : item.max_capacity.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          ))}

          {/* Add New Ticket Card */}
          <div
            onClick={() => setIsNewTicketModalOpen(true)}
            className="border border-dashed border-[#3F3F3F] rounded-xl px-4 w-full flex items-center justify-center text-white cursor-pointer hover:border-[#AAAAAA] transition"
          >
            + Add New Ticket Category
          </div>
        </div>
      </div>

      {/* Modal */}
      {isTaxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div ref={taxModalRef} className="bg-[#141717] text-white p-6 rounded-xl w-[400px] shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#2A2A2A] rounded-full flex items-center justify-center">
                <img src="/icon/tax-icon.png" alt="Tax Icon" className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-['Satoshi-Bold',_sans-serif]">Tax Fee</h2>
            </div>

            <p className="text-sm text-[#A2A2A2] mb-4">
              Ticket buyers will be charged additional tax.
            </p>

            {/* Tax Percentage */}
            <label className="text-sm block mb-1">Tax Percentage (%)</label>
            <div className="flex items-center bg-[#1f1f1f] rounded-md px-3 py-2 justify-between mb-4">
              <input
                type="text"
                value={`${taxPercentage}%`}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 0 && val <= 100) {
                    setTaxPercentage(val);
                  } else if (e.target.value === "") {
                    setTaxPercentage("");
                  }
                }}
                min="0"
                max="100"
                className="bg-transparent text-white text-sm outline-none text-left flex-1"
              />
              <div className="flex gap-2">
                <button
                  className="text-white bg-[#2d2d2d] rounded px-2 py-1 text-lg"
                  onClick={() => setTaxPercentage(prev => Math.max(prev - 1, 0))}
                >
                  −
                </button>
                <button
                  className="text-white bg-[#2d2d2d] rounded px-2 py-1 text-lg"
                  onClick={() => setTaxPercentage(prev => Math.min(prev + 1, 100))}
                >
                  +
                </button>
              </div>
            </div>

            {/* Dropdown */}
            <label className="text-sm block mb-1">Apply Tax To</label>
            <select
              className="w-full bg-[#1f1f1f] text-white text-sm px-3 py-2 rounded-md mb-6 outline-none"
              value={selectedTicketType}
              onChange={(e) => setSelectedTicketType(e.target.value)}
            >
              <option value="Any Ticket Type">Any Ticket Type</option>
              {data?.list_ticket.map((ticket) => (
                <option key={ticket.id} value={ticket.name}>{ticket.name}</option>
              ))}
            </select>

            <button
              className="w-full py-2 rounded-lg bg-white text-black font-['Satoshi-Bold',_sans-serif]"
              onClick={() => {
                // Kirim data tax jika perlu
                setIsTaxModalOpen(false);
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
      <AnimatePresence>
        {isTicketDetailOpen && ticketDetail && (
          <div className="fixed inset-0 z-50 flex justify-end items-center bg-black/50">
            <motion.div
              key="ticketModal"
              ref={ticketDetailRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-[#141717] text-white w-full sm:w-[430px] max-h-[90vh] rounded-xl overflow-y-auto shadow-xl"
            >
              <div className="flex items-center gap-2 text-lg font-['Satoshi-Bold',_sans-serif] px-8 pt-4">
                <ChevronsRight className='w-5 h-5 cursor-pointer text-[#a2a2a2]' onClick={closeTicketDetail}/>
                <span>Ticket Information</span>
              </div>
              <hr className="my-2 border-[#333]" />
              <div className="px-8 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img src="/icon/ticket-icon.png" alt="ticket" className="w-10 h-10" />
                    <div>
                      <h2 className="text-lg font-['Satoshi-Bold',_sans-serif]">{ticketDetail.name}</h2>
                      <p className="text-lg font-['Satoshi-Bold',_sans-serif]">Rp {Number(ticketDetail.price).toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {ticketDetail.is_approval && (
                      <span className="text-sm bg-[#3C2F14] text-[#F5C249] px-2 py-0.5 rounded-full">
                        Need Approval
                      </span>
                    )}
                    <button className="text-sm text-[#A2A2A2] bg-[#303030] font-['Satoshi-Medium',_sans-serif] px-2 py-1 rounded-md">✎ Edit</button>
                  </div>
                </div>

                {/* Description */}
                <input
                  type="text"
                  className="w-full bg-[#1c1d1d] text-[#A2A2A2] text-lg px-3 py-2 rounded-md mb-4 outline-none"
                  value={ticketDetail.description || "Description"}
                  disabled
                />

                {/* Ticket Limit */}
                <div className="flex items-center text-md font-['Satoshi-Medium',_sans-serif] gap-2">
                  <ArrowUpToLine className='w-4 h-4'/>
                  <label>Ticket Limit:</label>
                  <span>{ticketDetail.max_capacity ? "Unlimited" : ticketDetail.max_capacity}</span>
                </div>

                <hr className="my-3 border-[#333]" />

                {/* Sales Start and End */}
                <div className="mb-2">
                  <label className="text-lg font-['Satoshi-Bold',_sans-serif] block mb-1">Sales Start and Sales End</label>
                  <div className="space-y-3 text-md mb-4 font-['Satoshi-Medium'] pl-3">
                    {/* Start */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 pt-2">Start</div>
                      <div className="flex w-full bg-[#1c1d1d] rounded-md overflow-hidden text-white">
                        <div className="px-4 py-2 flex-1">{formatDate(ticketDetail.start_date)}</div>
                        <div className="w-[1px] bg-[#333] my-1" />
                        <div className="px-4 py-2 w-[80px] text-right">{formatTime(ticketDetail.start_date)}</div>
                      </div>
                    </div>

                    {/* End */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 pt-2">End</div>
                      <div className="flex w-full bg-[#1c1d1d] rounded-md overflow-hidden text-white">
                        <div className="px-4 py-2 flex-1">{formatDate(ticketDetail.end_date)}</div>
                        <div className="w-[1px] bg-[#333] my-1" />
                        <div className="px-4 py-2 w-[80px] text-right">{formatTime(ticketDetail.start_date)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bundling */}
                {ticketDetail.qty_bundle && (
                  <div className="mb-4">
                    <hr className="my-3 border-[#333]" />
                    <label className="text-lg font-['Satoshi-Bold',_sans-serif] block mb-1">Bundling Ticket</label>
                    <input
                      type="text"
                      value={`${ticketDetail.qty_bundle} tickets per bundle`}
                      disabled
                      className="w-full bg-[#1f1f1f] text-white text-sm px-3 py-2 rounded-md outline-none"
                    />
                  </div>
                )}

                <hr className="my-3 border-[#333]" />

                {/* Guest List */}
                <div className="mb-2 flex justify-between items-center">
                  <h3 className="text-lg font-['Satoshi-Bold',_sans-serif]">Guests</h3>
                  <button className="text-xs text-[#A2A2A2] bg-[#303030] font-['Satoshi-Medium',_sans-serif] px-2 py-1 rounded-md">+ Add Guests</button>
                </div>
                <div className="space-y-2">
                  {ticketDetail.list_guest?.map((guest, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#1f1f1f] px-3 py-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <img src={guest.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(guest.name || 'User')}&background=random`} alt={guest.name} className="w-6 h-6 rounded-full" />
                        <div className="text-sm">{guest.name}</div>
                        <div className="text-xs text-[#A2A2A2]">{guest.email}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${guest.status === "Going" ? "bg-[#31D34F]/10 text-[#31D34F]" : "bg-[#F2AB27]/10 text-[#F2AB27]"
                        }`}>
                        {guest.status ? guest.status : "PENDING"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div ref={newTicketModalRef} className="bg-[#141717] text-white rounded-xl shadow-lg w-[420px] max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#2A2A2A] rounded-full flex items-center justify-center">
                <img src="/icon/ticket-icon.png" alt="Ticket Icon" className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-['Satoshi-Bold',_sans-serif]">Ticket Category</h2>
            </div>

            {/* Ticket Name */}
            <label className="text-sm block mb-1">Ticket Name</label>
            <input
              type="text"
              value={ticketName}
              onChange={(e) => setTicketName(e.target.value)}
              placeholder="e.g., VIP, Regular"
              className="w-full bg-[#1f1f1f] text-white text-sm px-3 py-2 rounded-md mb-5 outline-none"
            />

            {/* Optional Addons (Dummy for now) */}
            <div className="space-y-3 text-sm text-[#A2A2A2] mb-6">
              {/* Description */}
              {!showDescription && (
                <div className="cursor-pointer hover:text-white" onClick={() => setShowDescription(true)}>
                  + Add Description
                </div>
              )}
              {showDescription && (
                <div className="mb-4">
                  <label className="text-sm text-white block mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what’s included in this ticket"
                    className="w-full bg-[#1f1f1f] text-white text-sm px-3 py-2 rounded-md outline-none"
                  />
                </div>
              )}

              {/* Ticket Limit */}
              {!showTicketLimit && (
                <div className="cursor-pointer hover:text-white" onClick={() => setShowTicketLimit(true)}>
                  + Add Ticket Limit
                </div>
              )}
              {showTicketLimit && (
                <div className="mb-4">
                  <label className="text-sm text-white block mb-1">Ticket Limit</label>
                  <div className="flex items-center bg-[#1f1f1f] rounded-md px-3 py-2 justify-between">
                    <input
                      type="text"
                      value={ticketLimit || "Unlimited"}
                      onChange={(e) => setTicketLimit(e.target.value)}
                      className="bg-transparent text-white text-sm outline-none flex-1"
                      placeholder="Unlimited"
                    />
                    <div className="flex gap-2">
                      <button
                        className="text-white bg-[#2d2d2d] rounded px-2 py-1 text-lg"
                        onClick={() => setTicketLimit((prev) => Math.max((+prev || 0) - 1, 1))}
                      >
                        −
                      </button>
                      <button
                        className="text-white bg-[#2d2d2d] rounded px-2 py-1 text-lg"
                        onClick={() => setTicketLimit((prev) => (+prev || 0) + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sales Date */}
              {!showSalesDate && (
                <div className="cursor-pointer hover:text-white" onClick={() => setShowSalesDate(true)}>
                  + Add Sales Start and Sales End
                </div>
              )}
              {showSalesDate && (
                <div className="mb-4">
                  <label className="text-sm text-white block mb-1">Sales Start and Sales End</label>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-[#A2A2A2]">Start</span>
                    <div className="flex gap-2">
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-[#1f1f1f] text-white px-2 py-1 rounded-md text-sm w-full" />
                      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-[#1f1f1f] text-white px-2 py-1 rounded-md text-sm w-[80px]" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-[#A2A2A2]">End</span>
                    <div className="flex gap-2">
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-[#1f1f1f] text-white px-2 py-1 rounded-md text-sm w-full" />
                      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-[#1f1f1f] text-white px-2 py-1 rounded-md text-sm w-[80px]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Bundling Ticket */}
              {!showBundling && (
                <div className="cursor-pointer hover:text-white" onClick={() => setShowBundling(true)}>
                  + Add Bundling Ticket
                </div>
              )}
              {showBundling && (
                <div className="mb-6">
                  <label className="text-sm text-white block mb-1">Bundling Ticket</label>
                  <div className="flex items-center bg-[#1f1f1f] rounded-md px-3 py-2 justify-between">
                    <span className="text-sm text-white">Qty</span>
                    <input
                      type="text"
                      value={`${bundleQty} tickets per bundle`}
                      disabled
                      className="bg-transparent text-white text-sm outline-none text-right flex-1 mx-2"
                    />
                    <div className="flex gap-2">
                      <button
                        className="text-white bg-[#2d2d2d] rounded px-2 py-1 text-lg"
                        onClick={() => setBundleQty((prev) => Math.max(prev - 1, 2))}
                      >
                        −
                      </button>
                      <button
                        className="text-white bg-[#2d2d2d] rounded px-2 py-1 text-lg"
                        onClick={() => setBundleQty((prev) => prev + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Switches */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm">Require Approval</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={requireApproval}
                  onChange={() => setRequireApproval(!requireApproval)}
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-green-500 transition"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
              </label>
            </div>

            <div className="flex items-center justify-between mb-5">
              <div className="text-sm">
                <div>Hide This Ticket</div>
                <div className="text-xs text-[#A2A2A2] mt-1">
                  If hidden, you will need to create access codes for guests to access this ticket type.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={hideTicket}
                  onChange={() => setHideTicket(!hideTicket)}
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-green-500 transition"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
              </label>
            </div>

            {/* Pricing Switch */}
            <div className="text-sm mb-6">
              <div className="mb-1">Pricing</div>
              <div className="flex mb-3">
                <button
                  onClick={() => setPricingType("Free")}
                  className={`w-1/2 py-2 rounded-l-md ${pricingType === "Free" ? "bg-white text-black" : "bg-[#1f1f1f] text-white"}`}
                >
                  Free
                </button>
                <button
                  onClick={() => setPricingType("Paid")}
                  className={`w-1/2 py-2 rounded-r-md ${pricingType === "Paid" ? "bg-white text-black" : "bg-[#1f1f1f] text-white"}`}
                >
                  Paid
                </button>
              </div>

              {pricingType === "Paid" && (
                <div className="flex items-center justify-between border border-white/30 rounded-md px-4 py-2">
                  <span className="text-sm text-[#A2A2A2]">Rp</span>
                  <input
                    type="text"
                    value={formatPrice(ticketPrice)}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    className="bg-transparent text-right flex-1 ml-2 text-white text-sm outline-none"
                    placeholder="0"
                  />
                </div>
              )}
            </div>

            <button
              className="w-full py-2 rounded-lg bg-white text-black font-['Satoshi-Bold',_sans-serif]"
              onClick={() => {
                // Save ticket logic here
                createNewTicket();
              }}
            >
              Create Ticket
            </button>
          </div>
        </div>
      )}

      {/* Divider */}
      <hr className="my-8 border-[#333]" />

      {/* Promo Code Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-['Satoshi-Bold',_sans-serif] text-white">Promo Code</h2>
        </div>
        <p className="text-[#A2A2A2] mb-4">Create coupons that can be applied to this event.</p>

        <div className="bg-[#141717] border border-[#212121] rounded-xl flex justify-between items-center p-2 font-['Satoshi-Medium',_sans-serif]">
          <div className="flex items-center gap-1">
            {/* Icon Placeholder (you can replace with real icon) */}
            <img src={promo} alt="Promo" className="w-14 h-14 object-contain" />
            <div>
              <div className="text-white font-['Satoshi-Bold',_sans-serif]">No Promo Codes</div>
              <div className="text-sm text-[#A2A2A2]">
                You can create promo codes to offer discounts to your guests
              </div>
            </div>
          </div>
          <button
            onClick={() => console.log("Add Promo clicked")}
            className="text-sm bg-[#1C1D1D] text-white px-3 py-1 mr-2 rounded-md hover:bg-[#3A3A3A] transition flex items-center gap-1"
          >
            Add Promo <span className="text-lg">+</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-8 border-[#333]" />

      {/* Create Additional Questions */}
      <div>
        {/* Header + Dropdown */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-['Satoshi-Bold',_sans-serif] text-white">
            Create Additional Questions
          </h2>
          <div className="relative">
            <div
              className="bg-[#1C1D1D] text-sm text-white px-3 py-1 rounded-md cursor-pointer hover:bg-[#3A3A3A] flex items-center gap-2"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              {selectedQuestionType} <ChevronDown className='w-4 h-4' />
            </div>
            {showDropdown && (
              <div className="absolute mt-1 bg-[#1C1D1D] border border-[#333] rounded-md shadow-md z-50">
                {['Question per User', 'Question per Ticket'].map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedQuestionType(item);
                      setShowDropdown(false);
                    }}
                    className="px-4 py-2 text-sm text-white hover:bg-[#333] cursor-pointer"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-[#A2A2A2] mb-6">
          Attendees will be asked the following questions during registration.
        </p>

        {/* Personal Information Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <IdCard className='w-6 h-6 text-[#31D34F]' />
            <span className="font-['Satoshi-Bold',_sans-serif] text-white">Personal Information</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="bg-[#141717] w-full border border-[#212121] text-white px-4 py-2 rounded-md flex items-center gap-2">
              <UserRound className='w-4 h-4 text-[#A2A2A2]' />
              <span>Full Name</span>
              <span className="text-[#A2A2A2] text-xs ml-auto">Required</span>
            </div>
            <div className="bg-[#141717] w-full border border-[#212121] text-white px-4 py-2 rounded-md flex items-center gap-2">
              <Mail className='w-4 h-4 text-[#A2A2A2]' />
              <span>Email</span>
              <span className="text-[#A2A2A2] text-xs ml-auto">Required</span>
            </div>
            <div className="bg-[#141717] w-full border border-[#212121] text-white px-4 py-2 rounded-md flex items-center gap-2">
              <Phone className='w-4 h-4 text-[#A2A2A2]' />
              <span>Phone Number</span>
              <span className="text-[#A2A2A2] text-xs ml-auto">Required</span>
              <ChevronsUpDown className='w-4 h-4 text-[#A2A2A2]' />
            </div>
          </div>
        </div>

        {/* Custom Question Section */}
        <div className='mb-10'>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquarePlus className='w-5 h-5 text-[#9747FF]' />
            <span className="font-['Satoshi-Bold',_sans-serif] text-white">Custom Question</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div
              className="border border-dashed border-[#3F3F3F] w-full text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer hover:border-[#AAAAAA]"
              onClick={() => console.log(`Add custom question: ${q.label}`)}
            >
              <span className="italic text-[#A2A2A2] text-base" style={{ fontFamily: 'Times New Roman' }}>
                T
              </span>
              <span>Text</span>
              <span className="ml-auto">+</span>
            </div>
            <div
              className="border border-dashed border-[#3F3F3F] w-full text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer hover:border-[#AAAAAA]"
              onClick={() => console.log(`Add custom question: ${q.label}`)}
            >
              <CircleDot className='w-3 h-3 text-[#A2A2A2]' />
              <span>Options</span>
              <span className="ml-auto">+</span>
            </div>
            <div
              className="border border-dashed border-[#3F3F3F] w-full text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer hover:border-[#AAAAAA]"
              onClick={() => console.log(`Add custom question: ${q.label}`)}
            >
              <CheckSquare2 className='w-3 h-3 text-[#A2A2A2]' />
              <span>Checkbox</span>
              <span className="ml-auto">+</span>
            </div>
            <div
              className="border border-dashed border-[#3F3F3F] w-full text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer hover:border-[#AAAAAA]"
              onClick={() => console.log(`Add custom question: ${q.label}`)}
            >
              <Link className='w-3 h-3 text-[#A2A2A2]' />
              <span>Website</span>
              <span className="ml-auto">+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketsPage;
