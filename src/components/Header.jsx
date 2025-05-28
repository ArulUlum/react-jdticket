import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import IconWorld from '../assets/icon-world.svg';
import Ticket from '../assets/Vector.svg';

function Header({ user, isLoggedIn, handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Hide Header on specific routes
  const hiddenRoutes = ["/login"];
  if (hiddenRoutes.includes(location.pathname)) return null;

  return (
    <div className="w-full fixed top-0 z-50 bg-[rgba(103,103,103,0.10)] backdrop-blur-[8.8px]">
      <div className="px-4 mx-auto h-[53px] flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/')} 
          className="text-white font-['Lexend-Bold',sans-serif] text-2xl font-bold tracking-tight"
        >
          kebbu
        </div>

        {/* Menu Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src={Ticket} alt="ticket" className="w-4 h-4" />
            <span className="text-white font-['Satoshi-Medium',sans-serif] text-sm">My Events</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <img src={IconWorld} alt="world" className="w-4 h-4" />
            <span className="text-white font-['Satoshi-Medium',sans-serif] text-sm">Discover</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-5">
          {isLoggedIn ? (
            <>
              <div
                onClick={() => navigate('/create-event')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/create-event')}
                className="text-white font-['Satoshi-Medium',sans-serif] text-sm cursor-pointer"
              >
                Create Event
              </div>

              <div className="relative">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`}
                  alt="Profile"
                  className="w-6 h-6 rounded-full object-cover cursor-pointer"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                />
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0d1a17] border border-[#2f645e] z-50 shadow-lg">
                    {/* Profile Info */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2f645e]">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`}
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="text-white font-semibold">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="flex flex-col py-2">
                      <button
                        className="px-4 py-2 text-left text-sm text-white bg-transparent hover:bg-[#2f645e]/70 transition rounded-md"
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/profile");
                        }}
                      >
                        View Profile
                      </button>
                      <button
                        className="px-4 py-2 text-left text-sm text-white bg-transparent hover:bg-[#2f645e]/70 transition rounded-md"
                      >
                        Settings
                      </button>
                      <button
                        className="px-4 py-2 text-left text-sm text-red-400 bg-transparent hover:bg-[#2f645e]/30 hover:text-red-300 transition rounded-md"
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
              className="rounded-[20px] px-4 py-1 flex items-center justify-center text-white text-lg font-['Satoshi-Medium',sans-serif]"
              style={{
                background: "linear-gradient(90deg, rgba(68,160,141,1) 0%, rgba(0,89,79,1) 100%)"
              }}
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;