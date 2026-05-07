import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';

const urlBe = import.meta.env.VITE_URL_BE;

const TABS = [
  { key: 'all', label: 'All Events' },
  { key: 'hosted', label: 'Hosting' },
  { key: 'attended', label: 'Attending' },
];

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    axios
      .get(`${urlBe}/user/profile`, {
        headers: {
          'x-jdticket': localStorage.getItem('token') || '',
        },
      })
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
    document.title = 'Profile - Kebbu';
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="flex space-x-4 p-8">
          <div className="w-24 h-24 rounded-full bg-gray-700"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
        <hr className="border-gray-600 mb-6" />
        <div className="px-8">
          <div className="h-5 bg-gray-700 w-28 rounded mb-4"></div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-700">
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

  // Event tab logic
  let eventsToShow = [];
  if (activeTab === 'all') {
    eventsToShow = user.all_events || [];
  } else if (activeTab === 'hosted') {
    eventsToShow = user.hosted_events || [];
  } else if (activeTab === 'attended') {
    eventsToShow = user.attended_events || [];
  }

  // Format username display
  const usernameDisplay = user.username
    ? `@${user.username}`
    : user.name
      ? `@${user.name.toLowerCase().replace(/\s/g, '')}`
      : '';

  // Fallback bio
  const bio = user.bio || 'Let’s goo';

  // Fallback image
  const avatar =
    user.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;

  return (
    <div>
      <div className="flex flex-col mb-8">
        <h1 className="text-responsive-title">My Profile</h1>
        <p className="text-gray-400 text-responsive-medium mt-2">
          View all your profile details here.
        </p>
      </div>
      {/* Profile Header */}
      <div className="flex flex-row gap-[43px] items-center">
        {/* Avatar */}
        <img
          className="rounded-full shrink-0 w-[120px] h-[120px] object-cover"
          src={avatar}
          alt={user.name}
          style={{ aspectRatio: 1 }}
        />

        {/* Main profile info (kanan avatar) */}
        <div className="flex flex-row items-end justify-between w-[820px]">
          {/* Kiri: nama, username, bio, joined */}
          <div className="flex flex-col gap-2.5 items-start w-[297px]">
            <div className="text-white text-left font-['Satoshi-Bold',_sans-serif] text-[32px] leading-6 font-bold w-full">
              {user.name}
            </div>
            <div
              className="text-left font-['Satoshi-Medium',_sans-serif] text-xl leading-6 font-medium w-full"
              style={{
                background:
                  'linear-gradient(270deg, rgba(19,231,189,1) 0%, rgba(6,232,232,1) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {usernameDisplay}
            </div>
            <div className="text-second-gray text-left font-['Satoshi-Regular',_sans-serif] text-xl leading-6 font-normal w-full">
              {bio}
            </div>
            <div className="flex flex-row gap-2.5 items-start w-full">
              <img
                className="shrink-0 w-[22px] h-[22px]"
                style={{ aspectRatio: 1 }}
                src="/icon-calendar-alt0.svg"
                alt="calendar"
              />
              <div className="text-second-gray text-left font-['Satoshi-Regular',_sans-serif] text-xl leading-6 font-normal">
                Joined {format(new Date(user.create_date), 'MMMM yyyy')}
              </div>
            </div>
          </div>

          {/* Kanan: stats & social media */}
          <div className="flex flex-col gap-3 items-end w-[243px]">
            <div className="flex flex-row gap-10 items-center w-full justify-end">
              <div className="text-left font-['Satoshi-Regular',_sans-serif] text-xl leading-6 font-normal">
                <span>
                  <span className="font-bold">{user.followers ?? 0}</span>
                  <span className="text-second-gray"> Followers</span>
                </span>
              </div>
            </div>
            <div className="flex flex-row gap-10 items-start w-full">
              <div className="text-left font-['Satoshi-Regular',_sans-serif] text-xl leading-6 font-normal">
                <span>
                  <span className="font-bold">{user.total_event_hosted ?? 0}</span>
                  <span className="text-second-gray"> Hosted</span>
                </span>
              </div>
              <div className="text-left font-['Satoshi-Regular',_sans-serif] text-xl leading-6 font-normal">
                <span>
                  <span className="font-bold">{user.total_event_attended ?? 0}</span>
                  <span className="text-second-gray"> Attended</span>
                </span>
              </div>
            </div>
            <div className="flex flex-row gap-[17px] items-center">
              {user.instagram && (
                <a
                  href={`https://www.instagram.com/${user.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img className="shrink-0 w-6 h-6" src="/icon-instagram0.svg" alt="Instagram" />
                </a>
              )}
              {user.x && (
                <a
                  href={`https://www.instagram.com/${user.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img className="shrink-0 w-6 h-6" src="/icon-x0.svg" alt="X" />
                </a>
              )}
              {user.tiktok && (
                <a href={user.tiktok} target="_blank" rel="noopener noreferrer">
                  <img className="shrink-0 w-6 h-6" src="/ic-baseline-tiktok0.svg" alt="Tiktok" />
                </a>
              )}
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener noreferrer">
                  <img className="shrink-0 w-6 h-6" src="/globe-alt-outline0.svg" alt="Website" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-700 mb-2" />

      {/* Events Section */}
      <div className="px-2">
        <h2 className="text-2xl font-bold mb-2">Events</h2>
        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-700 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`py-2 px-1 text-lg font-semibold relative ${activeTab === tab.key ? 'text-white' : 'text-gray-400'
                }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute left-0 -bottom-[2px] w-full h-0.5 bg-primary rounded"></span>
              )}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {eventsToShow && eventsToShow.length > 0 ? (
            eventsToShow.map((event) => (
              <Link
                key={event.id}
                to={
                  event.type === 'Attending'
                    ? `/${event.url}`
                    : `/dashboard/${event.public_id}`
                }
                state={{ name: event.name }}
                className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-800 transition group border border-gray-800"
              >
                <img
                  src={event.image || 'https://wallpapercave.com/wp/wp9297718.jpg'}
                  alt={event.name}
                  className="w-20 h-20 rounded-md object-cover"
                />
                <div className="flex-1">
                  {/* Badge Hosting/Attending */}
                  <span
                    className={`inline-block px-3 py-1 mb-1 text-xs font-semibold rounded-lg
                    ${event.type === 'Attending' ? 'bg-green-900 text-green-200' : 'bg-blue-900 text-blue-200'}`}
                  >
                    {event.type}
                  </span>
                  <div className="text-xl font-bold group-hover:text-primary">{event.name}</div>
                  <div className="flex items-center text-gray-400 gap-2 text-sm mt-1">
                    <img src={avatar} className="w-4 h-4 rounded-full" alt="avatar" />
                    by {user.name}
                  </div>
                  <div className="text-sm text-gray-400 font-medium mt-1">
                    {format(new Date(event.start_date.replace(' ', 'T')), 'EEE, d MMM yyyy, HH.mm')}{' '}
                    WIB &bull; {event.location}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-gray-400 italic py-6">Belum ada event.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
