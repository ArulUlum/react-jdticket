import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

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

const TAB_CONFIG = [
  { key: 'Overview', label: 'Overview', component: OverviewPage },
  { key: 'Guests', label: 'Guests', component: GuestPage },
  { key: 'Sales Report', label: 'Sales Report', component: SalesPage },
  { key: 'Tickets', label: 'Tickets', component: TicketsPage },
  { key: 'Blast', label: 'Blast', component: BlastPage },
  { key: 'Insight', label: 'Insight', component: InsightPage },
  { key: 'More', label: 'More', component: MorePage },
];

function Dashboard() {
  const { id } = useParams();
  const { state } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = useMemo(() => TAB_CONFIG, []);
  const activeTab = useMemo(() => {
    const fromUrl = searchParams.get('tab');
    const isValid = tabs.some((t) => t.key === fromUrl);
    return isValid ? fromUrl : tabs[0].key;
  }, [searchParams, tabs]);

  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: tabs[0].key }, { replace: true });
    }
  }, [searchParams, setSearchParams, tabs]);

  useEffect(() => {
    let mounted = true;

    async function fetchEvent() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${urlBe}/events/overview/${id}`, {
          headers: { 'x-jdticket': localStorage.getItem('token') || '' },
        });
        if (!mounted) return;
        setEvent(res.data.data);
      } catch (err) {
        if (!mounted) return;
        const message = err?.response?.data?.message || 'Failed to load event';
        console.error(message);
        setError(message);
        setEvent(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchEvent();
    return () => {
      mounted = false;
    };
  }, [id]);

  const activeConfig = tabs.find((t) => t.key === activeTab);
  const ActivePage = activeConfig?.component;
  const tabProps = { id, event };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <SkeletonLoader />
      </div>
    );
  }

  if (error || !event) {
    return <div className="text-red-500">{error || 'Event not found.'}</div>;
  }

  return (
    <>
      <div className="text-white mb-6">
        <h1 className="text-responsive-title mb-4">{state?.name || event.name}</h1>

        <div className="flex gap-4 overflow-x-auto whitespace-nowrap pb-1">
          {tabs.map((tab) => {
            const search = `?tab=${encodeURIComponent(tab.key)}`;
            return (
              <NavLink
                key={tab.key}
                to={{ search }}
                replace
                className={() =>
                  `mr-4 flex-shrink-0 inline-flex items-center text-lg cursor-pointer no-underline border-b-2 border-transparent pb-1 ${
                    activeTab === tab.key
                      ? "text-white font-['Satoshi-Bold',_sans-serif] border-[#2F645E] hover:text-white"
                      : "text-[#A2A2A2] font-['Satoshi-Regular'] hover:text-white"
                  }`
                }
              >
                {tab.label}
              </NavLink>
            );
          })}
        </div>
      </div>

      <Suspense fallback={<SkeletonLoader />}>
        {ActivePage ? <ActivePage {...tabProps} /> : null}
      </Suspense>
    </>
  );
}

export default Dashboard;
