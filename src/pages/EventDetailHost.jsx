import React from 'react';
import { useNavigate } from 'react-router-dom';

function EventDetailHost() {
  const navigate = useNavigate();
  const event = {
    name: 'XYZ Music Festival',
    date: 'Sat, 7 May 2025',
    time: '17:00 - 23:00 WIB',
    location: 'Gambir Expo Kemayoran, Jakarta Pusat, DKI Jakarta',
    totalSales: 'Rp 1.024.000.000',
    ticketsSold: '6.700/10.000',
    totalVisitor: '42.584',
    guestsCheckedIn: '2/250',
    inviteesCheckedIn: '4/20',
    totalRegistered: '6/270',
    hosts: [
      {
        name: 'JoinDong',
        email: 'joindong.work@gmail.com',
        role: 'Creator'
      }
    ],
    registrants: [
      { name: 'Randy', email: 'randykobayakwawa@gmail.com', role: 'Guest', time: '21.35 WIB' },
      { name: 'Arul', email: 'arulmelonee@gmail.com', role: 'Invitee', time: '21.10 WIB' }
    ]
  };

  return (
    <div className="bg-[#060810] w-full min-h-screen relative p-20 text-white">
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
            <div className="text-xl font-semibold">{event.name}</div>
            <div className="text-sm">{event.date} | {event.time}</div>
            <div className="text-sm mb-2">{event.location}</div>
            <button onClick={() => navigate('/scan')} className="bg-[#00594F] px-6 py-2 rounded mt-6">
                Scan QR
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="font-semibold mb-2">Registration</div>
          <div className="flex gap-8 text-sm">
            <div>Guests Checked in: {event.guestsCheckedIn}</div>
            <div>Invitees Checked in: {event.inviteesCheckedIn}</div>
            <div>Total Registered: {event.totalRegistered}</div>
          </div>
          <div className="mt-4 bg-[#0F2625] p-4 rounded">
            {event.registrants.map((r, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-[#1a2f2e]">
                <div>{r.name}</div>
                <div>{r.email}</div>
                <div><span className="bg-[#1a2f2e] px-2 py-1 rounded text-xs">{r.role}</span></div>
                <div>{r.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="font-semibold mb-2">Sales Report</div>
          <div className="flex gap-6 text-sm">
            <div>Total Sales: <span className="text-green-400">{event.totalSales}</span></div>
            <div>Tickets Sold: <span className="text-red-400">{event.ticketsSold}</span></div>
            <div>Total Visitor: <span className="text-green-400">{event.totalVisitor}</span></div>
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
              <div className="text-sm px-2 py-1 border rounded border-gray-400">{host.role}</div>
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