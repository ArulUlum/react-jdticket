import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Check,
  X,
  Ticket,
  Crown,
  Search,
  Filter,
  Download,
} from "lucide-react";

const urlBe = import.meta.env.VITE_URL_BE;

const GuestPage = ({id}) => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCheckIn, setTotalCheckIn] = useState(0);
  const [total, setTotal] = useState(0);
  const [checkInInvetees, setCheckInInvetees] = useState(0);
  const [totalInvetees, setTotalInvetees] = useState(0);
  const [checkInGuest, setCheckInGuest] = useState(0);
  const [totalGuest, setTotalGuest] = useState(0);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState(null);
  const [selectedGuestDetail, setSelectedGuestDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  document.title = 'Guest List - Kebbu';
  
  useEffect(() => {
    fetchGuests(id, search);
  }, [id, search]);

  const fetchGuests = async (id, searchQuery = "") => {
    try {
      const response = await axios.get(`${urlBe}/events/guests/${id}/detail`,
        {
            headers: {
                'x-jdticket': localStorage.getItem('token') || '',
            },
            params: {
                search: searchQuery || undefined, // hanya kirim kalau ada
            },
        }
      );
      const data = response.data.data;
      setGuests(data.guest_list); 
      setCheckInInvetees(data.checkin_invitees); 
      setTotalInvetees(data.total_invitees); 
      setCheckInGuest(data.checkin_guest); 
      setTotalGuest(data.total_guest); 
      setTotalCheckIn(data.total_checkin); 
      setTotal(data.total_registered); 
    } catch (err) {
      console.error("Error saat fetchEvents:", err);
      // Tangani berdasarkan jenis error
      if (err.response) {
        // Error dari server (misal 4xx atau 5xx)
        setError(`Server error: ${err.response.status} - ${err.response.data?.message || err.message}`);
      } else if (err.request) {
        // Request dikirim tapi tidak ada respon
        setError("Tidak bisa terhubung ke server. Coba cek koneksi internetmu.");
      } else {
        // Error saat menyusun request
        setError("Terjadi kesalahan saat memuat data. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestDetail = async (id) => {
    if (!id) return null;
    setDetailLoading(true);
    setDetailError("");
    try {
      const res = await axios.get(`${urlBe}/user/detail-guest-user/${id}`, {
        headers: {
          'x-jdticket': localStorage.getItem('token') || '',
        },
      });
      return res.data?.data || res.data;
    } catch (err) {
      console.error('Error fetching guest detail:', err);
      setDetailError('Failed to load guest detail');
      return null;
    } finally {
      setDetailLoading(false);
    }
  };

  const openGuestModal = async (guest) => {
    const idToFetch = guest.id;
    if (!idToFetch) return;
    setSelectedGuestId(idToFetch);
    setIsModalOpen(true);
    setSelectedGuestDetail(null);
    const detail = await fetchGuestDetail(idToFetch);
    if (detail) setSelectedGuestDetail(detail);
  };

  const closeGuestModal = () => {
    setIsModalOpen(false);
    setSelectedGuestId(null);
    setSelectedGuestDetail(null);
    setDetailError("");
  };

  // helper to format date strings from API like "YYYY-MM-DD HH:mm:ss"
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      // ensure it's parseable by Date
      const d = new Date(dateStr.replace(' ', 'T'));
      return d.toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  // lock body scroll + close on ESC while modal open
  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e) => e.key === 'Escape' && closeGuestModal();
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isModalOpen]);

  const handleCheckIn = async () => {
    if (actionLoading || !selectedGuestDetail) return;
    setActionLoading(true);
    try {
      const invoice_code = selectedGuestDetail.invoice_code;
      const ticket_id = selectedGuestDetail.ticket_id;
      if (!invoice_code) throw new Error('No invoice code available');
      await axios.post(`${urlBe}/user/checkin-user`, { invoice_code, ticket_id }, {
        headers: { 'x-jdticket': localStorage.getItem('token') || '' }
      });
      alert('✅ Check-in successful');
      // refresh detail and list
      const updated = await fetchGuestDetail(selectedGuestId);
      if (updated) setSelectedGuestDetail(updated);
      fetchGuests(id, search);
    } catch (err) {
      alert(`❌ Check-in failed: ${err?.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (actionLoading || !selectedGuestId) return;
    if (!confirm('Are you sure you want to decline this guest?')) return;
    setActionLoading(true);
    try {
      // try a reasonable decline endpoint
      await axios.post(`${urlBe}/events/guests/${selectedGuestId}/decline`, {}, {
        headers: { 'x-jdticket': localStorage.getItem('token') || '' }
      });
      alert('✅ Guest declined');
      const updated = await fetchGuestDetail(selectedGuestId);
      if (updated) setSelectedGuestDetail(updated);
      fetchGuests(id, search);
    } catch (err) {
      // fallback: try setting status via generic endpoint
      try {
        await axios.put(`${urlBe}/events/guests/${selectedGuestId}/status`, { status: 'DECLINED' }, {
          headers: { 'x-jdticket': localStorage.getItem('token') || '' }
        });
        alert('✅ Guest declined');
        const updated = await fetchGuestDetail(selectedGuestId);
        if (updated) setSelectedGuestDetail(updated);
        fetchGuests(id, search);
      } catch (e) {
        alert(`❌ Decline failed: ${err?.response?.data?.message || err.message || e?.message || 'Unknown error'}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Approve (check-in) directly from the guest list
  const handleApprove = async (guest) => {
    if (actionLoading || !guest?.id) return;
    setActionLoading(true);
    try {
      const detail = await fetchGuestDetail(guest.id);
      if (!detail) throw new Error('Failed to fetch guest detail');
      const invoice_code = detail.invoice_code;
      const ticket_id = detail.ticket_id;
      if (!invoice_code) throw new Error('No invoice code available for check-in');
      await axios.post(`${urlBe}/user/checkin-user`, { invoice_code, ticket_id }, {
        headers: { 'x-jdticket': localStorage.getItem('token') || '' }
      });
      alert('✅ Guest approved and checked in');
      fetchGuests(id, search);
    } catch (err) {
      alert(`❌ Approve failed: ${err?.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Decline directly from the guest list
  const handleDeclineFromList = async (guest) => {
    if (actionLoading || !guest?.id) return;
    if (!confirm('Are you sure you want to decline this guest?')) return;
    setActionLoading(true);
    try {
      await axios.post(`${urlBe}/events/guests/${guest.id}/decline`, {}, {
        headers: { 'x-jdticket': localStorage.getItem('token') || '' }
      });
      alert('✅ Guest declined');
      fetchGuests(id, search);
    } catch (err) {
      // fallback
      try {
        await axios.put(`${urlBe}/events/guests/${guest.id}/status`, { status: 'DECLINED' }, {
          headers: { 'x-jdticket': localStorage.getItem('token') || '' }
        });
        alert('✅ Guest declined');
        fetchGuests(id, search);
      } catch (e) {
        alert(`❌ Decline failed: ${err?.response?.data?.message || err.message || e?.message || 'Unknown error'}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const percent = (totalCheckIn / total) * 100; 

  const statusLabel = {
    approve: { label: "Approve", color: "text-green-500", icon: <Check size={16} /> },
    going: { label: "Going", color: "text-green-400" },
    declined: { label: "Declined", color: "text-red-500" },
    pending: { label: "Pending", color: "text-yellow-500" },
  };

  return (
    <div className="font-['Satoshi-Regular',_sans-serif] min-h-screen">
      {/* Stats Header */}
      <div className="flex justify-between items-start mb-5">
        {/* Left Section */}
        <div className="flex gap-10">
            {/* Guests Checked In */}
            <div className="flex items-center gap-3">
            <div className="text-3xl font-['Satoshi-Medium',_sans-serif]">
                {checkInGuest}/{totalGuest}
            </div>
            <div className="text-sm leading-tight font-['Satoshi-Regular',_sans-serif]">
                <div>Guests</div>
                <div>Checked in</div>
            </div>
            </div>

            {/* Invitees Checked In */}
            <div className="flex items-center gap-3">
            <div className="text-3xl font-['Satoshi-Medium',_sans-serif]">
                {checkInInvetees}/{totalInvetees}
            </div>
            <div className="text-sm leading-tight font-['Satoshi-Regular',_sans-serif]">
                <div>Invitees</div>
                <div>Checked in</div>
            </div>
            </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
            <div className="text-3xl font-['Satoshi-Medium',_sans-serif]">
            {totalCheckIn}/{total}
            </div>
            <div className="text-sm leading-tight font-['Satoshi-Regular',_sans-serif] text-right">
            <div>Total</div>
            <div>Registered</div>
            </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#141717] rounded-full mb-4">
        <div
          className="h-full bg-[#31D34F] rounded-full transition-all"
          style={{ width: `${percent? percent:0}%` }}
        ></div>
      </div>

      {/* Search & Filter */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-3 text-white w-4 h-4" />
            <input
              className="bg-transparent text-white pl-10 pr-4 py-2 rounded-lg w-full border border-gray-700 font-['Satoshi-Regular',_sans-serif]"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <div className="flex gap-2">
          <button className="bg-transparent flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-gray-700 font-['Satoshi-Regular',_sans-serif]">
            <Filter size={18} /> All Tickets
          </button>
          <button className="bg-transparent text-white rounded-lg border border-gray-700">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Guest List */}
      <div className="bg-[#141717] rounded-lg overflow-hidden">
        {guests.map((guest, idx) => {
          return (
            <div
              key={idx}
              onClick={() => openGuestModal(guest)}
              className="cursor-pointer flex justify-between items-center p-4 border-b border-gray-800 hover:bg-[#1a1a1a]"
            >
              <div className="flex items-center gap-3">
                <img
                  src={guest.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(guest.name)}&background=random`}
                  alt={guest.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="font-['Satoshi-Medium',_sans-serif]">{guest.name}</div>
                <div className="text-sm text-gray-400 font-['Satoshi-Regular',_sans-serif]">{guest.email}</div>
              </div>
              <div className="flex items-center gap-4">
                {guest.total_ticket > 1 && (
                  <div className="bg-gray-700 text-white text-xs px-2 py-1 rounded-full font-['Satoshi-Regular',_sans-serif]">
                    {guest.total_ticket} Tickets
                  </div>
                )}
                {guest.is_checkin ? (
                  <div className="text-sm font-['Satoshi-Medium',_sans-serif] text-green-400">
                    GOING
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div
                      onClick={(e) => { e.stopPropagation(); handleApprove(guest); }}
                      className={`flex items-center gap-1 text-sm text-green-400 hover:opacity-80 ${actionLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                      disabled={actionLoading}
                    >
                      <Check size={16} /> Approve
                    </div>
                    <div
                      onClick={(e) => { e.stopPropagation(); handleDeclineFromList(guest); }}
                      className={`flex items-center gap-1 text-sm text-red-500 hover:opacity-80 ${actionLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                      disabled={actionLoading}
                    >
                      <X size={16} /> Decline
                    </div>
                  </div>
                )}
                {guest.role === "GUEST" ? (
                  <Ticket size={16} className="text-yellow-400" />
                ) : (
                  <Crown size={16} className="text-yellow-400" />
                )}
                <div className="text-sm text-gray-400 font-['Satoshi-Regular',_sans-serif]">{guest.checkin_date}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guest Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeGuestModal} />
          <div className="relative bg-[#0f0f0f] w-11/12 max-w-2xl rounded-lg p-6 z-10">
            {detailLoading ? (
              <div className="text-center py-10">Loading...</div>
            ) : detailError ? (
              <div className="text-red-400">{detailError}</div>
            ) : selectedGuestDetail ? (
              <div>
                {/* Header: avatar, name, email, status */}
                <div className="flex gap-4 items-center mb-4">
                  <img src={selectedGuestDetail.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedGuestDetail.name || selectedGuestDetail.email)}&background=random`} alt={selectedGuestDetail.name} className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <div className="text-xl font-['Satoshi-Medium',_sans-serif]">{selectedGuestDetail.name || selectedGuestDetail.email}</div>
                    <div className="text-sm text-gray-400">{selectedGuestDetail.email}</div>
                  </div>
                  <div className="ml-auto">
                    {/* status badge */}
                    {selectedGuestDetail.is_checkin ? (
                      <span className="bg-green-600 text-white rounded-full px-3 py-1 text-sm">Checked In</span>
                    ) : (
                      <span className="bg-yellow-600 text-white rounded-full px-3 py-1 text-sm">Pending</span>
                    )}
                  </div>
                </div>

                {/* Top stats row */}
                <div className="grid grid-cols-3 gap-6 mb-4">
                  <div>
                    <div className="text-xs text-gray-400">Registration Time</div>
                    <div className="font-['Satoshi-Medium',_sans-serif]">{formatDate(selectedGuestDetail.create_date || selectedGuestDetail.created_at)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Phone Number</div>
                    <div className="font-['Satoshi-Medium',_sans-serif]'">{selectedGuestDetail.phone || selectedGuestDetail.phone_number || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Tickets</div>
                    <div className="font-['Satoshi-Medium',_sans-serif]">{selectedGuestDetail.total_ticket ? `${selectedGuestDetail.total_ticket} Tickets` : '-'}</div>
                  </div>
                </div>

                {/* Action notice or checked-in message */}
                {selectedGuestDetail.is_checkin ? (
                  <div className="bg-green-800 text-green-100 rounded-md p-3 mb-4">
                    User already checked in, check in date: {formatDate(selectedGuestDetail.checkin_date || selectedGuestDetail.checkin_date)}
                  </div>
                ) : (
                  <>
                    <div className="bg-yellow-800 text-yellow-100 rounded-md p-3 mb-4">This guest is currently pending approval</div>

                    <div className="flex gap-4 mb-6">
                      <button
                        className={`flex-1 bg-green-500 text-white py-3 rounded-md ${actionLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        onClick={handleCheckIn}
                        disabled={actionLoading}
                      >
                        Check In
                      </button>
                      <button
                        className={`flex-1 bg-red-500 text-white py-3 rounded-md ${actionLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        onClick={handleDecline}
                        disabled={actionLoading}
                      >
                        Decline
                      </button>
                    </div>
                  </>
                )}

                <hr className="border-gray-800 mb-4" />

                {/* Tickets breakdown */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-lg font-['Satoshi-Medium',_sans-serif]">{selectedGuestDetail.total_ticket} Tickets</div>
                    <div className="text-sm text-gray-400">{selectedGuestDetail.invoice_code ? `Invoice: ${selectedGuestDetail.invoice_code}` : ''}</div>
                  </div>
                  <div className="bg-[#111] rounded-md p-4">
                    {/* ticket_name may be a string containing breakdown */}
                    <div className="text-sm">{selectedGuestDetail.ticket_name || '-'}</div>
                  </div>
                </div>

                {/* Additional info */}
                <div>
                  <div className="text-lg font-['Satoshi-Medium',_sans-serif] mb-2">Additional Question</div>
                  <div className="bg-[#111] rounded-md p-4">
                    <div className="text-sm">{selectedGuestDetail.additional_questions ? JSON.stringify(selectedGuestDetail.additional_questions, null, 2) : '-'}</div>
                  </div>
                </div>

              </div>
            ) : (
              <div>No detail available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestPage;
