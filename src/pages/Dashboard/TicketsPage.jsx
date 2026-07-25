import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import capacity from '../../assets/capacity.png';
import grupRegis from '../../assets/grup-regist.png';
import regis from '../../assets/regis.png';
import promo from '../../assets/promo.png';
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
  ArrowUpToLine,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const urlBe = import.meta.env.VITE_URL_BE;

function ToggleSwitch({ checked, defaultChecked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
      />
      <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-green-500 transition"></div>
      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
    </label>
  );
}

function StepperButtons({ onDecrease, onIncrease }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onDecrease}
        className="text-white bg-[#2d2d2d] rounded px-2 py-1 text-lg hover:bg-[#3d3d3d]"
      >
        −
      </button>
      <button
        onClick={onIncrease}
        className="text-white bg-[#2d2d2d] rounded px-2 py-1 text-lg hover:bg-[#3d3d3d]"
      >
        +
      </button>
    </div>
  );
}

function ModalIconHeader({ icon, title, subtitle, size = 'md' }) {
  const isLg = size === 'lg';
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className={`flex items-center justify-center rounded-full ${isLg ? 'h-12 w-12 bg-[#232323]' : 'h-10 w-10 bg-[#2A2A2A]'
          }`}
      >
        {icon}
      </div>
      <div>
        <h2 className={`font-['Satoshi-Bold',_sans-serif] ${isLg ? 'text-2xl' : 'text-xl'}`}>
          {title}
        </h2>
        {subtitle && <p className="text-[#A2A2A2] text-sm">{subtitle}</p>}
      </div>
    </div>
  );
}

const TicketsPage = ({ id }) => {
  const [data, setData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState('Question per User');
  const [groupBookingEnabled, setGroupBookingEnabled] = useState(true);
  const [ticketQty, setTicketQty] = useState(5);
  const [taxPercentage, setTaxPercentage] = useState(10);
  const [selectedTicketType, setSelectedTicketType] = useState('Any Ticket Type');
  const [ticketPrice, setTicketPrice] = useState('150000');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [ticketDetail, setTicketDetail] = useState(null);
  document.title = 'Ticket Detail - Kebbu';

  // new ticket / edit ticket
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [accessCode, setAccessCode] = useState('');
  const [showAccessCodeInput, setShowAccessCodeInput] = useState(false);
  const [ticketName, setTicketName] = useState('');
  const [requireApproval, setRequireApproval] = useState(true);
  const [hideTicket, setHideTicket] = useState(false);
  const [pricingType, setPricingType] = useState('Free');
  const [showDescription, setShowDescription] = useState(false);
  const [showTicketLimit, setShowTicketLimit] = useState(false);
  const [showSalesDate, setShowSalesDate] = useState(false);
  const [showBundling, setShowBundling] = useState(false);
  const [description, setDescription] = useState('');
  const [ticketLimit, setTicketLimit] = useState('');
  const [bundleQty, setBundleQty] = useState(2);
  const [startDate, setStartDate] = useState('2025-06-13');
  const [startTime, setStartTime] = useState('01:00');
  const [endDate, setEndDate] = useState('2025-06-15');
  const [endTime, setEndTime] = useState('22:00');
  const [textQuestion, setTextQuestion] = useState('');
  const [textRequired, setTextRequired] = useState(true);
  const [optionsQuestion, setOptionsQuestion] = useState('');
  const [optionsRequired, setOptionsRequired] = useState(true);
  const [optionInput, setOptionInput] = useState('');
  const [optionsList, setOptionsList] = useState([]);
  const [checkboxQuestion, setCheckboxQuestion] = useState('');
  const [checkboxRequired, setCheckboxRequired] = useState(true);
  const [checkboxInput, setCheckboxInput] = useState('');
  const [checkboxList, setCheckboxList] = useState([]);

  // Modal Refs
  const registrationModalRef = useRef(null);
  const capacityModalRef = useRef(null);
  const groupModalRef = useRef(null);
  const taxModalRef = useRef(null);
  const newTicketModalRef = useRef(null);
  const ticketDetailRef = useRef(null);
  const AddTextRef = useRef(null);
  const AddOptionsRef = useRef(null);
  const AddCheckboxRef = useRef(null);
  const promoModalRef = useRef(null);
  const emailModalRef = useRef(null);
  // Tambahkan modal lainnya di sini...

  // Modal States
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isTicketDetailOpen, setIsTicketDetailOpen] = useState(false);
  const [showAddTextModal, setShowAddTextModal] = useState(false);
  const [showAddOptionsModal, setShowAddOptionsModal] = useState(false);
  const [showAddCheckboxModal, setShowAddCheckboxModal] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [limitedUsesEnabled, setLimitedUsesEnabled] = useState(false);
  const [totalUses, setTotalUses] = useState(2);
  const [appliesTo, setAppliesTo] = useState('All Ticket');
  const [appliesTicket, setAppliesTicket] = useState('');
  const [promoType, setPromoType] = useState('amount');
  const [promoAmount, setPromoAmount] = useState('');
  const [capacityValue, setCapacityValue] = useState('');
  const [acceptRegistration, setAcceptRegistration] = useState(true);

  // custom email registration states
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const [emailMessages, setEmailMessages] = useState({
    'Pending Approval': '',
    Going: '',
    Decline: '',
  });
  // Tambahkan modal lainnya di sini...

  const modals = [
    {
      ref: registrationModalRef,
      isOpen: isRegistrationModalOpen,
      close: () => setIsRegistrationModalOpen(false),
    },
    {
      ref: capacityModalRef,
      isOpen: isCapacityModalOpen,
      close: () => setIsCapacityModalOpen(false),
    },
    { ref: groupModalRef, isOpen: isGroupModalOpen, close: () => setIsGroupModalOpen(false) },
    { ref: taxModalRef, isOpen: isTaxModalOpen, close: () => setIsTaxModalOpen(false) },
    { ref: newTicketModalRef, isOpen: isNewTicketModalOpen, close: () => resetNewTicketModal() },
    { ref: ticketDetailRef, isOpen: isTicketDetailOpen, close: () => closeTicketDetail() },
    { ref: AddTextRef, isOpen: showAddTextModal, close: () => setShowAddTextModal(false) },
    { ref: AddOptionsRef, isOpen: showAddOptionsModal, close: () => setShowAddOptionsModal(false) },
    {
      ref: AddCheckboxRef,
      isOpen: showAddCheckboxModal,
      close: () => setShowAddCheckboxModal(false),
    },
    { ref: promoModalRef, isOpen: isPromoModalOpen, close: () => setIsPromoModalOpen(false) },
    { ref: emailModalRef, isOpen: isEmailModalOpen, close: () => setIsEmailModalOpen(false) },
    // Tambahkan modal lain: { ref, isOpen, close }
  ];

  const resetNewTicketModal = () => {
    setEditingTicketId(null);
    setAccessCode('');
    setShowAccessCodeInput(false);
    setTicketName('');
    setRequireApproval(true);
    setHideTicket(false);
    setPricingType('Free');
    setTicketPrice('150000');

    // Reset dynamic sections
    setShowDescription(false);
    setShowTicketLimit(false);
    setShowSalesDate(false);
    setShowBundling(false);

    setDescription('');
    setTicketLimit('');
    setBundleQty(2);
    setStartDate('2025-06-13');
    setStartTime('01:00');
    setEndDate('2025-06-15');
    setEndTime('22:00');

    // Terakhir, tutup modal
    setIsNewTicketModalOpen(false);
  };

  const openEditTicketModal = () => {
    const t = ticketDetail;
    if (!t) return;

    setEditingTicketId(t.id);
    setTicketName(t.name || '');
    setRequireApproval(!!t.is_approval);
    setHideTicket(!!t.hide);
    setAccessCode(t.access_code || '');
    setShowAccessCodeInput(!!t.hide && !!t.access_code);
    setPricingType(Number(t.price) > 0 ? 'Paid' : 'Free');
    setTicketPrice(String(t.price || 0));

    setShowDescription(!!t.description);
    setDescription(t.description || '');

    setShowTicketLimit(t.max_capacity !== null && t.max_capacity !== undefined);
    setTicketLimit(t.max_capacity != null ? String(t.max_capacity) : '');

    const hasSalesDate = !!t.start_date && !!t.end_date;
    setShowSalesDate(hasSalesDate);
    if (hasSalesDate) {
      const s = new Date(t.start_date);
      const e = new Date(t.end_date);
      setStartDate(s.toISOString().slice(0, 10));
      setStartTime(s.toTimeString().slice(0, 5));
      setEndDate(e.toISOString().slice(0, 10));
      setEndTime(e.toTimeString().slice(0, 5));
    }

    setShowBundling(!!t.qty_bundle);
    setBundleQty(t.qty_bundle || 2);

    closeTicketDetail();
    setIsNewTicketModalOpen(true);
  };

  const createNewTicket = async () => {
    try {
      const response = await axios.post(
        `${urlBe}/ticket/create`,
        {
          event_id: data.id,
          name: ticketName,
          approval: requireApproval,
          hide: hideTicket,
          access_code: hideTicket ? accessCode : null,
          pricing_type: pricingType,
          price: pricingType === 'Free' ? 0 : parseInt(ticketPrice.replace(/\D/g, ''), 10),
          description: showDescription ? description : '',
          max_capacity: showTicketLimit ? parseInt(ticketLimit.replace(/\D/g, ''), 10) : null,
          start_date: showSalesDate ? `${startDate}T${startTime}:00` : null,
          end_date: showSalesDate ? `${endDate}T${endTime}:00` : null,
          bundle_qty: showBundling ? bundleQty : null,
        },
        {
          headers: {
            'x-jdticket': localStorage.getItem('token') || '',
          },
        },
      );
      console.log('Ticket created:', response.data);
      resetNewTicketModal();
      fetchData(id); // Refresh data after creating new ticket
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert(error?.response?.data?.message || '❌ Failed to create ticket. Please try again.');
    }
  };

  const updateTicket = async () => {
    try {
      const response = await axios.put(
        `${urlBe}/ticket/update/${editingTicketId}`,
        {
          name: ticketName,
          approval: requireApproval,
          hide: hideTicket,
          access_code: hideTicket ? accessCode : null,
          pricing_type: pricingType,
          price: pricingType === 'Free' ? 0 : parseInt(ticketPrice.replace(/\D/g, ''), 10),
          description: showDescription ? description : '',
          max_capacity: showTicketLimit ? parseInt(ticketLimit.replace(/\D/g, ''), 10) : null,
          start_date: showSalesDate ? `${startDate}T${startTime}:00` : null,
          end_date: showSalesDate ? `${endDate}T${endTime}:00` : null,
          bundle_qty: showBundling ? bundleQty : null,
        },
        {
          headers: {
            'x-jdticket': localStorage.getItem('token') || '',
          },
        },
      );
      console.log('Ticket updated:', response.data);
      resetNewTicketModal();
      fetchData(id); // Refresh data after updating ticket
    } catch (error) {
      console.error('Failed to update ticket:', error);
      alert(error?.response?.data?.message || '❌ Failed to update ticket. Please try again.');
    }
  };

  const handleTicketSubmit = () => {
    if (editingTicketId) {
      updateTicket();
    } else {
      createNewTicket();
    }
  };

  const createPromo = async () => {
    try {
      const type = promoType === 'amount' ? 'Amount' : 'Percentage';
      const price = promoAmount ? parseInt(promoAmount.replace(/\D/g, ''), 10) : 0;
      const apply_all = appliesTo === 'All Ticket';
      const payload = {
        code: promoCode,
        price: price,
        type: type,
        event_id: data.id,
        apply_all: apply_all,
        max_capacity: limitedUsesEnabled ? totalUses : null,
      };

      if (!apply_all) {
        // includes the specific ticket id
        payload.tickets = [Number(appliesTo)];
      }

      const res = await axios.post(`${urlBe}/events/${data.id}/promos`, payload, {
        headers: { 'x-jdticket': localStorage.getItem('token') || '' },
      });

      console.log('Promo created', res.data);
      // Close modal and refresh
      setIsPromoModalOpen(false);
      fetchData(id);
      alert('✅ Promo created successfully');
    } catch (error) {
      console.error('Failed to create promo:', error);
      alert(error?.response?.data?.message || '❌ Failed to create promo.');
    }
  };

  const formatPrice = (value) => {
    const number = value.replace(/\D/g, '');
    return Number(number).toLocaleString('id-ID');
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
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [id, modals.map((m) => m.isOpen).join()]);

  const fetchData = async (id) => {
    try {
      const response = await axios.get(`${urlBe}/events/ticket-overview/${id}`, {
        headers: { 'x-jdticket': localStorage.getItem('token') || '' },
      });
      setData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch sales report:', err);
    }
  };

  // initialize email messages from backend data when loaded
  useEffect(() => {
    if (!data) return;
    setEmailMessages({
      'Pending Approval': data.email_pending ?? '',
      Going: data.email_going ?? '',
      Decline: data.email_decline ?? '',
    });
  }, [data]);

  const fetchTicketDetail = async (ticketId) => {
    try {
      const res = await axios.get(`${urlBe}/ticket/${ticketId}`, {
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

  const handleCapacityModalOpen = () => {
    // Initialize capacity value from event when modal opens
    if (data?.max_capacity === null || data?.max_capacity === undefined) {
      setCapacityValue('');
    } else {
      setCapacityValue(data.max_capacity.toString());
    }
    setIsCapacityModalOpen(true);
  };

  const handleCapacityDecrease = () => {
    const num = parseInt(capacityValue) || 0;
    if (num > 1) {
      setCapacityValue((num - 1).toString());
    } else if (num === 1) {
      // If it's 1, clicking - should set to empty (unlimited)
      setCapacityValue('');
    }
  };

  const handleCapacityIncrease = () => {
    const num = parseInt(capacityValue) || 0;
    // If empty (unlimited), start from 1, otherwise increment
    setCapacityValue((num + 1).toString());
  };

  const handleCapacityInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow numbers
    setCapacityValue(value);
  };

  const handleRemoveLimit = async () => {
    try {
      const res = await axios.put(
        `${urlBe}/events/update/${id}`,
        { max_capacity: null },
        {
          headers: {
            'x-jdticket': localStorage.getItem('token') || '',
          },
        },
      );
      if (res.data.code === '1') {
        setCapacityValue('');
        setIsCapacityModalOpen(false);
        fetchData(id); // Refresh data
        window.location.reload(); // Reload to update event prop
      } else {
        alert(res.data.message || 'Gagal update. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Failed to update capacity:', error);
      alert(error?.response?.data?.message || 'Gagal update capacity. Silakan coba lagi.');
    }
  };

  const handleSetLimit = async () => {
    try {
      // Convert empty string or 0 to null (unlimited)
      const capacity =
        capacityValue.trim() === '' || parseInt(capacityValue) === 0
          ? null
          : parseInt(capacityValue);

      const res = await axios.put(
        `${urlBe}/events/update/${id}`,
        { max_capacity: capacity },
        {
          headers: {
            'x-jdticket': localStorage.getItem('token') || '',
          },
        },
      );
      if (res.data.code === '1') {
        setIsCapacityModalOpen(false);
        fetchData(id); // Refresh data
        window.location.reload(); // Reload to update event prop
      } else {
        alert(res.data.message || 'Gagal update. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Failed to update capacity:', error);
      alert(error?.response?.data?.message || 'Gagal update capacity. Silakan coba lagi.');
    }
  };

  const handleRegistrationModalOpen = () => {
    // Initialize acceptRegistration from event when modal opens
    // Check both is_register and accept_register fields for compatibility
    const isOpen = data?.is_register ? true : false;
    setAcceptRegistration(isOpen);
    setIsRegistrationModalOpen(true);
  };

  const handleConfirmRegistration = async () => {
    try {
      const res = await axios.put(
        `${urlBe}/events/update/${id}`,
        { accept_register: acceptRegistration },
        {
          headers: {
            'x-jdticket': localStorage.getItem('token') || '',
          },
        },
      );
      if (res.data.code === '1') {
        setIsRegistrationModalOpen(false);
        fetchData(id); // Refresh data
        window.location.reload(); // Reload to update event prop
      } else {
        alert(res.data.message || 'Gagal update. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Failed to update registration:', error);
      alert(error?.response?.data?.message || 'Gagal update registration. Silakan coba lagi.');
    }
  };

  const openEmailModal = (status) => {
    setEmailStatus(status);
    setIsEmailModalOpen(true);
  };

  const saveEmailMessage = async () => {
    // messages have already been written via the textarea onChange
    const text = emailMessages[emailStatus] || '';
    // map UI label -> backend type
    const typeMap = {
      'Pending Approval': 'PENDING',
      Going: 'GOING',
      Decline: 'DECLINE',
    };
    const type = typeMap[emailStatus] || String(emailStatus).toUpperCase().replace(/\s+/g, '_');

    try {
      const res = await axios.post(
        `${urlBe}/events/add-custom-email/${id}`,
        { text, type },
        { headers: { 'x-jdticket': localStorage.getItem('token') || '' } },
      );

      // give some feedback and close modal
      if (res?.data?.code === '1' || res?.status === 200) {
        alert('✅ Custom email saved');
        setIsEmailModalOpen(false);
      } else {
        alert(res?.data?.message || 'Custom email saved');
        setIsEmailModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to save custom email:', error);
      alert(error?.response?.data?.message || '❌ Failed to save custom email.');
    }
  };

  const sendPreviewEmail = async () => {
    const text = emailMessages[emailStatus] || '';
    if (!text.trim()) {
      alert('Message is empty.');
      return;
    }
    try {
      const res = await axios.post(
        `${urlBe}/events/send-dummy-email/${id}`,
        { email_custom: text },
        { headers: { 'x-jdticket': localStorage.getItem('token') || '' } },
      );

      if (res?.data?.code === '1' || res?.status === 200) {
        alert('✅ Preview email sent');
      } else {
        alert(res?.data?.message || 'Preview email sent');
      }
    } catch (error) {
      console.error('Failed to send preview email:', error);
      alert(error?.response?.data?.message || '❌ Failed to send preview email.');
    }
  };

  const truncateText = (text, max = 120) => {
    if (!text) return '';
    return text.length > max ? `${text.slice(0, max)}...` : text;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const parsedDate = new Date(isoString);
    if (isNaN(parsedDate.getTime())) return '-';

    const date = parsedDate.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    });

    const parts = date.split(' ');
    return `${parts[0]}, ${parts[1]} ${parts[2]}`;
  };

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    const parsedDate = new Date(isoString);
    if (isNaN(parsedDate.getTime())) return '-';
    return parsedDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div
          className="bg-[#141717] rounded-xl px-4 py-4 cursor-pointer hover:bg-[#1d1f1f] transition"
          onClick={handleRegistrationModalOpen}
        >
          <div className="flex items-center gap-4">
            <img src={regis} alt="Registration Icon" className="w-10 h-10 shrink-0 object-contain" />
            <div className="min-w-0">
              <div className="text-xl font-['Satoshi-Bold',_sans-serif] truncate">Registration</div>
              <div className="text-sm text-[#A2A2A2] truncate">
                {data?.is_register === true ? 'Open' : 'Closed'}
              </div>
            </div>
          </div>
        </div>

        <div
          className="bg-[#141717] rounded-xl px-4 py-4 cursor-pointer hover:bg-[#1d1f1f] transition"
          onClick={handleCapacityModalOpen}
        >
          <div className="flex items-center gap-4">
            <img src={capacity} alt="Capacity Icon" className="w-10 h-10 shrink-0 object-contain" />
            <div className="min-w-0">
              <div className="text-xl font-['Satoshi-Bold',_sans-serif] truncate">Capacity</div>
              <div className="text-sm text-[#A2A2A2] truncate">
                {data?.max_capacity === null ? 'Unlimited' : data?.max_capacity}
              </div>
            </div>
          </div>
        </div>

        <div
          className="bg-[#141717] rounded-xl px-4 py-4 cursor-pointer hover:bg-[#1d1f1f] transition"
          onClick={() => setIsGroupModalOpen(true)}
        >
          <div className="flex items-center gap-4">
            <img src={grupRegis} alt="Group Booking Icon" className="w-10 h-10 shrink-0 object-contain" />
            <div className="min-w-0">
              <div className="text-xl font-['Satoshi-Bold',_sans-serif] truncate">Group Booking</div>
              <div className="text-sm text-[#A2A2A2] truncate">
                {!data?.group_register ? 'off' : data.group_register}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isRegistrationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div
            ref={registrationModalRef}
            className="bg-[#141717] text-white p-6 rounded-xl w-[92vw] max-w-[350px] shadow-lg font-['Satoshi-Regular',_sans-serif]"
          >
            <ModalIconHeader
              icon={<img src={regis} alt="Icon" className="w-5 h-5" />}
              title="Registration"
            />
            <p className="text-sm text-[#A2A2A2] mb-2">
              Turn off registration to stop accepting new attendees, including those with
              invitations.
            </p>
            <p className="text-sm text-[#A2A2A2] mb-4">
              When registration is open, guest capacity and ticket availability rules will still
              apply.
            </p>

            <div className="flex items-center justify-between mb-6">
              <span className="text-white text-sm">Accept Registration</span>
              <ToggleSwitch
                checked={acceptRegistration}
                onChange={(e) => setAcceptRegistration(e.target.checked)}
              />
            </div>

            <button
              className="w-full py-2 rounded-lg bg-white text-black font-['Satoshi-Bold',_sans-serif] hover:bg-gray-200"
              onClick={handleConfirmRegistration}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
      {isCapacityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div
            ref={capacityModalRef}
            className="bg-[#141717] text-white p-6 rounded-xl w-[92vw] max-w-[400px] shadow-lg font-['Satoshi-Regular',_sans-serif]"
          >
            <ModalIconHeader
              icon={<img src={capacity} alt="Capacity Icon" className="w-5 h-5" />}
              title="Capacity"
            />

            <p className="text-sm text-[#A2A2A2] mb-4">
              Sign-ups will close by themselves when we hit full capacity — but don’t worry, only
              confirmed guests are counted!
            </p>

            <div className="flex items-center bg-[#1f1f1f] rounded-md px-3 py-2 mb-4 justify-between">
              <input
                type="text"
                value={capacityValue}
                onChange={handleCapacityInputChange}
                className="bg-transparent text-white text-sm outline-none flex-1 font-['Satoshi-Medium',_sans-serif]"
                placeholder="Unlimited"
              />
              <StepperButtons onDecrease={handleCapacityDecrease} onIncrease={handleCapacityIncrease} />
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-white text-sm">Waitlist Enabled After Max Capacity</span>
              <ToggleSwitch defaultChecked />
            </div>

            <div className="flex gap-3">
              <button
                className="w-1/2 py-2 rounded-lg bg-[#2d2d2d] text-[#A2A2A2] font-['Satoshi-Bold',_sans-serif] hover:bg-[#3d3d3d]"
                onClick={handleRemoveLimit}
              >
                Remove Limit
              </button>
              <button
                className="w-1/2 py-2 rounded-lg bg-white text-black font-['Satoshi-Bold',_sans-serif] hover:bg-gray-200"
                onClick={handleSetLimit}
              >
                Set Limit
              </button>
            </div>
          </div>
        </div>
      )}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div
            ref={groupModalRef}
            className="bg-[#141717] text-white p-6 rounded-xl w-[92vw] max-w-[400px] shadow-lg font-['Satoshi-Regular',_sans-serif]"
          >
            <ModalIconHeader
              icon={<img src={grupRegis} alt="Group Booking Icon" className="w-5 h-5" />}
              title="Group Booking"
            />

            <p className="text-sm text-[#A2A2A2] mb-4">
              Allow guests to book multiple tickets in one go — perfect for friends or group
              signups.
            </p>

            {/* Group Booking Toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-sm">Group Booking</span>
              <ToggleSwitch
                checked={groupBookingEnabled}
                onChange={() => setGroupBookingEnabled(!groupBookingEnabled)}
              />
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
                <StepperButtons
                  onDecrease={() => setTicketQty((prev) => Math.max(prev - 1, 1))}
                  onIncrease={() => setTicketQty((prev) => Math.min(prev + 1, 10))}
                />
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
                  {item.price === 0 ? 'FREE' : item.price.toLocaleString('id-ID')}
                </div>
                <div className="text-xl font-['Satoshi-Bold',_sans-serif] mb-3">
                  {item.max_capacity === null ? '∞' : item.max_capacity.toLocaleString('id-ID')}
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
          <div
            ref={taxModalRef}
            className="bg-[#141717] text-white p-6 rounded-xl w-[92vw] max-w-[400px] shadow-lg"
          >
            <ModalIconHeader
              icon={<img src="/icon/tax-icon.png" alt="Tax Icon" className="w-5 h-5" />}
              title="Tax Fee"
            />

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
                  } else if (e.target.value === '') {
                    setTaxPercentage('');
                  }
                }}
                min="0"
                max="100"
                className="bg-transparent text-white text-sm outline-none text-left flex-1"
              />
              <StepperButtons
                onDecrease={() => setTaxPercentage((prev) => Math.max(prev - 1, 0))}
                onIncrease={() => setTaxPercentage((prev) => Math.min(prev + 1, 100))}
              />
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
                <option key={ticket.id} value={ticket.name}>
                  {ticket.name}
                </option>
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
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="bg-[#141717] text-white w-full sm:w-[430px] max-h-[90vh] rounded-xl overflow-y-auto shadow-xl"
            >
              <div className="flex items-center gap-2 text-lg font-['Satoshi-Bold',_sans-serif] px-8 pt-4">
                <ChevronsRight
                  className="w-5 h-5 cursor-pointer text-[#a2a2a2]"
                  onClick={closeTicketDetail}
                />
                <span>Ticket Information</span>
              </div>
              <hr className="my-2 border-[#333]" />
              <div className="px-8 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img src="/icon/ticket-icon.png" alt="ticket" className="w-10 h-10" />
                    <div>
                      <h2 className="text-lg font-['Satoshi-Bold',_sans-serif]">
                        {ticketDetail.name}
                      </h2>
                      <p className="text-lg font-['Satoshi-Bold',_sans-serif]">
                        Rp {Number(ticketDetail.price).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {ticketDetail.is_approval && (
                      <span className="text-sm bg-[#3C2F14] text-[#F5C249] px-2 py-0.5 rounded-full">
                        Need Approval
                      </span>
                    )}
                    <button
                      onClick={openEditTicketModal}
                      className="text-sm text-[#A2A2A2] bg-[#303030] font-['Satoshi-Medium',_sans-serif] px-2 py-1 rounded-md hover:bg-[#3A3A3A]"
                    >
                      ✎ Edit
                    </button>
                  </div>
                </div>

                {/* Description */}
                <input
                  type="text"
                  className="w-full bg-[#1c1d1d] text-[#A2A2A2] text-lg px-3 py-2 rounded-md mb-4 outline-none"
                  value={ticketDetail.description || 'Description'}
                  disabled
                />

                {/* Ticket Limit */}
                <div className="flex items-center text-sm font-['Satoshi-Medium',_sans-serif] gap-2">
                  <ArrowUpToLine className="w-4 h-4" />
                  <label>Ticket Limit:</label>
                  <span>
                    {ticketDetail.max_capacity === null ? 'Unlimited' : ticketDetail.max_capacity}
                  </span>
                </div>

                <hr className="my-3 border-[#333]" />

                {/* Sales Start and End */}
                <div className="mb-2">
                  <label className="text-lg font-['Satoshi-Bold',_sans-serif] block mb-1">
                    Sales Start and Sales End
                  </label>
                  <div className="space-y-3 text-sm mb-4 font-['Satoshi-Medium'] pl-3">
                    {/* Start */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 pt-2">Start</div>
                      <div className="flex w-full bg-[#1c1d1d] rounded-md overflow-hidden text-white">
                        <div className="px-4 py-2 flex-1">
                          {formatDate(ticketDetail.start_date)}
                        </div>
                        <div className="w-[1px] bg-[#333] my-1" />
                        <div className="px-4 py-2 w-[80px] text-right">
                          {formatTime(ticketDetail.start_date)}
                        </div>
                      </div>
                    </div>

                    {/* End */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 pt-2">End</div>
                      <div className="flex w-full bg-[#1c1d1d] rounded-md overflow-hidden text-white">
                        <div className="px-4 py-2 flex-1">{formatDate(ticketDetail.end_date)}</div>
                        <div className="w-[1px] bg-[#333] my-1" />
                        <div className="px-4 py-2 w-[80px] text-right">
                          {formatTime(ticketDetail.end_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bundling */}
                {ticketDetail.qty_bundle && (
                  <div className="mb-4">
                    <hr className="my-3 border-[#333]" />
                    <label className="text-lg font-['Satoshi-Bold',_sans-serif] block mb-1">
                      Bundling Ticket
                    </label>
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
                  <button className="text-xs text-[#A2A2A2] bg-[#303030] font-['Satoshi-Medium',_sans-serif] px-2 py-1 rounded-md">
                    + Add Guests
                  </button>
                </div>
                <div className="space-y-2">
                  {ticketDetail.list_guest?.map((guest, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-[#1f1f1f] px-3 py-2 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            guest.image ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(guest.name || 'User')}&background=random`
                          }
                          alt={guest.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <div className="text-sm">{guest.name}</div>
                        <div className="text-xs text-[#A2A2A2]">{guest.email}</div>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${guest.status === 'Going'
                          ? 'bg-[#31D34F]/10 text-[#31D34F]'
                          : 'bg-[#F2AB27]/10 text-[#F2AB27]'
                          }`}
                      >
                        {guest.status ? guest.status : 'PENDING'}
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
          <div
            ref={newTicketModalRef}
            className="bg-[#141717] text-white rounded-xl shadow-lg w-[92vw] max-w-[420px] max-h-[90vh] overflow-y-auto p-6"
          >
            <ModalIconHeader
              icon={<img src="/icon/ticket-icon.png" alt="Ticket Icon" className="w-5 h-5" />}
              title="Ticket Category"
            />

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
                <div
                  className="cursor-pointer hover:text-white"
                  onClick={() => setShowDescription(true)}
                >
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
                <div
                  className="cursor-pointer hover:text-white"
                  onClick={() => setShowTicketLimit(true)}
                >
                  + Add Ticket Limit
                </div>
              )}
              {showTicketLimit && (
                <div className="mb-4">
                  <label className="text-sm text-white block mb-1">Ticket Limit</label>
                  <div className="flex items-center bg-[#1f1f1f] rounded-md px-3 py-2 justify-between">
                    <input
                      type="text"
                      value={ticketLimit || 'Unlimited'}
                      onChange={(e) => setTicketLimit(e.target.value)}
                      className="bg-transparent text-white text-sm outline-none flex-1"
                      placeholder="Unlimited"
                    />
                    <StepperButtons
                      onDecrease={() => setTicketLimit((prev) => Math.max((+prev || 0) - 1, 1))}
                      onIncrease={() => setTicketLimit((prev) => (+prev || 0) + 1)}
                    />
                  </div>
                </div>
              )}

              {/* Sales Date */}
              {!showSalesDate && (
                <div
                  className="cursor-pointer hover:text-white"
                  onClick={() => setShowSalesDate(true)}
                >
                  + Add Sales Start and Sales End
                </div>
              )}
              {showSalesDate && (
                <div className="mb-4">
                  <label className="text-sm text-white block mb-1">Sales Start and Sales End</label>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-[#A2A2A2]">Start</span>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-[#1f1f1f] text-white px-2 py-1 rounded-md text-sm w-full"
                      />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="bg-[#1f1f1f] text-white px-2 py-1 rounded-md text-sm w-[80px]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-[#A2A2A2]">End</span>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-[#1f1f1f] text-white px-2 py-1 rounded-md text-sm w-full"
                      />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="bg-[#1f1f1f] text-white px-2 py-1 rounded-md text-sm w-[80px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bundling Ticket */}
              {!showBundling && (
                <div
                  className="cursor-pointer hover:text-white"
                  onClick={() => setShowBundling(true)}
                >
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
                    <StepperButtons
                      onDecrease={() => setBundleQty((prev) => Math.max(prev - 1, 2))}
                      onIncrease={() => setBundleQty((prev) => prev + 1)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Switches */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm">Require Approval</span>
              <ToggleSwitch
                checked={requireApproval}
                onChange={() => setRequireApproval(!requireApproval)}
              />
            </div>

            <div className="flex items-center justify-between mb-5">
              <div className="text-sm">
                <div>Hide This Ticket</div>
                <div className="text-xs text-[#A2A2A2] mt-1">
                  If hidden, you will need to create access codes for guests to access this ticket
                  type.
                </div>
              </div>
              <ToggleSwitch checked={hideTicket} onChange={() => setHideTicket(!hideTicket)} />
            </div>

            {hideTicket && (
              <div className="mb-5">
                {showAccessCodeInput ? (
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter Access Code"
                    autoFocus
                    className="w-full bg-transparent border border-[#2fbab1] text-[#2fbab1] text-center px-3 py-2 rounded-lg outline-none placeholder:text-[#2fbab1]/60"
                  />
                ) : (
                  <button
                    onClick={() => setShowAccessCodeInput(true)}
                    className="w-full py-2 rounded-lg border border-[#2fbab1] text-[#2fbab1] font-['Satoshi-Bold',_sans-serif] hover:bg-[#2fbab1]/10"
                  >
                    Enter Access Code
                  </button>
                )}
              </div>
            )}

            {/* Pricing Switch */}
            <div className="text-sm mb-6">
              <div className="mb-1">Pricing</div>
              <div className="flex mb-3">
                <button
                  onClick={() => setPricingType('Free')}
                  className={`w-1/2 py-2 rounded-l-md ${pricingType === 'Free' ? 'bg-white text-black' : 'bg-[#1f1f1f] text-white'}`}
                >
                  Free
                </button>
                <button
                  onClick={() => setPricingType('Paid')}
                  className={`w-1/2 py-2 rounded-r-md ${pricingType === 'Paid' ? 'bg-white text-black' : 'bg-[#1f1f1f] text-white'}`}
                >
                  Paid
                </button>
              </div>

              {pricingType === 'Paid' && (
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
              onClick={handleTicketSubmit}
            >
              {editingTicketId ? 'Update Ticket' : 'Create Ticket'}
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

          {/* tombol add di header biar rapih */}
          {data?.list_promo && data.list_promo.length > 0 && (
            <button
              onClick={() => setIsPromoModalOpen(true)}
              className="text-xs bg-[#1C1D1D] text-white px-3 py-1 rounded-md hover:bg-[#3A3A3A] transition"
            >
              + Add New Promo
            </button>
          )}
        </div>

        <p className="text-[#A2A2A2] mb-4">Create coupons that can be applied to this event.</p>

        {data?.list_promo && data.list_promo.length > 0 ? (
          <div className="bg-[#141717] border border-[#212121] rounded-xl overflow-x-auto font-['Satoshi-Medium',_sans-serif]">
            <div className="min-w-[640px]">
              {/* HEADER TABLE */}
              <div className="grid grid-cols-[2fr,2fr,2fr,2fr,1.5fr] px-4 py-3 text-xs uppercase tracking-wide text-[#7C7C7C]">
                <div>Code</div>
                <div>Discount</div>
                <div>Applies To</div>
                <div>Used</div>
                <div className="text-right">Status</div>
              </div>

              {/* ROWS */}
              <div className="divide-y divide-[#212121]">
                {data.list_promo.map((promo, idx) => {
                  const discountLabel =
                    promo.type === 'Amount'
                      ? `Rp ${promo.price.toLocaleString('id-ID')}`
                      : `${promo.price}%`;

                  const appliesToLabel = promo.apply_all ? 'All Ticket' : 'Selected Ticket';

                  const usedCount = promo.used_promo; // sesuaikan dengan field di BE
                  const maxCapacity = promo.max_capacity ?? '∞'; // sesuaikan dengan field di BE

                  const isActive = promo.is_active; // sesuaikan dengan field boolean status

                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-[2fr,2fr,2fr,2fr,1.5fr] px-4 py-3 text-sm items-center hover:bg-[#1b1d1d] transition cursor-pointer"
                    >
                      {/* CODE */}
                      <div className="text-[#2AD4C8] text-sm">{promo.code}</div>

                      {/* DISCOUNT */}
                      <div className="text-white">{discountLabel}</div>

                      {/* APPLIES TO */}
                      <div className="text-white">{appliesToLabel}</div>

                      {/* USED */}
                      <div className="text-white">
                        {usedCount}/{maxCapacity}
                      </div>

                      {/* STATUS */}
                      <div className="flex justify-end">
                        <button
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-[#0f2c1e] text-[#4ADE80]' : 'bg-[#301515] text-[#FB7185]'
                            }`}
                        >
                          <span>{isActive ? 'ON' : 'OFF'}</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          // Jika tidak ada promo code
          <div className="bg-[#141717] border border-[#212121] rounded-xl flex justify-between items-center p-2 font-['Satoshi-Medium',_sans-serif]">
            <div className="flex items-center gap-1">
              <img src={promo} alt="Promo" className="w-14 h-14 object-contain" />
              <div>
                <div className="text-white font-['Satoshi-Bold',_sans-serif]">No Promo Codes</div>
                <div className="text-sm text-[#A2A2A2]">
                  You can create promo codes to offer discounts to your guests
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsPromoModalOpen(true)}
              className="text-sm bg-[#1C1D1D] text-white px-3 py-1 mr-2 rounded-md hover:bg-[#3A3A3A] transition flex items-center gap-1"
            >
              Add Promo <span className="text-lg">+</span>
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <hr className="my-8 border-[#333]" />

      {/* Custom Email Registration Section */}
      <div className="mb-6">
        <h2 className="text-lg font-['Satoshi-Bold',_sans-serif] text-white mb-2">
          Custom Email Registration
        </h2>
        <p className="text-[#A2A2A2] mb-4">Customize registration, approval, and decline emails</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Pending Approval', color: '#f2ab27' },
            { label: 'Going', color: '#31d34f' },
            { label: 'Decline', color: '#f94d4d' },
          ].map((item) => {
            const preview =
              item.label === 'Pending Approval'
                ? data?.email_pending
                : item.label === 'Going'
                  ? data?.email_going
                  : data?.email_decline;

            return (
              <div
                key={item.label}
                onClick={() => openEmailModal(item.label)}
                className="bg-[#141717] rounded-xl px-4 py-4 cursor-pointer hover:bg-[#1d1f1f] transition"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.label}
                  </span>
                </div>

                <div className="mt-3">
                  {preview ? (
                    <p className="text-sm text-[#A2A2A2]">
                      {truncateText(preview, 140)}
                    </p>
                  ) : (
                    <div className="h-6 bg-[#1f1f1f] rounded-md w-full" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div
            ref={emailModalRef}
            className="bg-[#141717] text-white p-6 rounded-xl w-[92vw] max-w-[350px] shadow-lg font-['Satoshi-Regular',_sans-serif]"
          >
            <ModalIconHeader
              icon={<img src={regis} alt="Icon" className="w-5 h-5" />}
              title={emailStatus}
            />

            <p className="text-sm text-[#A2A2A2] mb-2">
              {/* description based on status */}
              {emailStatus === 'Pending Approval'
                ? 'Sent when a guest registers (pending approval or waitlist)'
                : emailStatus === 'Going'
                  ? 'Sent when a guest registers or is approved'
                  : 'Sent when a guest is declined'}
            </p>

            <p className="text-sm text-[#A2A2A2] mb-4">
              Registration {emailStatus.toLowerCase()} for {data?.name}
            </p>

            <textarea
              value={emailMessages[emailStatus] || ''}
              onChange={(e) =>
                setEmailMessages((prev) => ({
                  ...prev,
                  [emailStatus]: e.target.value,
                }))
              }
              placeholder="Add your custom message here."
              className="w-full bg-[#1f1f1f] text-white text-sm px-3 py-2 rounded-md mb-4 h-32 outline-none"
            />

            <div className="flex justify-between items-center">
              <button className="text-sm text-[#A2A2A2]" onClick={sendPreviewEmail}>Send a Preview</button>
              <button
                className="bg-white text-black px-4 py-2 rounded-lg font-['Satoshi-Bold',_sans-serif]"
                onClick={saveEmailMessage}
              >
                Update Email
              </button>
            </div>
          </div>
        </div>
      )}

      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div
            ref={promoModalRef}
            className="bg-[#141717] text-white p-6 rounded-xl w-[92vw] max-w-[380px] shadow-lg font-['Satoshi-Regular',_sans-serif]"
          >
            <ModalIconHeader
              icon={<img src={promo} alt="Promo Icon" className="w-5 h-5" />}
              title="Promo Code"
            />

            <p className="text-sm text-[#A2A2A2] mb-4">
              Create a promo code that can be applied to your tickets.
            </p>

            <label className="text-sm block mb-1">Create Code</label>
            <div className="mb-4">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter Your Code"
                className="w-full bg-transparent border border-[#2fbab1] text-[#2fbab1] text-center px-3 py-2 rounded-md mb-2 outline-none"
              />
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-white text-sm">Limited Uses</span>
              <ToggleSwitch
                checked={limitedUsesEnabled}
                onChange={() => setLimitedUsesEnabled((v) => !v)}
              />
            </div>

            {limitedUsesEnabled && (
              <div className="flex items-center bg-[#1f1f1f] rounded-md px-3 py-2 mb-4 justify-between">
                <span className="text-sm text-white">Total Uses</span>
                <div className="flex items-center gap-2">
                  <div className="bg-[#222] text-white px-3 py-1 rounded-md">{totalUses}</div>
                  <StepperButtons
                    onDecrease={() => setTotalUses((prev) => Math.max(prev - 1, 1))}
                    onIncrease={() => setTotalUses((prev) => prev + 1)}
                  />
                </div>
              </div>
            )}

            <label className="text-sm block mb-1">Applies To</label>
            <select
              className="w-full bg-[#1f1f1f] text-white text-sm px-3 py-2 rounded-md mb-4 outline-none"
              value={appliesTo}
              onChange={(e) => setAppliesTo(e.target.value)}
            >
              <option value="All Ticket">All Ticket</option>
              {data?.list_ticket?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <label className="text-sm block mb-1">Type</label>
            <select
              className="w-full bg-[#1f1f1f] text-white text-sm px-3 py-2 rounded-md mb-4 outline-none"
              value={promoType}
              onChange={(e) => setPromoType(e.target.value)}
            >
              <option value="amount">Rp Amount Off</option>
              <option value="percent">% Percent Off</option>
            </select>

            {promoType === 'amount' ? (
              <div className="mb-4">
                <label className="text-sm block mb-1">Amount Off</label>
                <input
                  type="text"
                  value={promoAmount ? formatPrice(promoAmount) : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setPromoAmount(raw);
                  }}
                  placeholder="Rp 10.000"
                  className="w-full bg-[#1f1f1f] text-white text-sm px-3 py-2 rounded-md mb-2 outline-none"
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="text-sm block mb-1">Percent Off</label>
                <input
                  type="text"
                  value={promoAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    const clamped = Math.max(0, Math.min(100, Number(raw || 0)));
                    setPromoAmount(String(clamped));
                  }}
                  placeholder="10"
                  className="w-full bg-[#1f1f1f] text-white text-sm px-3 py-2 rounded-md mb-2 outline-none"
                />
              </div>
            )}

            <button
              className="w-full py-2 rounded-lg bg-white text-black font-['Satoshi-Bold',_sans-serif]"
              onClick={createPromo}
            >
              Create Promo
            </button>
          </div>
        </div>
      )}

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
              {selectedQuestionType} <ChevronDown className="w-4 h-4" />
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
            <IdCard className="w-6 h-6 text-[#31D34F]" />
            <span className="font-['Satoshi-Bold',_sans-serif] text-white">
              Personal Information
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="bg-[#141717] w-full border border-[#212121] text-white px-4 py-2 rounded-md flex items-center gap-2">
              <UserRound className="w-4 h-4 shrink-0 text-[#A2A2A2]" />
              <span className="truncate">Full Name</span>
              <span className="text-[#A2A2A2] text-xs ml-auto shrink-0">Required</span>
            </div>
            <div className="bg-[#141717] w-full border border-[#212121] text-white px-4 py-2 rounded-md flex items-center gap-2">
              <Mail className="w-4 h-4 shrink-0 text-[#A2A2A2]" />
              <span className="truncate">Email</span>
              <span className="text-[#A2A2A2] text-xs ml-auto shrink-0">Required</span>
            </div>
            <div className="bg-[#141717] w-full border border-[#212121] text-white px-4 py-2 rounded-md flex items-center gap-2">
              <Phone className="w-4 h-4 shrink-0 text-[#A2A2A2]" />
              <span className="truncate">Phone Number</span>
              <span className="text-[#A2A2A2] text-xs ml-auto shrink-0">Required</span>
              <ChevronsUpDown className="w-4 h-4 shrink-0 text-[#A2A2A2]" />
            </div>
          </div>
        </div>

        {/* Custom Question Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquarePlus className="w-5 h-5 text-[#9747FF]" />
            <span className="font-['Satoshi-Bold',_sans-serif] text-white">Custom Question</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
            <div
              className="border border-dashed border-[#3F3F3F] w-full text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer hover:border-[#AAAAAA]"
              onClick={() => setShowAddTextModal(true)}
            >
              <span
                className="italic text-[#A2A2A2] text-base shrink-0"
                style={{ fontFamily: 'Times New Roman' }}
              >
                T
              </span>
              <span className="truncate">Text</span>
              <span className="ml-auto shrink-0">+</span>
            </div>
            <div
              className="border border-dashed border-[#3F3F3F] w-full text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer hover:border-[#AAAAAA]"
              onClick={() => setShowAddOptionsModal(true)}
            >
              <CircleDot className="w-3 h-3 shrink-0 text-[#A2A2A2]" />
              <span className="truncate">Options</span>
              <span className="ml-auto shrink-0">+</span>
            </div>
            <div
              className="border border-dashed border-[#3F3F3F] w-full text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer hover:border-[#AAAAAA]"
              onClick={() => setShowAddCheckboxModal(true)}
            >
              <CheckSquare2 className="w-3 h-3 shrink-0 text-[#A2A2A2]" />
              <span className="truncate">Checkbox</span>
              <span className="ml-auto shrink-0">+</span>
            </div>
            <div
              className="border border-dashed border-[#3F3F3F] w-full text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer hover:border-[#AAAAAA]"
              onClick={() => console.log(`Add custom question: ${q.label}`)}
            >
              <Link className="w-3 h-3 text-[#A2A2A2]" />
              <span>Website</span>
              <span className="ml-auto">+</span>
            </div>
            {/* Add Text Question Modal */}
            {showAddTextModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div
                  ref={AddTextRef}
                  className="bg-[#181818] text-white p-6 sm:p-8 rounded-2xl w-[92vw] max-w-[370px] shadow-lg relative font-['Satoshi-Regular',_sans-serif]"
                >
                  <ModalIconHeader
                    size="lg"
                    icon={
                      <span
                        className="text-3xl italic text-white"
                        style={{ fontFamily: 'Times New Roman' }}
                      >
                        T
                      </span>
                    }
                    title="Add Text"
                    subtitle="Ask for a free-form response."
                  />
                  <div className="mb-4">
                    <label className="block text-white text-sm mb-1">Question</label>
                    <input
                      type="text"
                      value={textQuestion}
                      onChange={(e) => setTextQuestion(e.target.value)}
                      className="w-full bg-[#141717] text-white px-3 py-2 rounded-md outline-none text-base"
                      placeholder="Enter your question"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-white text-sm">Required</span>
                    <ToggleSwitch
                      checked={textRequired}
                      onChange={() => setTextRequired((v) => !v)}
                    />
                  </div>
                  <button
                    className="w-full py-2 rounded-lg bg-white text-black font-['Satoshi-Bold',_sans-serif] text-lg"
                    onClick={() => {
                      // Add logic to save the question
                      setShowAddTextModal(false);
                      setTextQuestion('');
                      setTextRequired(true);
                    }}
                  >
                    Add Question
                  </button>
                </div>
              </div>
            )}
            {showAddOptionsModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div
                  ref={AddOptionsRef}
                  className="bg-[#181818] text-white p-6 sm:p-8 rounded-2xl w-[92vw] max-w-[420px] shadow-lg relative font-['Satoshi-Regular',_sans-serif]"
                >
                  <ModalIconHeader
                    size="lg"
                    icon={<CircleDot className="w-7 h-7 text-white" />}
                    title="Add Options"
                    subtitle="Let guests choose one option from the list below."
                  />
                  <div className="mb-4">
                    <label className="block text-white text-sm mb-1">Question</label>
                    <input
                      type="text"
                      value={optionsQuestion}
                      onChange={(e) => setOptionsQuestion(e.target.value)}
                      className="w-full bg-[#141717] text-white px-3 py-2 rounded-md outline-none text-base"
                      placeholder="Enter your question"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-white text-sm mb-1">Options</label>
                    <input
                      type="text"
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === 'Tab') && optionInput.trim()) {
                          e.preventDefault();
                          if (!optionsList.includes(optionInput.trim())) {
                            setOptionsList([...optionsList, optionInput.trim()]);
                          }
                          setOptionInput('');
                        }
                      }}
                      className="w-full bg-[#141717] text-white px-3 py-2 rounded-md outline-none text-base mb-1"
                      placeholder="Add Options"
                    />
                    <div className="text-xs text-[#A2A2A2] mb-2">
                      Press Enter or Tab key to add a new option
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {optionsList.map((opt, idx) => (
                        <span
                          key={idx}
                          className="bg-[#232323] px-3 py-1 rounded-full text-sm flex items-center gap-1"
                        >
                          {opt}
                          <span
                            className="ml-1 cursor-pointer text-[#A2A2A2]"
                            onClick={() => setOptionsList(optionsList.filter((o, i) => i !== idx))}
                          >
                            &times;
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-white text-sm">Required</span>
                    <ToggleSwitch
                      checked={optionsRequired}
                      onChange={() => setOptionsRequired((v) => !v)}
                    />
                  </div>
                  <button
                    className="w-full py-2 rounded-lg bg-white text-black font-['Satoshi-Bold',_sans-serif] text-lg"
                    onClick={() => {
                      // Add logic to save the question
                      setShowAddOptionsModal(false);
                      setOptionsQuestion('');
                      setOptionsRequired(true);
                      setOptionInput('');
                      setOptionsList([]);
                    }}
                  >
                    Add Question
                  </button>
                </div>
              </div>
            )}
            {showAddCheckboxModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div
                  ref={AddCheckboxRef}
                  className="bg-[#181818] text-white p-6 sm:p-8 rounded-2xl w-[92vw] max-w-[420px] shadow-lg relative font-['Satoshi-Regular',_sans-serif]"
                >
                  <ModalIconHeader
                    size="lg"
                    icon={<CheckSquare2 className="w-7 h-7 text-white" />}
                    title="Add Checkbox"
                    subtitle="Let guests choose one or more options from the list below."
                  />
                  <div className="mb-4">
                    <label className="block text-white text-sm mb-1">Question</label>
                    <input
                      type="text"
                      value={checkboxQuestion}
                      onChange={(e) => setCheckboxQuestion(e.target.value)}
                      className="w-full bg-[#141717] text-white px-3 py-2 rounded-md outline-none text-base"
                      placeholder="Enter your question"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-white text-sm mb-1">Options</label>
                    <input
                      type="text"
                      value={checkboxInput}
                      onChange={(e) => setCheckboxInput(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === 'Tab') && checkboxInput.trim()) {
                          e.preventDefault();
                          if (!checkboxList.includes(checkboxInput.trim())) {
                            setCheckboxList([...checkboxList, checkboxInput.trim()]);
                          }
                          setCheckboxInput('');
                        }
                      }}
                      className="w-full bg-[#141717] text-white px-3 py-2 rounded-md outline-none text-base mb-1"
                      placeholder="Add Options"
                    />
                    <div className="text-xs text-[#A2A2A2] mb-2">
                      Press Enter or Tab key to add a new option
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {checkboxList.map((opt, idx) => (
                        <span
                          key={idx}
                          className="bg-[#232323] px-3 py-1 rounded-full text-sm flex items-center gap-1"
                        >
                          {opt}
                          <span
                            className="ml-1 cursor-pointer text-[#A2A2A2]"
                            onClick={() =>
                              setCheckboxList(checkboxList.filter((o, i) => i !== idx))
                            }
                          >
                            &times;
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-white text-sm">Required</span>
                    <ToggleSwitch
                      checked={checkboxRequired}
                      onChange={() => setCheckboxRequired((v) => !v)}
                    />
                  </div>
                  <button
                    className="w-full py-2 rounded-lg bg-white text-black font-['Satoshi-Bold',_sans-serif] text-lg"
                    onClick={() => {
                      // Add logic to save the question
                      setShowAddCheckboxModal(false);
                      setCheckboxQuestion('');
                      setCheckboxRequired(true);
                      setCheckboxInput('');
                      setCheckboxList([]);
                    }}
                  >
                    Add Question
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketsPage;
