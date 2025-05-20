import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { format } from 'date-fns';

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('https://jdticket-production.up.railway.app/events/get-all');
      setEvents(response.data.data); // <- sesuaikan dengan format response API kamu
    } catch (err) {
      console.error(err);
      setError('Gagal memuat event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className='flex flex-col mb-8 px-8'>
        <h1 className="text-3xl font-bold">Browse Event</h1>
        <p className="text-gray-400 text-lg mt-2">
          Explore popular events near you, browse by category, or check out some of the great community calendars.
        </p>
      </div>

      {/* Popular Events */}
      <div className="flex justify-between items-center mb-4 px-8">
        <div>
            <h2 className="text-2xl font-bold">Popular Events</h2>
            <p className="text-gray-400 text-lg">Jakarta</p>
        </div>
        <button className="text-gray-400 hover:text-white">View All</button>
      </div>

      {/* Event Grid */}
      <div className="grid grid-cols-2 gap-8 mt-6 w-full px-8">
        {loading && <p>Loading events...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {events.map(event => (
            <div 
              key={event.id}
              onClick={() => navigate(`/event/${event.id}`)} 
              className="flex items-start gap-4 bg-[#1a1c29] p-4 rounded-lg hover:bg-gray-700"
            >
              <img
                src={event.image || 'https://source.unsplash.com/random/100x100?concert'}
                alt={event.name}
                className="w-16 h-16 rounded-md object-cover"
              />
              <div>
                <h3 className="font-semibold text-white text-lg">{event.name}</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {format(new Date(event.start_date), 'EEE, d MMM yyyy')} {format(new Date(event.start_date), 'HH:mm')} WIB
                </p>
                <p className="text-gray-400 text-sm">{event.location}</p>
              </div>
            </div>
        ))}
      </div>
      {/* Garis Bawah */}
      <div className="border-t border-gray-700 mt-8 m-8"></div>
    </div>
  );
}

export default Dashboard;
