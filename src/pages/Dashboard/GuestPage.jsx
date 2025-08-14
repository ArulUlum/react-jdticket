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
              className="flex justify-between items-center p-4 border-b border-gray-800 hover:bg-[#1a1a1a]"
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
                {guest.status === "approve" ? (
                  <div className={`flex items-center gap-1 text-sm font-['Satoshi-Regular',_sans-serif]`}>
                    {guest.status}
                  </div>
                ) : (
                  <div className={`text-sm font-['Satoshi-Medium',_sans-serif]`}>
                    {guest.status}
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
    </div>
  );
};

export default GuestPage;
