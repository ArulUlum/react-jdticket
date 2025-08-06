import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { format } from 'date-fns';
import { useKeenSlider } from "keen-slider/react"
import logo from '../assets/logo.png'

const urlBe = import.meta.env.VITE_URL_BE;

function Dashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0)
  const [totalDots, setTotalDots] = useState(0)
  const location = useLocation();

  useEffect(() => {
    document.title = 'Events - Kebbu';
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${urlBe}/events/get-all`);
      setEvents(response.data.data); // <- sesuaikan dengan format response API kamu
    } catch (err) {
      console.error("Error saat fetchEvents:", err);
      // Tangani berdasarkan jenis error
      if (err.response) {
        // Error dari server (misal 4xx atau 5xx)
        setError(`Server error: ${err.response.status} - ${err.response.data?.message || err.message}`);
      } else if (err.request) {
        // Request dikirim tapi tidak ada respon
        setError("Tidak bisa terhubung ke server. Coba cek koneksi internetmu.");
      } else {
        // Error saat menyusun request
        setError("Terjadi kesalahan saat memuat data. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: false,
    slides: {
      origin: "auto",
      perView: 4,
      spacing: 15,
    },
    breakpoints: {
      "(max-width: 1024px)": {
        slides: {
          perView: 3,
          spacing: 12,
        },
      },
      "(max-width: 768px)": {
        slides: {
          perView: 2,
          spacing: 10,
        },
      },
      "(max-width: 480px)": {
        slides: {
          perView: 1.2,
          spacing: 8,
        },
      },
    },
    created(slider) {
      const perView = typeof slider.options.slides.perView === 'number' ? slider.options.slides.perView : 1
      const totalSlides = slider.track.details.slides.length
      const dots = Math.max(1, Math.ceil(totalSlides - perView + 1))
      setTotalDots(dots)
      setCurrentSlide(slider.track.details.rel)
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
  })

  useEffect(() => {
    if (!loading && instanceRef.current) {
      instanceRef.current.update()
    }

    const slider = instanceRef.current
    const perView = typeof slider.options.slides.perView === 'number' ? slider.options.slides.perView : 1
    const totalSlides = slider.track?.details?.slides?.length || 0

    if (totalSlides > 0) {
      const dotCount = Math.max(1, Math.ceil(totalSlides - perView + 1))
      setTotalDots(dotCount)
    }

  }, [events, loading, instanceRef.current])
  
  return (
    <div>
      <div className='flex flex-col mb-8'>
        <h1 className="text-responsive-title">Browse Event</h1>
        <p className="text-gray-400 text-responsive-medium mt-2">
          Explore popular events near you, browse by category, or check out some of the great community calendars.
        </p>
      </div>

      {/* Popular Events */}
      <div className="flex justify-between items-end mb-4">
        <div>
            <h2 className="text-responsive-sub-title">Popular Events</h2>
            <p className="text-gray-400 text-responsive-medium-big">Jakarta</p>
        </div>
        <p className="text-gray-400 text-responsive-medium hover:text-white">View All</p>
      </div>

      {/* Event Grid */}
      <div ref={sliderRef} className="keen-slider">
        {loading && [...Array(4)].map((_, i) => (
          <div
            key={i}
            className="keen-slider__slide bg-[#1a1a1a] animate-pulse p-4"
          >
            <div className="w-full h-[140px] bg-gray-700 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-2/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-5/6"></div>
          </div>
        ))}

        {error && <p className="text-red-500">{error}</p>}
        {!loading && events.map((event) => (
          <Link
            key={event.id}
            to={`/event/${event.url}`}
            className="keen-slider__slide text-white hover:text-white bg-[#141717] border border-[#2a2a2a] rounded-2xl cursor-pointer"
          >
            {/* Gambar Event */}
            <img
              src={event.image || 'https://wallpapercave.com/wp/wp9297718.jpg'}
              alt={event.name}
              className="w-full p-2 aspect-square object-cover rounded-2xl"
            />

            {/* Konten */}
            <div className="px-2 pb-2">
              <h3 className="text-responsive-item-title">{event.name}</h3>
              <p className="text-gray-400 text-responsive-caption mt-1">{format(new Date(event.start_date), 'd MMM yyyy')}</p>
              <p className="text-responsive-item-title mt-1">
                {!event.price || Number(event.price) === 0
                  ? 'Free'
                  : `Rp ${Number(event.price).toLocaleString()}`}
              </p>
            </div>

            {/* Garis Pembatas */}
            <div className="border-t border-[#303030] mx-2"></div>

            {/* Info Komunitas */}
            <div className="flex items-center gap-2 p-2">
              <img 
                src={(event.create_by.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(event?.create_by.name || "User")}&background=random`)}
                alt="ImageProfile" 
                className="w-6 h-6 rounded-full" />
              <span className="text-responsive-medium-normal">{event.create_by.name}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center gap-2 my-7">
        {Array.from({ length: totalDots }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => instanceRef.current?.moveToIdx(idx)}
            className={`rounded-full p-0 appearance-none border-none outline-none ${
              currentSlide === idx ? "bg-[#a2a2a2] w-8 h-1" : "bg-[#303030] w-2 h-1"
            }`}
            type="button"
          />
        ))}
      </div>
      
      {/* Garis Bawah */}
      <div className="border-t border-[#303030] my-4"></div>
    </div>
  );
}

export default Dashboard;
