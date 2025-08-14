import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Menu } from 'lucide-react';
import IconWorld from '../assets/icon-world.svg';
import { 
  CircleUserRound,
  Wallet, 
  Settings, 
  LogOut } from 'lucide-react';
import Ticket from '../assets/Vector.svg';

function Header({ user, isLoggedIn, handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showUserMenu]);

  return (
    <div className="w-full fixed top-0 z-50 bg-[rgba(103,103,103,0.10)] backdrop-blur-[8.8px]">
      <div className="px-4 mx-auto h-[45px] flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-white font-['Lexend-Bold',sans-serif] text-xl font-bold tracking-tight transition-colors duration-200 hover:text-[#fff] hover:brightness-150"
        >
          kebbu
        </Link>

        {/* Desktop Menu Navigation */}
        <div className="flex items-center gap-6">
          <Link to="/my-event" className="flex items-center gap-2 cursor-pointer">
            <img src={Ticket} alt="ticket" className="w-3 h-3 hidden md:flex" />
            <span className="text-white text-responsive-medium-normal">My Events</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <img src={IconWorld} alt="world" className="w-3 h-3 hidden md:flex" />
            <span className="text-white text-responsive-medium-normal">Discover</span>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-5">
          {isLoggedIn ? (
            <>
              <Link
                to="/create-event"
                className="text-white hover:text-white text-responsive-medium-normal cursor-pointer"
              >
                Create Event
              </Link>

              <div className="relative">
                <img
                  src={(user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`)}
                  alt="Profile"
                  className="w-6 h-6 rounded-full object-cover cursor-pointer"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                />
                {showUserMenu && (
                  <div ref={userMenuRef} className="absolute right-0 mt-2 w-60 rounded-xl bg-[#181818] border border-[#232323] z-50 shadow-lg">
                    {/* Profile Info */}
                    <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                      <img
                        src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`}
                        alt="Profile"
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-white text-base font-['Satoshi-Medium'] leading-tight">{user.name}</div>
                        <div className="text-xs font-['Satoshi-Medium'] text-[#a2a2a2]">{user.email}</div>
                      </div>
                    </div>
                    <hr className="border-t border-[#303030] mx-4 my-2" />
                    {/* Menu Items */}
                    <div className="flex flex-col gap-1 pb-3">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-1 text-left text-sm font-['Satoshi-Medium'] text-[#a2a2a2] bg-transparent hover:bg-[#232323] transition rounded-md"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <CircleUserRound className="w-5 h-5 text-[#a2a2a2]" />
                        My Profile
                      </Link>
                      <Link
                        to="/wallet"
                        className="flex items-center gap-3 px-4 py-1 text-left text-sm font-['Satoshi-Medium'] text-[#a2a2a2] bg-transparent hover:bg-[#232323] transition rounded-md"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Wallet className="w-5 h-5 text-[#a2a2a2]" />
                        Wallet
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-1 text-left text-sm font-['Satoshi-Medium'] text-[#a2a2a2] bg-transparent hover:bg-[#232323] transition rounded-md"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-5 h-5 text-[#a2a2a2]" />
                        Settings
                      </Link>
                      <button
                        className="flex items-center gap-3 px-4 py-1 text-left text-sm font-['Satoshi-Medium'] text-[#f94d4d] bg-transparent hover:bg-[#232323] hover:text-red-300 transition rounded-md"
                        onClick={() => {
                          handleLogout();
                          setShowUserMenu(false);
                        }}
                      >
                        <LogOut className="w-5 h-5 text-[#f94d4d]" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-[20px] px-4 py-1 flex items-center justify-center text-white text-sm font-['Satoshi-Medium',sans-serif]"
              style={{
                background: "linear-gradient(90deg, rgba(68,160,141,1) 0%, rgba(0,89,79,1) 100%)"
              }}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;