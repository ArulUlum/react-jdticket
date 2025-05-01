import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`https://jdticket-production.up.railway.app/events/get/${id}`)
      .then((res) => {
        setEvent(res.data.data);
      })
      .catch(() => {
        setEvent(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-white">Loading...</p>;
  if (!event) return <p className="text-red-500">Event not found.</p>;

  return (
    <div className="bg-[#060810] text-white min-h-screen py-12 px-6">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Left Panel */}
        <div className="md:col-span-1 space-y-4">
          <img
            src={event.image || 'https://source.unsplash.com/600x400/?concert'}
            alt={event.name}
            className="rounded-xl w-full h-[300px] object-cover"
          />

          <div>
            <h1 className="text-3xl font-bold mb-1">{event.name}</h1>
            <p className="text-gray-400">{event.location}</p>
            <p className="text-sm text-gray-500 mt-1">
              {event.start_date} - {event.end_date}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-sm text-gray-400 uppercase">Host</h3>
            <div className="flex items-center gap-3 mt-2">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(event.created_by?.name || 'User')}&background=random`}
                alt="Host Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-white font-semibold">{event.created_by.name}</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm text-gray-400 uppercase">Share</h3>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="text-sm text-blue-400 hover:underline mt-2"
            >
              Copy link
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="md:col-span-2 space-y-8">
          {/* Register Box */}
          <div className="bg-[#1a1c29] p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-2">Registration</h2>
            <p className="text-sm text-gray-400 mb-4">
              Welcome! To join the event, please register below.
            </p>
            <button className="bg-white text-black px-4 py-2 rounded hover:bg-gray-300">
              Register
            </button>
          </div>

          {/* About Section */}
          <div>
            <h2 className="text-xl font-semibold mb-2">About Event</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {event.description || 'No description provided.'}
            </p>
          </div>

          {/* Location Section */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Location</h2>
            <p className="text-gray-300 mb-2">{event.location}</p>
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

export default EventDetail;
