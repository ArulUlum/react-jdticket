import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { FaMapPin } from 'react-icons/fa'; 
import logo from '../assets/logo.png';
import axios from 'axios';

function EventDetailHost() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`https://jdticket-production.up.railway.app/events/get-detail/${id}`,
      {
        headers: {
            'x-jdticket': localStorage.getItem('token') || '',
          },
      }
    )
      .then((res) => {
        const data = res.data.data;
        setEvent(data);
      })
      .catch(() => {
        setEvent(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

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

  if (!event) return <p className="text-red-500">Event not found.</p>;

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  const formattedStartDate = format(startDate, 'EEE, d MMM yyyy');
  
  const startDay = format(startDate, 'd');         // contoh: "1"
  const startMonth = format(startDate, 'MMM');     // contoh: "May"
  const formattedStartTime = format(startDate, 'HH:mm');
  const formattedEndTime = format(endDate, 'HH:mm');

  return (
    <div
      className="min-h-screen relative overflow-hidden text-white py-12 px-6"
      style={{
        background: 'linear-gradient(151.79deg, rgba(0, 28, 25, 1) 0%, rgba(9, 9, 9, 1) 100%)'
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-3xl font-bold mb-2">{event.name}</div>
        <div className="flex gap-4 mb-6">
          <button className="bg-white text-black px-4 py-1 rounded-full">Overview</button>
          <button className="px-4 py-1">Guests</button>
          <button className="px-4 py-1">Registration</button>
          <button className="px-4 py-1">Blast</button>
          <button className="px-4 py-1">Insight</button>
        </div>

        <div className="flex gap-4 mb-6">
          <button className="bg-[#00594F] text-white px-4 py-2 rounded">Invite Guests</button>
          <button className="bg-[#00594F] text-white px-4 py-2 rounded">Send a Blast</button>
          <button className="bg-[#00594F] text-white px-4 py-2 rounded">Share Event</button>
        </div>

        <div className="bg-[#0D1F1E] p-6 rounded-lg flex gap-6 mb-6">
          <img
            src="https://images.unsplash.com/photo-1533106418989-88406c7cc8b6"
            alt="event"
            className="w-48 h-32 object-cover rounded"
          />
          <div className="flex-1">
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
                  Gambir Expo Kemayoran
                </p>
                <p className="text-gray-400">{event.location}</p>
              </div>
            </div>
            <button onClick={() => navigate('/scan')} className="bg-[#00594F] px-6 py-2 rounded mt-6">
                Scan QR
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="font-semibold mb-2">Registration</div>
          <div className="flex gap-8 text-sm">
            <div>{event.total_checkin}/{event.total_registered} Guests Checked in</div>
            <div>{event.checkin_invitees}/{event.total_invitees} Invitees Checked in</div>
            <div>{event.checkin_guest}/{event.total_guest} Total Registered</div>
          </div>
          <div className="mt-4 bg-[#0F2625] p-4 rounded">
            {event.user_checkin.map((r, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-[#1a2f2e]">
                <div>{r.name}</div>
                <div>{r.email}</div>
                <div><span className="bg-[#1a2f2e] px-2 py-1 rounded text-xs">{r.role}</span></div>
                <div>{format(new Date(r.checkin_date), 'HH:mm')} WIB</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="font-semibold mb-2">Sales Report</div>
          <div className="flex gap-6 text-sm">
            <div>Total Sales: <span className="text-green-400">{event.total_sales}</span></div>
            <div>Tickets Sold: <span className="text-red-400">{event.ticket_sold}/{event.total_ticket}</span></div>
            <div>Total Visitor: <span className="text-green-400">1231231231</span></div>
          </div>
        </div>

        <div className="mb-6">
          <div className="font-semibold mb-2">Hosts</div>
          {event.hosts.map((host, i) => (
            <div key={i} className="bg-[#0F2625] p-3 rounded mb-2 flex justify-between">
              <div>
                <div>{host.name}</div>
                <div className="text-sm text-gray-400">{host.email}</div>
              </div>
              {/* <div className="text-sm px-2 py-1 border rounded border-gray-400">{host.role}</div> */}
            </div>
          ))}
          <button className="mt-2 bg-[#1d4d41] px-4 py-2 rounded">Add Host</button>
        </div>

        <div className="mb-6">
          <div className="font-semibold mb-2">Visibility & Discovery</div>
          <div className="flex gap-4">
            <button className="bg-white text-black px-4 py-2 rounded">Public</button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded" disabled>Private</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailHost;