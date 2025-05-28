import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { format } from 'date-fns';

const urlBe = import.meta.env.VITE_URL_CLAW;

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
      const response = await axios.get(`${urlBe}/events/get-all`);
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
        {loading && (
          <>
             {[...Array(6)].map((_, index) => (
                <div className="flex items-start gap-4 p-4 rounded-lg animate-pulse">
                  {/* Gambar placeholder */}
                  <div className="w-16 h-16 bg-gray-700 rounded-md"></div>

                  {/* Text placeholders */}
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/4"></div>
                    <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                  </div>
                </div>
             ))}
          </>
        )}
        {error && <p className="text-red-500">{error}</p>}

        {events.map(event => (
            <div 
              key={event.id}
              onClick={() => navigate(`/event/${event.id}`)} 
              className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-700"
            >
              <img
                src={event.image || 'https://wallpapercave.com/wp/wp9297718.jpg'}
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
