import Header from "./Header";
import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from 'axios';

function Layout() {
  const [user, setUser] = useState(() => {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  });
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (token) {
      setIsLoggedIn(true);
      setUser(userData);
      checkTokenValidity(); // <- panggil cek token
    }
  }, []);

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

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.get('https://jdticket-production.up.railway.app/user/logout', {
        headers: {
          'x-jdticket': token
        }
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsLoggedIn(false);
      navigate('/'); // redirect ke home atau login
    } catch (err) {
      console.error('Error:', err);
    }
    
  };

  return (
    <>
      <div
        className="relative overflow-hidden pt-24"
        style={{
          background: "var(--backgroundd, linear-gradient(151.79deg, rgba(0, 28, 25, 1) 0%, rgba(9, 9, 9, 1) 50%))",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
          color: "#fff"
        }}
      >
        <Header user={user} isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        <main className="px-6">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default Layout;