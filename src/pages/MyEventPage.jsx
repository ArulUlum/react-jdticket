import { useState } from "react";
import { Link } from "react-router-dom";

function MyEventPage() {
  const [tab, setTab] = useState("upcoming");
  // Example data for upcoming events
  const upcomingEvents = [
    {
      id: 1,
      date: "24 July Thursday",
      time: "14.00 WIB",
      title: "XYZ Music Festival",
      location: "Jakarta Gambir Expo",
      guests: 6,
      image: "https://wallpapercave.com/wp/wp9297718.jpg",
    },
    {
      id: 2,
      date: "24 July Thursday",
      time: "14.00 WIB",
      title: "XYZ Music Festival",
      location: "Jakarta Gambir Expo",
      guests: 6,
      image: "https://wallpapercave.com/wp/wp9297718.jpg",
    },
    {
      id: 3,
      date: "24 July Thursday",
      time: "14.00 WIB",
      title: "XYZ Music Festival",
      location: "Jakarta Gambir Expo",
      guests: 6,
      image: "https://wallpapercave.com/wp/wp9297718.jpg",
    },
  ];
  const hasUpcoming = upcomingEvents.length > 0;
  // Example data for past events
  const pastEvents = [
    {
      id: 1,
      date: "24 July Thursday",
      time: "14.00 WIB",
      title: "XYZ Music Festival",
      location: "Jakarta Gambir Expo",
      guests: 6,
      image: "https://wallpapercave.com/wp/wp9297718.jpg",
      status: "Going",
    },
    {
      id: 2,
      date: "24 July Thursday",
      time: "14.00 WIB",
      title: "XYZ Music Festival",
      location: "Jakarta Gambir Expo",
      guests: 6,
      image: "https://wallpapercave.com/wp/wp9297718.jpg",
      status: "Hosting",
    },
    {
      id: 3,
      date: "24 July Thursday",
      time: "14.00 WIB",
      title: "XYZ Music Festival",
      location: "Jakarta Gambir Expo",
      guests: 6,
      image: "https://wallpapercave.com/wp/wp9297718.jpg",
      status: "Not Going",
    },
  ];
  const hasPast = pastEvents.length > 0;


  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-12">
      {/* Tabs */}
      <div className="flex gap-8 mb-12">
        <button
          className={`text-lg font-medium pb-1 border-b-2 transition-all ${tab === "upcoming" ? "text-white border-[#6fffc6]" : "text-[#a2a2a2] border-transparent"}`}
          onClick={() => setTab("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`text-lg font-medium pb-1 border-b-2 transition-all ${tab === "past" ? "text-white border-[#6fffc6]" : "text-[#a2a2a2] border-transparent"}`}
          onClick={() => setTab("past")}
        >
          Past
        </button>
      </div>

      {/* Timeline for Past Events */}
      {tab === "past" && hasPast && (
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl mx-auto mt-8">
          {/* Timeline */}
          <div className="flex flex-col items-center pt-8 min-w-[120px]">
            {pastEvents.map((event, idx) => (
              <div key={event.id} className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full bg-[#a2a2a2] ${idx === 0 ? '' : 'mt-8'}`}></div>
                {idx < pastEvents.length - 1 && (
                  <div className="w-px h-16 bg-gradient-to-b from-[#a2a2a2] to-transparent border-dashed border-l-2 border-[#a2a2a2] opacity-60"></div>
                )}
              </div>
            ))}
          </div>
          {/* Events List */}
          <div className="flex-1 flex flex-col gap-8">
            {pastEvents.map((event, idx) => (
              <div key={event.id} className="flex items-center gap-8">
                <div className="min-w-[160px] text-white text-lg font-bold text-right">
                  <span className="block text-2xl font-bold leading-tight">{event.date.split(' ')[0]} <span className="font-normal text-lg">{event.date.split(' ').slice(1).join(' ')}</span></span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center bg-[#232323] rounded-2xl p-4 gap-4 shadow-md">
                    <div className="flex-1">
                      {/* Status badge */}
                      {event.status && (
                        <span className={`inline-block mb-2 px-3 py-1 rounded-full text-xs font-semibold mr-2 ${
                          event.status === 'Going' ? 'bg-green-800 text-green-100' :
                          event.status === 'Hosting' ? 'bg-blue-900 text-blue-200' :
                          event.status === 'Not Going' ? 'bg-red-900 text-red-200' :
                          'bg-[#a2a2a2] text-white'
                        }`}>
                          {event.status}
                        </span>
                      )}
                      <div className="text-[#a2a2a2] text-xs mb-1">{event.time}</div>
                      <div className="text-white text-lg font-bold mb-1">{event.title}</div>
                      <div className="flex items-center gap-2 text-[#a2a2a2] text-sm mb-1">
                        <span role="img" aria-label="location">📍</span> {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-[#a2a2a2] text-sm">
                        <span role="img" aria-label="guests">👥</span> {event.guests} guests
                      </div>
                    </div>
                    <img src={event.image} alt={event.title} className="w-24 h-20 object-cover rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline for Upcoming Events */}
      {tab === "upcoming" && hasUpcoming && (
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl mx-auto mt-8">
          {/* Timeline */}
          <div className="flex flex-col items-center pt-8 min-w-[120px]">
            {upcomingEvents.map((event, idx) => (
              <div key={event.id} className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full bg-[#a2a2a2] ${idx === 0 ? '' : 'mt-8'}`}></div>
                {idx < upcomingEvents.length - 1 && (
                  <div className="w-px h-16 bg-gradient-to-b from-[#a2a2a2] to-transparent border-dashed border-l-2 border-[#a2a2a2] opacity-60"></div>
                )}
              </div>
            ))}
          </div>
          {/* Events List */}
          <div className="flex-1 flex flex-col gap-8">
            {upcomingEvents.map((event, idx) => (
              <div key={event.id} className="flex items-center gap-8">
                <div className="min-w-[160px] text-white text-lg font-bold text-right">
                  <span className="block text-2xl font-bold leading-tight">{event.date.split(' ')[0]} <span className="font-normal text-lg">{event.date.split(' ').slice(1).join(' ')}</span></span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center bg-[#232323] rounded-2xl p-4 gap-4 shadow-md">
                    <div className="flex-1">
                      <div className="text-[#a2a2a2] text-xs mb-1">{event.time}</div>
                      <div className="text-white text-lg font-bold mb-1">{event.title}</div>
                      <div className="flex items-center gap-2 text-[#a2a2a2] text-sm mb-1">
                        <span role="img" aria-label="location">📍</span> {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-[#a2a2a2] text-sm">
                        <span role="img" aria-label="guests">👥</span> {event.guests} guests
                      </div>
                    </div>
                    <img src={event.image} alt={event.title} className="w-24 h-20 object-cover rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Empty State */}
      {((!hasUpcoming && tab === "upcoming") || (!hasPast && tab === "past")) && (
        <div className="flex flex-col items-center justify-center mt-8">
          {/* Calendar Icon (SVG) */}
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="50" width="120" height="90" rx="20" fill="#D9D9D9" />
            <rect x="30" y="50" width="120" height="40" rx="10" fill="#232323" />
            <rect x="60" y="80" width="60" height="60" rx="12" fill="#A3A3A3" />
            <polygon points="90,110 98,130 80,120 100,120 82,130" fill="#232323" />
            <circle cx="60" cy="50" r="10" fill="#232323" />
            <circle cx="120" cy="50" r="10" fill="#232323" />
          </svg>
          <div className="text-white text-2xl font-bold mt-8 mb-2">
            {tab === "upcoming" ? "No Upcoming Events" : "No Past Events"}
          </div>
          <div className="text-[#a2a2a2] mb-6">
            Ready to create something awesome?
          </div>
          <Link
            to="/create-event"
            className="bg-[#181818] text-white rounded-lg px-6 py-3 font-medium flex items-center gap-2 border border-[#232323] hover:bg-[#232323] transition"
          >
            <span className="text-xl font-bold">+</span> Create Event
          </Link>
        </div>
      )}
    </div>
  );
}

export default MyEventPage;
