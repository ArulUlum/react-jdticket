import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

function Header({ user, isLoggedIn, handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Hide Header on specific routes
  const hiddenRoutes = ["/login"];
  if (hiddenRoutes.includes(location.pathname)) return null;

  console.log("header" + isLoggedIn)

  return (
    <div className="flex flex-col mb-8 pt-8 px-8">
      <div className="flex justify-end">
        <div className="flex items-center gap-6">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/create-event")}
                className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Create Event
              </button>
              <div className="relative">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name || "User"
                  )}&background=random`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full cursor-pointer border-2 border-white"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                />
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#1f1f2e] rounded-xl shadow-lg border border-gray-700 z-50">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name || "User"
                        )}&background=random`}
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="text-white font-medium">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex flex-col py-2">
                      <button
                        className="px-4 py-2 text-left text-sm text-white hover:bg-white/20 transition rounded-md"
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/profile");
                        }}
                      >
                        View Profile
                      </button>
                      <button
                        className="px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition rounded-md"
                      >
                        Settings
                      </button>
                      <button
                        className="px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition rounded-md"
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
              onClick={() => navigate("/login")}
              className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;