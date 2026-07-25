import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useKeenSlider } from 'keen-slider/react';

const urlBe = import.meta.env.VITE_URL_BE;

const DEFAULT_EVENT_IMAGE = 'https://wallpapercave.com/wp/wp9297718.jpg';
const SKELETON_COUNT = 4;

const SLIDER_BREAKPOINTS = {
  '(max-width: 1024px)': { slides: { perView: 3, spacing: 12 } },
  '(max-width: 768px)': { slides: { perView: 2, spacing: 10 } },
  '(max-width: 480px)': { slides: { perView: 1.2, spacing: 8 } },
};

function getErrorMessage(err) {
  if (err.response) {
    return `Server error: ${err.response.status} - ${err.response.data?.message || err.message}`;
  }
  if (err.request) {
    return 'Tidak bisa terhubung ke server.';
  }
  return 'Terjadi kesalahan saat memuat data. Silakan coba lagi.';
}

// Dots dihitung ulang dari state slider agar konsisten antara `created` dan update setelah fetch.
function getDotCount(slider) {
  const perView =
    typeof slider.options.slides.perView === 'number' ? slider.options.slides.perView : 1;
  const totalSlides = slider.track?.details?.slides?.length || 0;
  return totalSlides > 0 ? Math.max(1, Math.ceil(totalSlides - perView + 1)) : 0;
}

function avatarUrlFor(user) {
  return (
    user?.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`
  );
}

function EventCardSkeleton() {
  return (
    <div className="keen-slider__slide bg-[#1a1a1a] animate-pulse p-4">
      <div className="w-full h-[140px] bg-gray-700 rounded-lg mb-3"></div>
      <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-600 rounded w-2/4 mb-2"></div>
      <div className="h-3 bg-gray-700 rounded w-5/6"></div>
    </div>
  );
}

function EventCard({ event }) {
  return (
    <Link
      to={`/${event.url}`}
      className="keen-slider__slide text-white hover:text-white bg-[#141717] border border-[#2a2a2a] rounded-2xl cursor-pointer"
    >
      <img
        src={event.image || DEFAULT_EVENT_IMAGE}
        alt={event.name}
        className="w-full p-2 aspect-square object-cover rounded-2xl"
      />

      <div className="px-2 pb-2">
        <h3 className="text-responsive-item-title">{event.name}</h3>
        <p className="text-[#a2a2a2] text-responsive-caption mt-1">
          {format(new Date(event.start_date), 'd MMM yyyy')}
        </p>
        <p className="text-responsive-item-title mt-1">
          {!event.price || Number(event.price) === 0
            ? 'Free'
            : `Rp ${Number(event.price).toLocaleString()}`}
        </p>
      </div>

      <div className="border-t border-[#303030] mx-2"></div>

      <div className="flex items-center gap-2 p-2">
        <img
          src={avatarUrlFor(event.create_by)}
          alt="ImageProfile"
          className="w-6 h-6 rounded-full"
        />
        <span className="text-responsive-medium-normal">{event.create_by?.name}</span>
      </div>
    </Link>
  );
}

function CarouselDots({ total, current, onSelect }) {
  return (
    <div className="flex justify-center gap-2 my-7">
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelect(idx)}
          className={`rounded-full p-0 appearance-none border-none outline-none ${
            current === idx ? 'bg-[#a2a2a2] w-8 h-1' : 'bg-[#303030] w-2 h-1'
          }`}
        />
      ))}
    </div>
  );
}

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalDots, setTotalDots] = useState(0);

  useEffect(() => {
    document.title = 'Events - Kebbu';

    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${urlBe}/events/get-all`);
        setEvents(response.data.data);
      } catch (err) {
        console.error('Error saat fetchEvents:', err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: false,
    slides: { origin: 'auto', perView: 4, spacing: 15 },
    breakpoints: SLIDER_BREAKPOINTS,
    created(slider) {
      setTotalDots(getDotCount(slider));
      setCurrentSlide(slider.track.details.rel);
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  useEffect(() => {
    if (!instanceRef.current) return;
    instanceRef.current.update();
    setTotalDots(getDotCount(instanceRef.current));
  }, [events, instanceRef]);

  return (
    <>
      <div className="flex flex-col mb-8">
        <h1 className="text-responsive-title">Browse Event</h1>
        <p className="text-[#a2a2a2] text-responsive-medium mt-2">
          Explore popular events near you, browse by category, or check out some of the great
          community calendars.
        </p>
      </div>

      {/* Popular Events */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-responsive-sub-title">Popular Events</h2>
          <p className="text-[#a2a2a2] text-responsive-medium-big">Jakarta</p>
        </div>
        <p className="text-[#a2a2a2] text-responsive-medium hover:text-white">View All</p>
      </div>

      {/* Event Grid */}
      <div ref={sliderRef} className="keen-slider" key={events.length}>
        {loading &&
          Array.from({ length: SKELETON_COUNT }).map((_, i) => <EventCardSkeleton key={i} />)}

        {error && <p className="text-red-500">{error}</p>}

        {!loading && events.map((event) => <EventCard key={event.id} event={event} />)}
      </div>

      <CarouselDots
        total={totalDots}
        current={currentSlide}
        onSelect={(idx) => instanceRef.current?.moveToIdx(idx)}
      />

      {/* Garis Bawah */}
      <div className="border-t border-[#303030] my-4"></div>

      <div className="flex flex-col my-8">
        <h1 className="text-responsive-title">Browse by Category</h1>
        <p className="text-[#a2a2a2] text-responsive-medium mt-2">
          Explore events based on category you choose.
        </p>
      </div>
    </>
  );
}

export default Home;
