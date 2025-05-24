import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  UserPlus, 
  Send, 
  Share2,
  CalendarDays,
  MapPin,
  Pencil,
  ScanLine,
  TrendingUp, 
  TrendingDown,
  Eye, 
  EyeOff
} from "lucide-react";
import logo from '../assets/logo.png';
import axios from 'axios';

function EventDetailHost() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [visibility, setVisibility] = useState("public");

  const tabs = ["Overview", "Guests", "Registration", "Blast", "Insight", "More"];
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    console.log("Klik tab:", tab);
  };

  const actions = [
    {
      icon: <UserPlus className="w-5 h-5 text-white" />,
      label: "Invite Guests",
      onClick: () => console.log("Invite"),
    },
    {
      icon: <Send className="w-5 h-5 text-white" />,
      label: "Send a Blast",
      onClick: () => console.log("Blast"),
    },
    {
      icon: <Share2 className="w-5 h-5 text-white" />,
      label: "Share Event",
      onClick: () => console.log("Share"),
    },
  ];

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
      .catch((res) => {
        console.log(res.data.message)
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

  const salesData = [
    {
      label: "Total Sales",
      value: event.total_sales,
      trend: "up",
      percent: "20%",
      color: "green",
    },
    {
      label: "Tickets Sold",
      value: event.ticket_sold + "/" + event.total_ticket,
      trend: "down",
      percent: "18%",
      color: "red",
    },
    {
      label: "Total Visitor",
      value: "42.584",
      trend: "up",
      percent: "75%",
      color: "green",
    },
  ];

  if (!event) return <p className="text-red-500">Event not found.</p>;

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  const formattedStartDate = format(startDate, 'EEE, d MMM yyyy');
  
  const startDay = format(startDate, 'd');         // contoh: "1"
  const startMonth = format(startDate, 'MMM');     // contoh: "May"
  const formattedStartTime = format(startDate, 'HH:mm');
  const formattedEndTime = format(endDate, 'HH:mm');

  return (
    <div className="text-white min-h-screen px-4 pb-20">
      <div className="max-w-5xl mx-auto">
        <div className="font-['Satoshi-Bold',_sans-serif] text-white mb-6">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-4">{event.name}</h1>

        {/* Tab Navigasi */}
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-1 rounded-full text-sm transition-all duration-200 ${
                activeTab === tab
                  ? "bg-[#2F645E] text-white"
                  : "bg-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {actions.map(({ icon, label, onClick }, i) => (
            <button
              key={i}
              onClick={onClick}
              className="flex items-center gap-3 bg-[#121212] border border-[#2F645E] rounded-xl px-4 py-2 hover:bg-[#1d1d1d] transition"
            >
              <div className="bg-[#2F645E] p-2 rounded-md">
                {icon}
              </div>
              <span className="text-white font-satoshi font-medium text-sm">
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Event Card */}
        <div className="bg-[#121212] rounded-xl p-6 flex gap-6 items-start text-white font-satoshi">
          {/* Left: Image */}
          <img
            src={event.image || "https://wallpapercave.com/wp/wp9297718.jpg"}
            alt="event"
            className="w-[250px] h-[200px] object-cover rounded-lg"
          />

          {/* Right: Content */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold mb-4">{event.name}</h1>
              <button className="flex items-center gap-1 text-sm text-white bg-[#1e1e1e] px-3 py-1 rounded-lg border border-[#333] hover:bg-[#2a2a2a] transition">
                <Pencil className="w-4 h-4" />
                Edit Event
              </button>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-[#121212] w-10 h-10 rounded-lg border border-[#666] flex flex-col items-center justify-center text-xs leading-tight">
                <div className="text-gray-400">{startMonth}</div>
                <div className="text-lg font-bold">{startDay}</div>
              </div>
              <div>
                <div className="text-sm font-semibold">{formattedStartDate}</div>
                <div className="text-sm text-gray-400">{formattedStartTime} - {formattedEndTime} WIB</div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg border border-[#666] flex items-center justify-center">
                <MapPin className="text-white w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Gambir Expo Kemayoran</div>
                <div className="text-sm text-gray-400">
                  Jakarta Pusat, Daerah Khusus Ibukota Jakarta
                </div>
              </div>
            </div>

            {/* Start Check-In */}
            <button
              onClick={() => navigate('/scan')}
              className="w-full bg-[#2F645E] text-white py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#35796f] transition"
            >
              <ScanLine className="w-4 h-4" />
              Start Check-In
            </button>
          </div>
        </div>

        {/* Registration Info */}
        <div className="bg-transparent p-6 rounded-xl font-satoshi text-white">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold">Registration</div>
            <button className="text-sm bg-[#1e1e1e] border border-[#333] px-3 py-1 rounded-lg hover:bg-[#2a2a2a]">
              View All
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-10 mb-6">
            <div>
              <span className="text-2xl font-bold">{event.checkin_guest}/{event.total_guest}</span>
              <div className="text-sm text-gray-400">Guests Checked in</div>
            </div>
            <div>
              <span className="text-2xl font-bold">{event.checkin_invitees}/{event.total_invitees}</span>
              <div className="text-sm text-gray-400">Invitees Checked in</div>
            </div>
            <div>
              <span className="text-2xl font-bold">{event.total_checkin}/{event.total_registered}</span>
              <div className="text-sm text-gray-400">Total Registered</div>
            </div>
          </div>

          {/* User List */}
          <div className="bg-[#1A1A1A] rounded-xl overflow-hidden divide-y divide-[#2a2a2a]">
            {event.user_checkin.map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                {/* Left: Avatar & Name */}
                <div className="flex items-center gap-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-gray-400 text-xs">{user.email}</div>
                  </div>
                </div>

                {/* Center: Role */}
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      user.role === "GUEST"
                        ? "border-green-600 text-green-300"
                        : "border-blue-600 text-blue-300"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                {/* Right: Time */}
                <div className="text-gray-400 text-sm">{format(new Date(user.checkin_date), 'HH:mm')} WIB</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Report */}
        <div className="font-satoshi text-white p-6">
          {/* Heading */}
          <div className="mb-2 text-lg font-semibold">Sales Report</div>
          <p className="text-sm text-gray-400 mb-4">
            Track how your tickets are selling—see total sales, tickets sold, and total visitor.
          </p>

          {/* Card Grid */}
          <div className="flex gap-4 flex-wrap">
            {salesData.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#1a1a1a] rounded-xl p-4 w-full max-w-[280px] flex-1"
              >
                <div className="text-sm text-gray-400 mb-1">{item.label}</div>
                <div className="text-xl font-bold mb-1">{item.value}</div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">All time</span>
                  <div
                    className={`flex items-center gap-1 px-2 py-[2px] text-xs font-medium rounded-md ${
                      item.color === "green"
                        ? "bg-green-800 text-green-300"
                        : "bg-red-800 text-red-300"
                    }`}
                  >
                    {item.trend === "up" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {item.percent}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hosts */}
        <div className="font-satoshi text-white p-6">
          {/* Heading */}
          <div className="mb-2 text-lg font-semibold">Hosts</div>
          <p className="text-sm text-gray-400 mb-4">
            Manage your event team and special guests here.
          </p>

          {/* Host List */}
          <div className="space-y-3">
            {event.hosts.map((host, index) => (
              <div
                key={index}
                className="bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between"
              >
                {/* Left: Avatar, Name, Email */}
                <div className="flex items-center gap-4">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      host.name
                    )}&background=random&bold=true`}
                    alt={host.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium">{host.name}</div>
                    <div className="text-sm text-gray-400">{host.email}</div>
                  </div>
                </div>

                {/* Right: Role Badge + Add Button (only first) */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full border ${
                      host.role === "Creator"
                        ? "border-green-600 text-green-300"
                        : "border-blue-600 text-blue-300"
                    }`}
                  >
                    {host.role}
                  </span>

                  {index === 0 && (
                    <button className="text-sm bg-[#1e1e1e] border border-[#333] px-3 py-1 rounded-lg hover:bg-[#2a2a2a] flex items-center gap-1">
                      Add Host <span className="text-lg leading-none">+</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div className="font-satoshi text-white p-6">
          {/* Heading */}
          <div className="mb-2 text-lg font-semibold">Visibility & Discovery</div>
          <p className="text-sm text-gray-400 mb-4">
            Manage how your event appears on search and listings.
          </p>

          {/* Toggle Buttons */}
          <div className="flex gap-4">
            {/* Public Button */}
            <button
              onClick={() => setVisibility("public")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl border text-sm w-full max-w-[200px] justify-center
                ${
                  visibility === "public"
                    ? "border-[#3DAA95] bg-[#1a1a1a] text-white"
                    : "border-transparent bg-[#1a1a1a] text-gray-500"
                }`}
            >
              <Eye className="w-4 h-4" />
              Public
            </button>

            {/* Private Button */}
            <button
              onClick={() => setVisibility("private")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl border text-sm w-full max-w-[200px] justify-center
                ${
                  visibility === "private"
                    ? "border-[#3DAA95] bg-[#1a1a1a] text-white"
                    : "border-transparent bg-[#1a1a1a] text-gray-500"
                }`}
            >
              <EyeOff className="w-4 h-4" />
              Private
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailHost;