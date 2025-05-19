import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [user, setUser] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (token) {
      setIsLoggedIn(true);
      setUser(userData);
      checkTokenValidity(); // <- panggil cek token
    }

    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('https://jdticket-production.up.railway.app/events/get-all');
      setEvents(response.data.data); // <- sesuaikan dengan format response API kamu
    } catch (err) {
      console.error(err);
      setError('Gagal memuat event.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const response = await axios.post('https://jdticket-production.up.railway.app/user/login', {
        email,
        password
      });

      if (response.data.code === '1') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        setUser(response.data.data);
        setIsLoggedIn(true);
        setShowLoginModal(false);
        setEmail('');
        setPassword('');
        setLoginError('');
      } else {
        setLoginError('Login gagal: ' + response.data.message);
      }
    } catch (err) {
      if (err.response) {
        // Server responded with status ≠ 2xx
        setLoginError(`(${error.response.status}) ${error.response.data?.message || 'Server Error'}`);
      } else if (err.request) {
        // Request sent but no response
        setLoginError('No response from server');
      } else {
        // Something else went wrong
        setLoginError('Unexpected error');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  const checkTokenValidity = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    try {
      await axios.get('https://jdticket-production.up.railway.app/user/check-token', {
        headers: {
          'x-jdticket': token
        }
      });
      // token valid
    } catch (err) {
      console.error('Token invalid or expired:', err);
      handleLogout();
      navigate('/'); // redirect ke home atau login
    }
  };
  

  return (
    <div className="bg-[#060810] w-full min-h-screen relative px-8 text-white">
        {/* Header */}
        <div className="flex flex-col mb-8 p-8">
          <div className="flex justify-end">
            {/* Create Event & Profile Picture */}
            <div className="flex items-center gap-6">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => navigate('/create-event')}
                    className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200"
                  >
                    Create Event
                  </button>
                  <div className="relative">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full cursor-pointer border-2 border-white"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  />
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#1f1f2e] rounded-xl shadow-lg border border-gray-700 z-50">
                      {/* Header */}
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`}
                          alt="Profile"
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="text-white font-medium">{user.name || 'User'}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>

                      {/* Menu */}
                      <div className="flex flex-col py-2">
                        <button
                          className="px-4 py-2 text-left text-sm text-white hover:bg-white/20 transition rounded-md"
                          style={{ backgroundColor: 'transparent' }}
                          onClick={() => {
                            navigate("/profile");
                          }}
                        >
                          View Profile
                        </button>
                        <button
                          className="px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition rounded-md"
                          style={{ backgroundColor: 'transparent' }}
                          onClick={() => {
                            setShowUserMenu(false);
                            // Tambahkan aksi
                          }}
                        >
                          Settings
                        </button>
                        <button
                          className="px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition rounded-md"
                          style={{ backgroundColor: 'transparent' }}
                          onClick={() => {
                            handleLogout();
                            setShowUserMenu(false);
                          }}
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200"
                >
                  Login
                </button>
              )}
            </div>

          </div>
            <div>
              <h1 className="text-3xl font-bold">Browse Event</h1>
              <p className="text-gray-400 text-lg mt-2">
                Explore popular events near you, browse by category, or check out some of the great community calendars.
              </p>
            </div>
        </div>
        
        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100">
            <div className="bg-[#1a1c29] p-6 rounded-lg w-[400px] shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
              {loginError && <p className="text-red-500 text-sm mb-2">{loginError}</p>}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm">Email</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded bg-[#2a2d3e] text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm">Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 rounded bg-[#2a2d3e] text-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 disabled:opacity-50"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* Popular Events */}
        <div className="flex justify-between items-center mb-4 px-8">
        <div>
            <h2 className="text-2xl font-bold">Popular Events</h2>
            <p className="text-gray-400 text-lg">Jakarta</p>
        </div>
        <button className="text-gray-400 hover:text-white">View All</button>
        </div>

        {/* Event Grid */}
        <div className="grid grid-cols-2 gap-8 mt-6 w-full px-8">
        {loading && <p>Loading events...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {events.map(event => (
            <div 
              key={event.id}
              onClick={() => navigate(`/event/${event.id}`)} 
              className="flex items-start gap-4 bg-[#1a1c29] p-4 rounded-lg hover:bg-gray-700"
            >
              <img
                src={event.image || 'https://source.unsplash.com/random/100x100?concert'}
                alt={event.name}
                className="w-16 h-16 rounded-md object-cover"
              />
              <div>
                <h3 className="font-semibold text-white text-lg">{event.name}</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {format(new Date(event.start_date), 'EEE, d MMM yyyy')} {format(new Date(event.start_date), 'HH:mm')} WIB
                </p>
                <p className="text-gray-400 text-sm">{event.location}</p>
              </div>
            </div>
        ))}
            
        </div>
        {/* Garis Bawah */}
        <div className="border-t border-gray-700 mt-8 m-8"></div>
    </div>
  );
}

export default Dashboard;
