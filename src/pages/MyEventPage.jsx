import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const urlBe = import.meta.env.VITE_URL_BE;

function fmtDate(d) {
  const date = new Date(d);
  if (isNaN(date)) return null;
  const day = new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("en-GB", { month: "long" }).format(date);
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(date);
  return { key: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`, day, month, weekday };
}
function fmtTime(d) {
  const date = new Date(d);
  if (isNaN(date)) return null;
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}.${mm} WIB`;
}
function groupByDay(list) {
  const map = new Map();
  list.forEach(e => {
    const f = fmtDate(e.start_date) || { key: e.start_date, day: e.start_date, month: "", weekday: "" };
    if (!map.has(f.key)) map.set(f.key, { label: f, items: [] });
    map.get(f.key).items.push(e);
  });
  return Array.from(map.values());
}

function EventCard({ event }) {
  const time = fmtTime(event.start_date) ?? (event.start_date?.split(" ")[1] || "");
  const location = event.location_name || event.location || "";
  const guests = event.total_registered ?? event.guests ?? 0;

  return (
    <Link
      to={`/event/${event.url}`}
      className="block bg-[#151515]/90 hover:bg-[#181818] transition rounded-2xl border border-white/5 shadow-sm hover:shadow-lg"
    >
      <div className="flex items-center gap-5 p-5">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-white/60 tracking-wide">{time}</div>
          <div className="mt-1 text-[22px] leading-7 font-semibold text-white truncate">
            {event.name}
          </div>
          <div className="mt-2 flex items-center gap-3 text-sm text-white/60">
            <span className="inline-flex items-center gap-1">
              <span role="img" aria-label="loc">📍</span>{location}
            </span>
            <span className="inline-flex items-center gap-1">
              <span role="img" aria-label="guests">👥</span>{guests} guests
            </span>
          </div>
        </div>
        <img
          src={event.image || "https://wallpapercave.com/wp/wp9297718.jpg"}
          alt={event.name}
          className="w-36 h-28 rounded-xl object-cover shrink-0"
        />
      </div>
    </Link>
  );
}

function DayBlock({ day }) {
  const { day: d, month, weekday } = day.label;
  return (
    <div className="flex items-start gap-8">
      {/* Left date label */}
      <div className="min-w-[220px] text-white">
        <div className="text-3xl font-semibold leading-tight">{d} <span className="font-normal">{month}</span></div>
        <div className="mt-1 text-lg text-white/70">{weekday}</div>
      </div>

      {/* Right list of cards */}
      <div className="flex-1 flex flex-col gap-6">
        {day.items.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </div>
  );
}

export default function MyEventPage() {
  const [tab, setTab] = useState("upcoming");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${urlBe}/events/my-events`, {
          headers: { "x-jdticket": localStorage.getItem("token") || "" },
        });
        if (res.data && res.data.code === "1" && res.data.data) {
          setUpcomingEvents(res.data.data.upcoming || []);
          setPastEvents(res.data.data.past || []);
        } else {
          setError(res.data?.message || "Failed to fetch events");
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const hasUpcoming = upcomingEvents.length > 0;
  const hasPast = pastEvents.length > 0;

  const groupedUpcoming = useMemo(() => groupByDay(upcomingEvents), [upcomingEvents]);
  const groupedPast = useMemo(() => groupByDay(pastEvents), [pastEvents]);

  const groups = tab === "upcoming" ? groupedUpcoming : groupedPast;
  const hasData = tab === "upcoming" ? hasUpcoming : hasPast;

  return (
    <div className="min-h-screen pt-10">
      {/* Tabs */}
      <div className="flex gap-8 justify-center">
        <button
          className={`text-xl font-semibold pb-2 border-b-2 transition-all ${
            tab === "upcoming" ? "text-white border-[#6fffc6]" : "text-white/60 border-transparent"
          }`}
          onClick={() => setTab("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`text-xl font-semibold pb-2 border-b-2 transition-all ${
            tab === "past" ? "text-white border-[#6fffc6]" : "text-white/60 border-transparent"
          }`}
          onClick={() => setTab("past")}
        >
          Past
        </button>
      </div>

      {/* States */}
      {loading && <div className="text-white/80 text-center mt-10">Loading events...</div>}
      {error && <div className="text-red-400 text-center mt-10">{error}</div>}

      {/* Timeline + list */}
      {!loading && !error && hasData && (
        <div className="max-w-6xl mx-auto mt-10 px-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0">
              {/* vertical dashed */}
              <div className="w-px h-full border-l-2 border-dashed border-white/20 translate-x-3" />
            </div>

            <div className="flex flex-col gap-12 pl-12">
              {groups.map((g, i) => (
                <div key={g.label.key} className="relative">
                  {/* Dot per group */}
                  <div className="absolute -left-1 top-2 w-3 h-3 rounded-full bg-white/70 shadow" />
                  <DayBlock day={g} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && !hasData && (
        <div className="flex flex-col items-center justify-center mt-12">
          <div className="text-white text-2xl font-bold">
            {tab === "upcoming" ? "No Upcoming Events" : "No Past Events"}
          </div>
          <div className="text-white/60 mt-2 mb-6">Ready to create something awesome?</div>
          <Link
            to="/create-event"
            className="bg-[#181818] text-white rounded-lg px-6 py-3 font-medium border border-white/10 hover:bg-[#202020] transition"
          >
            + Create Event
          </Link>
        </div>
      )}
    </div>
  );
}
