import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import logo from '../assets/logo.png';
import axios from 'axios';
import OverviewPage from './OverviewPage';
import GuestPage from './GuestPage';
import SalesPage from './SalesPage';
import TicketsPage from './TicketsPage';
import BlastPage from './BlastPage';

const urlBe = import.meta.env.VITE_URL_BE;

function EventDetailHost() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = ["Overview", "Guests", "Sales Report", "Tickets", "Blast", "Insight", "More"];
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    console.log("Klik tab:", tab);
  };

  useEffect(() => {
    axios.get(`${urlBe}/events/overview/${id}`,
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

  if (!event) return <p className="text-red-500">Event not found.</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="font-['Satoshi-Bold',_sans-serif] text-white mb-6">
        {/* Title */}
        <h1 className="text-3xl font-['Satoshi-Bold',_sans-serif] mb-4">{event.name}</h1>

        {/* Tab Navigasi */}
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <div
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`mr-4 text-lg cursor-pointer ${
                activeTab === tab
                  ? "text-white font-['Satoshi-Bold',_sans-serif] border-b-2 border-[#2F645E]"
                  : "text-[#A2A2A2] font-['Satoshi-Regular'] hover:text-white"
              }`}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      <div>
        {activeTab === "Overview" && <OverviewPage id={id} event={event}/>}
        {activeTab === "Guests" && <GuestPage id={id}/>}
        {activeTab === "Sales Report" && <SalesPage id={id}/>}
        {activeTab === "Tickets" && <TicketsPage id={id}/>}
        {activeTab === "Blast" && <BlastPage id={id}/>}
      </div>
    </div>
  );
}

export default EventDetailHost;