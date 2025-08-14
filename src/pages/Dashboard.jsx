import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { lazy, Suspense } from 'react';

function SkeletonLoader() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-1/2 bg-[#141717] rounded mb-4" />
      <div className="flex gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-6 w-24 bg-[#141717] rounded" />
        ))}
      </div>
      <div className="h-96 w-full bg-[#141717] rounded" />
    </div>
  );
}

const OverviewPage = lazy(() => import('./Dashboard/OverviewPage'));
const GuestPage = lazy(() => import('./Dashboard/GuestPage'));
const SalesPage = lazy(() => import('./Dashboard/SalesPage'));
const TicketsPage = lazy(() => import('./Dashboard/TicketsPage'));
const BlastPage = lazy(() => import('./Dashboard/BlastPage'));
const InsightPage = lazy(() => import('./Dashboard/InsightPage'));
const MorePage = lazy(() => import('./Dashboard/MorePage'));

const urlBe = import.meta.env.VITE_URL_BE;

function Dashboard() {
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
      <div className="max-w-4xl mx-auto py-12">
        <SkeletonLoader />
      </div>
    );
  }

  if (!event) return <p className="text-red-500">Event not found.</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-white mb-6">
        {/* Title */}
        <h1 className="text-responsive-title mb-4">{event.name}</h1>

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

      <Suspense fallback={<SkeletonLoader />}>
        {activeTab === "Overview" && <OverviewPage id={id} event={event}/>}
        {activeTab === "Guests" && <GuestPage id={id}/>}
        {activeTab === "Sales Report" && <SalesPage id={id}/>}
        {activeTab === "Tickets" && <TicketsPage id={id} event={event}/>}
        {activeTab === "Blast" && <BlastPage id={id}/>}
        {activeTab === "Insight" && <InsightPage id={id}/>}
        {activeTab === "More" && <MorePage id={id}/>}
      </Suspense>
    </div>
  );
}

export default Dashboard;