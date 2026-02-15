import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import axios from 'axios';
import { Search, Crown } from 'lucide-react';
import { differenceInMinutes, differenceInHours, parseISO } from 'date-fns';

const urlBe = import.meta.env.VITE_URL_BE;

function GuestListSkeleton({ count = 8 }) {
  return (
    <div className="bg-[#1a1a1a] rounded p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex justify-between items-center py-3 border-b border-gray-800 last:border-none animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700" />
            <div>
              <div className="h-4 w-24 bg-gray-700 rounded mb-1" />
              <div className="h-3 w-16 bg-gray-800 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-6 w-16 bg-gray-700 rounded-full" />
            <span className="h-4 w-14 bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function UserScanPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // server-side query params
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null); // 'GOING' | 'PENDING' | null
  const [checkinFilter, setCheckinFilter] = useState(null); // true | false | null
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // pagination from API
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  document.title = 'User List Scan - Kebbu';

  const getStatusBadge = (status) => {
    const base = 'rounded-full px-3 py-1 text-sm font-medium';
    switch (status) {
      case 'GOING':
        return <span className={`bg-green-600 text-white ${base}`}>Going</span>;
      case 'PENDING':
        return <span className={`bg-yellow-600 text-white ${base}`}>Pending</span>;
      default:
        return <span className={`bg-gray-700 text-gray-100 ${base}`}>{status || 'Unknown'}</span>;
    }
  };

  // Fetch pertama (tanpa filter) -> sekaligus isi summary & pagination
  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await axios.get(`${urlBe}/events/user/${id}/checkin`, {
          headers: { 'x-jdticket': localStorage.getItem('token') || '' },
        });

        const d = res.data?.data;
        setData(d || null);
        setGuests(d?.guest_list || []);
        setPage(d?.pagination?.page || 1);
        setPages(d?.pagination?.pages || 1);
        setTotal(d?.pagination?.total || (d?.guest_list?.length ?? 0));
      } catch (err) {
        setData(null);
        setErrorMsg(err?.response?.data?.message || 'Failed to load event.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, [id]);

  // Fetch guest (server-side) sesuai filter/search/page
  const fetchGuest = async (opts = {}) => {
    const {
      status = statusFilter,
      checkin_status = checkinFilter,
      q = search,
      newPage = page,
      newLimit = limit,
    } = opts;

    setLoading(true);
    setErrorMsg('');
    try {
      const response = await axios.get(`${urlBe}/events/user/${id}/checkin`, {
        params: {
          status, // 'GOING' | 'PENDING' | null
          checkin_status, // true | false | null
          search: q || undefined,
          page: newPage,
          limit: newLimit,
        },
        headers: { 'x-jdticket': localStorage.getItem('token') || '' },
      });

      const d = response.data?.data;
      // d di endpoint /scan idealnya punya struktur sama (guest_list + pagination)
      setGuests(d?.guest_list || []);
      setPage(d?.pagination?.page || newPage);
      setPages(d?.pagination?.pages || 1);
      setTotal(d?.pagination?.total || (d?.guest_list?.length ?? 0));

      // kalau endpoint /scan juga kembalikan data event, perbarui sebagian
      setData((prev) => {
        if (!prev) return d || null;
        return {
          ...prev,
          ...(d?.id ? { id: d.id } : {}),
          ...(d?.event_name ? { event_name: d.event_name } : {}),
          ...(d?.event_start_date ? { event_start_date: d.event_start_date } : {}),
          ...(d?.summary ? { summary: d.summary } : prev?.summary ? { summary: prev.summary } : {}),
        };
      });
    } catch (error) {
      setErrorMsg('Error fetching guest list');
    } finally {
      setLoading(false);
    }
  };

  // Search (server) dengan debounce ringan
  useEffect(() => {
    const t = setTimeout(() => {
      // reset ke page 1 saat ganti search
      fetchGuest({ q: search, newPage: 1 });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Helpers waktu event
  const startText = useMemo(() => {
    if (!data?.event_start_date) return '';
    const eventStart = parseISO(data.event_start_date.replace(' ', 'T'));
    const now = new Date();
    const diffMinutes = differenceInMinutes(eventStart, now);
    const diffHours = differenceInHours(eventStart, now);
    if (diffMinutes <= 0) return 'Already started';
    if (diffMinutes < 60) return `Starting in ${diffMinutes} minutes`;
    return `Starting in ${diffHours} hours`;
  }, [data?.event_start_date]);

  // Fallback summary kalau API kasih 0/undefined
  const computedSummary = useMemo(() => {
    const s = data?.summary || {};
    const countsFromList = guests.reduce(
      (acc, g) => {
        if (g.status === 'GOING') acc.going += 1;
        if (g.status === 'PENDING') acc.pending += 1;
        if (g.is_checkin) acc.checked_in += 1;
        acc.all += 1;
        return acc;
      },
      { all: 0, going: 0, pending: 0, checked_in: 0 },
    );
    return {
      all: s.all ?? countsFromList.all,
      going: s.going ?? countsFromList.going,
      pending: s.pending ?? countsFromList.pending,
      checked_in: s.checked_in ?? countsFromList.checked_in,
      registered_count: s.registered_count ?? 0,
      invitation_count: s.invitation_count ?? 0,
    };
  }, [data?.summary, guests]);

  // UI handlers
  const onClickAll = () => {
    setStatusFilter(null);
    setCheckinFilter(null);
    setPage(1);
    fetchGuest({ status: null, checkin_status: null, newPage: 1 });
  };

  const onClickGoing = () => {
    setStatusFilter('GOING');
    setCheckinFilter(null);
    setPage(1);
    fetchGuest({ status: 'GOING', checkin_status: null, newPage: 1 });
  };

  const onClickPending = () => {
    setStatusFilter('PENDING');
    setCheckinFilter(null);
    setPage(1);
    fetchGuest({ status: 'PENDING', checkin_status: null, newPage: 1 });
  };

  const onClickCheckedIn = () => {
    setStatusFilter(null);
    setCheckinFilter(true);
    setPage(1);
    fetchGuest({ status: null, checkin_status: true, newPage: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pages) return;
    setPage(newPage);
    fetchGuest({ newPage });
  };

  if (loading && !data) {
    return (
      <div className="px-4 pb-20 min-h-screen flex items-center justify-center bg-[#060810]">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex items-end gap-5 font-['Satoshi-Bold',_sans-serif] text-white mb-6">
            <div className="h-8 w-40 bg-gray-800 rounded animate-pulse" />
            <div className="h-6 w-32 bg-gray-900 rounded animate-pulse" />
          </div>
          <div className="flex gap-2 mb-4">
            <div className="flex relative gap-2.5 w-full bg-[#0f0f0f] border border-strokesss rounded-lg p-4">
              <div className="w-5 h-5 bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="bg-green-700 px-4 py-2 rounded text-white inline-block opacity-50 animate-pulse">
              <div className="h-4 w-12 bg-green-800 rounded" />
            </div>
          </div>
          <GuestListSkeleton count={8} />
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-red-500">{errorMsg || 'Event not found.'}</div>;
  }

  return (
    <div className="px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-5 font-['Satoshi-Bold',_sans-serif] text-white mb-6">
          <h1 className="text-3xl">{data.event_name}</h1>
          <div className="text-gray-400">{startText}</div>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="flex relative gap-2.5 w-full bg-[#0f0f0f] border border-strokesss rounded-lg p-4">
            <Search className="w-5 h-5 text-gray-300" />
            <input
              type="text"
              placeholder="Search Guest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-white w-full font-['Satoshi-Medium']"
            />
          </div>
          <Link
            to={`/scan/${id}`}
            className="bg-green-700 px-4 py-2 rounded text-white inline-block"
          >
            Scan
          </Link>
        </div>

        <div className="flex gap-4 mb-4 text-sm">
          <button
            className={`${
              statusFilter === null && checkinFilter === null ? 'text-white' : 'text-gray-400'
            }`}
            onClick={onClickAll}
          >
            All Guest {computedSummary.all > 0 ? `(${computedSummary.all})` : ''}
          </button>
          <button
            className={`${statusFilter === 'GOING' ? 'text-white' : 'text-gray-400'}`}
            onClick={onClickGoing}
          >
            Going {computedSummary.going > 0 ? `(${computedSummary.going})` : ''}
          </button>
          <button
            className={`${statusFilter === 'PENDING' ? 'text-white' : 'text-gray-400'}`}
            onClick={onClickPending}
          >
            Pending {computedSummary.pending > 0 ? `(${computedSummary.pending})` : ''}
          </button>
          <button
            className={`${checkinFilter === true ? 'text-white' : 'text-gray-400'}`}
            onClick={onClickCheckedIn}
          >
            Checked In {computedSummary.checked_in > 0 ? `(${computedSummary.checked_in})` : ''}
          </button>
        </div>

        <div className="bg-[#1a1a1a] rounded p-4">
          {loading ? (
            <div className="text-center text-gray-400 py-10">Loading guests…</div>
          ) : guests.length === 0 ? (
            <div className="text-center text-gray-400 py-10">No guests found.</div>
          ) : (
            guests.map((guest) => (
              <div
                key={guest.id}
                className="flex justify-between items-center py-3 border-b border-gray-800 last:border-none"
              >
                <div className="flex items-center gap-3">
                  {guest.image ? (
                    <img
                      src={guest.image}
                      alt={guest.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-200">
                      {(guest.name || '?').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-white">{guest.name}</div>
                    <div className="text-sm text-gray-400">{guest.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {guest.total_ticket > 1 && (
                    <span className="text-sm bg-gray-700 rounded-full px-2 py-1">
                      {guest.total_ticket} Tickets
                    </span>
                  )}
                  {getStatusBadge(guest.status)}
                  {/* Crown dipake kalau role VIP; response punya "role" */}
                  {guest.role === 'VIP' && <Crown className="text-yellow-400 w-4 h-4" />}
                  <span
                    className={`text-sm font-medium ${
                      guest.is_checkin ? 'text-blue-400' : 'text-red-500'
                    }`}
                    title={guest.checkin_date || undefined}
                  >
                    {guest.is_checkin ? 'Checked-in' : 'Not checked-in'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
          <div>
            Page {page} of {pages} • Total {total}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-[#0f0f0f] border border-gray-700 disabled:opacity-40"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 rounded bg-[#0f0f0f] border border-gray-700 disabled:opacity-40"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= pages}
            >
              Next
            </button>
          </div>
        </div>

        {errorMsg && <div className="mt-3 text-red-400 text-sm">{errorMsg}</div>}
      </div>
    </div>
  );
}

export default UserScanPage;
