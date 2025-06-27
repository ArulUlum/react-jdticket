import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const urlBe = import.meta.env.VITE_URL_BE;

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${urlBe}/user/get-profile`, {
        headers: {
          "x-jdticket": localStorage.getItem("token") || "",
        },
      })
      .then((res) => {
        const data = res.data.data;
        setUser(data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
      {/* Profile Header */}
      <div className="flex space-x-4 p-8">
        <div className="w-24 h-24 rounded-full bg-gray-700"></div>
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>

      <hr className="border-gray-600 mb-6" />

      {/* Hosting Section */}
      <div className="px-8">
        <div className="h-5 bg-gray-700 w-28 rounded mb-4"></div>

        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-700"
          >
            <div className="w-16 h-16 rounded-md bg-gray-700"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 w-2/3 rounded"></div>
              <div className="h-3 bg-gray-600 w-1/3 rounded"></div>
              <div className="h-3 bg-gray-700 w-1/2 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-white mt-20">
        Gagal memuat data pengguna. Silakan login ulang.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile Header */}
      <div className="flex space-x-4 p-8">
        <img
          src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
          alt={user.name}
          className="w-24 h-24 rounded-full"
        />
        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <div className="text-gray-400 mt-1">📅 Joined May 2025</div>
          <div className="mt-1">
            <span className="font-semibold">1</span> Hosted{" "}
            <span className="font-semibold">1</span> Attended
          </div>
        </div>
      </div>

      <hr className="border-gray-600 mb-6" />

      {/* Hosting Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Hosting</h3>

        {user.list_event && user.list_event.length > 0 ? (
          user.list_event.map((event) => (
            <div 
              key={event.id}
              onClick={() => navigate(`/event-detail/${event.id}`)} 
              className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-700"
            >
              <img
                src={event.image || 'https://wallpapercave.com/wp/wp9297718.jpg'}
                alt={event.name}
                className="w-16 h-16 rounded-md object-cover"
              />
              <div>
                <div className="text-md font-medium">{event.name}</div>
                <div className="text-sm text-gray-400 flex items-center gap-1">
                  <img
                    src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                    className="w-4 h-4 rounded-full"
                    alt="avatar"
                  />
                  by {user.name}
                </div>
                <div className="text-sm mt-1 text-white-400 font-semibold">
                  {format(new Date(event.start_date), "EEE, d MMM yyyy")} ·{" "}
                  {event.location}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-400 italic">
            Kamu belum membuat event apa pun.
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;