import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png';
import insta from '../assets/insta.svg';
import copy from '../assets/copy.svg';
import { format } from 'date-fns';
import { FaMapPin } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom';

const urlBe = import.meta.env.VITE_URL_CLAW;

function EventDetailGuest() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [quantities, setQuantities] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${urlBe}/events/get/${id}`)
      .then((res) => {
        const data = res.data.data;
        setEvent(data);
        // Inisialisasi quantity 0 untuk setiap jenis tiket
        const initialQuantities = {};
        if (data.list_ticket?.length === 1) {
          initialQuantities[data.list_ticket[0].id] = 1;
        } else {
          data.list_ticket?.forEach(ticket => {
            initialQuantities[ticket.id] = 0;
          });
        }
        setQuantities(initialQuantities);
      })
      .catch(() => {
        setEvent(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

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

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  const formattedStartDate = format(startDate, 'EEE, d MMM yyyy');
  
  const startDay = format(startDate, 'd');         // contoh: "1"
  const startMonth = format(startDate, 'MMM');     // contoh: "May"
  const formattedStartTime = format(startDate, 'HH:mm');
  const formattedEndTime = format(endDate, 'HH:mm');

  const increaseQty = (ticketId) => {
    setQuantities(prev => ({ ...prev, [ticketId]: prev[ticketId] + 1 }));
  };
  
  const decreaseQty = (ticketId) => {
    setQuantities(prev => ({
      ...prev,
      [ticketId]: Math.max(prev[ticketId] - 1, 0)
    }));
  };

  const handleRegister = () => {
    const total = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    if (total === 0) {
      setErrorMessage('Minimal 1 tiket untuk registrasi');
      return;
    }
  
    setErrorMessage('');
    setShowModal(true);
    console.log('Lanjut ke registrasi', quantities);
  };
  
  const handleSubmitRegister = async (e) => {
    e.preventDefault();
  
    if (!formData.name || !formData.email) {
      alert('Semua field harus diisi!');
      return;
    }
  
    const tickets = Object.entries(quantities).map(([id, jumlah]) => ({
      id: parseInt(id),
      jumlah
    }));
    
    setIsRegistered(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        no_hp: formData.phone,
        event_id: event.id,
        tickets
      };
  
      const response = await axios.post(
        `${urlBe}/events/regis`,
        payload
      );
  
      alert(response.data.message);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setIsRegistered(false);
      alert('Registrasi gagal.');
    }
  };
  

  return (
    <div className='max-w-5xl mx-auto pb-10'>
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12"> 
        {/* Left Panel */}
        <div className="md:col-span-1 space-y-4">
          <img
            src={event.image || 'https://wallpapercave.com/wp/wp9297718.jpg'}
            alt={event.name}
            className="rounded-xl w-full h-[300px] object-cover"
          />
          <div className="mt-6">
            <h3 className="text-sm text-gray-400 font-bold">Host</h3>
            <hr className="border-t border-gray-300 my-2 opacity-20" /> 
            <div className='flex flex-row justify-between items-center'>
              <div className="flex items-center gap-3">
                <img
                  src={event.created_by.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.created_by?.name || 'User')}&background=random`}
                  alt="Host Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-white font-['Satoshi-Bold']">{event.created_by.name}</span>
              </div>

              <img
                src={insta}
                alt="Instagram Icon"
                className="w-6 h-6" 
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm text-gray-400 font-bold">{event.total_registered} Going</h3>
            <hr className="border-t border-gray-300 my-2 opacity-20" /> 
          </div>

          <div className="mt-6">
            <h3 className="text-sm text-gray-400 font-bold">Share</h3>
            <hr className="border-t border-gray-300 my-2 opacity-20" /> 
            <div className="flex flex-row items-center gap-2">
              <img
                src={copy}
                alt="Copy Icon"
                className="w-5 h-5 cursor-pointer"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
              />
              <p className="text-sm text-white-400 mt-0.5">Copy link</p>
            </div>
          </div>
          <h3 className="text-sm text-gray-400 font-bold">Contact the Host</h3>
          <h3 className="text-sm text-gray-400 font-bold">Report Event</h3>
        </div>

        {/* Right Panel */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">{event.name}</h1>
            
          </div>
          
          <div className="flex flex-row">
            {/* Calendar Icon */}
            <div className="w-12 h-12 rounded-md flex flex-col items-center justify-center text-white font-bold text-xs leading-none border border-white">
              <div className="text-[10px]">{startMonth}</div>
              <div className="text-lg pt-1">{startDay}</div>
            </div>
            <div className="flex flex-col ml-4">
              <p className="text-sm text-gray-500 mt-1">
                {formattedStartDate}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formattedStartTime} - {formattedEndTime} WIB 
              </p>
            </div>
          </div>
          <div className="flex flex-row">
          {/* Map Pointer Icon */}
          <div className="w-12 h-12 rounded-md flex flex-col items-center justify-center text-white font-bold text-xs leading-none border border-white">
            <FaMapPin className="text-white text-2xl" />
          </div>
          
          <div className="flex flex-col ml-4">
            <p className="text-sm text-gray-500 mt-1">
              {event.location_name}
            </p>
            <p className="text-gray-400">{event.location_address}</p>
          </div>
        </div>

          {/* Register Box */}
          <div className="bg-[#1a1c29] p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-['Satoshi-Bold'] mb-4">Registration</h2>
            <p className="text-sm text-gray-400 mb-4">
              Welcome! To join the event, please register below.
            </p>
            {event.list_ticket?.map(ticket => (
              <div
                key={ticket.id}
                className="flex justify-between items-center bg-[#11162a] rounded-lg px-4 py-3 mb-4 border border-white/20"
              >
                <div>
                  <h3 className="text-white text-md font-['Satoshi-Bold']">{ticket.name}</h3>
                  <p className="text-sm text-gray-400"> 
                    {ticket.price === 0 ? 'Free' : `Rp ${ticket.price.toLocaleString()}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decreaseQty(ticket.id)}
                    className="w-6 h-6 bg-black text-white text-sm rounded flex items-center justify-center"
                  >
                    –
                  </button>
                  <span className="w-6 text-center">{quantities[ticket.id]}</span>
                  <button
                    onClick={() => increaseQty(ticket.id)}
                    className="w-6 h-6 bg-white text-black text-sm rounded flex items-center justify-center"
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
              className="bg-white text-black w-full py-2 mt-4 rounded hover:bg-gray-300"
              onClick={handleRegister}
            >
              Register
            </button>
          </div>

          {/* Register Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-start pt-10">
              <div className="bg-[#1a1c29] p-6 rounded-lg w-[90%] max-w-md shadow-lg relative border border-blue-500">
                {/* Close Button */}
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-3 right-3 text-white text-xl font-bold"
                >
                  ×
                </button>

                <h2 className="text-2xl font-bold mb-4 text-white">Your Info</h2>

                <form className="space-y-4" onSubmit={handleSubmitRegister}>
                  <div>
                    <label className="block text-sm text-white mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-[#2a2d3e] text-white"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-[#2a2d3e] text-white"
                      placeholder="you@gmail.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-[#2a2d3e] text-white"
                      placeholder="08XXXXXXXX"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-white text-black w-full py-2 rounded hover:bg-gray-300 mt-4 disabled:opacity-50"
                    disabled={isRegistered}
                  >
                    {isRegistered ? 'Registered...' : 'Register'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* About Section */}
          <div>
            <h2 className="text-xl font-['Satoshi-Bold'] mb-2">About Event</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {event.description || 'No description provided.'}
            </p>
          </div>

          {/* Location Section */}
          <div>
            <h2 className="text-xl font-['Satoshi-Bold'] mb-2">Location</h2>
            <p className="text-base font-['Satoshi-Bold'] mb-2">{event.location_name}</p>
            <p className="text-gray-300 mb-2">{event.location_address}</p>
            <iframe
              title="event-location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`}
              className="w-full h-60 rounded-lg border border-gray-700"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailGuest;
