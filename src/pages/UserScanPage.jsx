import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import logo from '../assets/logo.png';
import axios from 'axios';
import { Search, Crown } from 'lucide-react';
import { formatDistance, differenceInMinutes, differenceInHours, parseISO } from 'date-fns';

const urlBe = import.meta.env.VITE_URL_CLAW;

function UserScanPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [guests, setGuests] = useState([]);

  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(search.toLowerCase()) ||
    guest.email.toLowerCase().includes(search.toLowerCase())
  );
  
  const getStatusBadge = (status) => {
    const base = "rounded-full px-3 py-1 text-sm font-medium";
    switch (status) {
      case 'Going':
        return <span className={`bg-green-600 text-white ${base}`}>Going</span>;
      case 'Pending':
        return <span className={`bg-yellow-600 text-white ${base}`}>Pending</span>;
      default:
        return null;
    }
  };

  useEffect(() => {
    axios.get(`${urlBe}/events/user/${id}/scan`,
      {
        headers: {
            'x-jdticket': localStorage.getItem('token') || '',
          },
      }
    )
      .then((res) => {
        const data = res.data.data;
        setData(data);
        setGuests(data.guest_list)
      })
      .catch((res) => {
        console.log(res.data.message)
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (!data) return <p className="text-red-500">Event not found.</p>;
  
  const eventStart = parseISO(data.event_start_date.replace(' ', 'T'));
  const now = new Date();
  const diffMinutes = differenceInMinutes(eventStart, now);
  const diffHours = differenceInHours(eventStart, now);
  let startText = '';
  if (diffMinutes <= 0) {
    startText = 'Already started';
  } else if (diffMinutes < 60) {
    startText = `Starting in ${diffMinutes} minutes`;
  } else {
    startText = `Starting in ${diffHours} hours`;
  }


  const fetchGuest = async (status, checkin_status, search, page, limit) => {
    try {
      const response = await axios.get(`${urlBe}/events/user/${id}/scan`, {
        params: {
          status,
          checkin_status,
          search,
          page,
          limit
        },
        headers: {
          'x-jdticket': localStorage.getItem('token') || '',
        }
      });
      setGuests(response.data.data.guest_list);
    } catch (error) {
      console.error("Error fetching guest list", error);
    }
  }

  const handleSearchChange = (e) => {
    const newSearch = e.target.value;
    setSearch(newSearch);
    fetchGuest(null, null, newSearch, null, null); // kamu bisa sesuaikan page & limit
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#060810]">
        <img
          src={logo}
          alt="Loading..."
          className="w-29 h-32 animate-pulseShrink"
        />
      </div>
    );
  }

  

  return (
    <div className="px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-5 font-['Satoshi-Bold',_sans-serif] text-white mb-6">
          {/* Title */}
          <h1 className="text-3xl">{data.event_name}</h1>
          <div className="text-gray-400">{startText}</div>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="flex relative gap-2.5 w-full bg-[#0f0f0f] border border-strokesss rounded-lg p-4">
            <Search className="w-5 h-5 text-gray-300"/>
            <input
            type="text"
            placeholder="Search Guest..."
            value={search}
            onChange={handleSearchChange}
            className="bg-transparent outline-none text-white w-full font-['Satoshi-Medium']"
            />
          </div>
          <button 
            className="bg-green-700 px-4 py-2 rounded"
            onClick={() => navigate(`/scan`)}
          >Scan</button>
        </div>

        <div className="flex gap-4 mb-4 text-sm">
          <button className="text-white">All Guest</button>
          <button className="text-gray-400">Going {data.summary.going}</button>
          <button className="text-gray-400">Pending {data.summary.pending}</button>
          <button className="text-gray-400">Checked In {data.summary.checked_in}</button>
        </div>

        <div className="bg-[#1a1a1a] rounded p-4">
        {filteredGuests.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No guests found.</div>
        ) : (
          filteredGuests.map((guest, index) => (
            <div key={index} className="flex justify-between items-center py-3 border-b border-gray-800 last:border-none">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700" />
                <div>
                  <div className="font-medium">{guest.name}</div>
                  <div className="text-sm text-gray-400">{guest.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {guest.tickets > 1 && (
                  <span className="text-sm bg-gray-700 rounded-full px-2 py-1">{guest.tickets} Tickets</span>
                )}
                {getStatusBadge(guest.status)}
                {guest.isVIP && <Crown className="text-yellow-400 w-4 h-4" />}
                <span className={`text-sm font-medium ${guest.scanned ? 'text-blue-400' : 'text-red-500'}`}>
                  {guest.scanned ? 'Scanned' : 'Unscanned'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}

export default UserScanPage;