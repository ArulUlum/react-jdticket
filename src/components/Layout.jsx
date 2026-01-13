import Header from "./Header";
import Footer from "./Footer";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from 'axios';
import SEO from "../components/SEO";

const urlBe = import.meta.env.VITE_URL_BE;

function Layout() {
  const [user, setUser] = useState(() => {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  });
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const location = useLocation();
  const withoutMaxWidth = location.pathname === "/about";

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (token) {
      setIsLoggedIn(true);
      setUser(userData);
      checkTokenValidity(); // <- panggil cek token
    }
    // Listen for profile update event
    const handleProfileUpdate = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(updatedUser);
    };
    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, []);

  const checkTokenValidity = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    try {
      await axios.get(`${urlBe}/user/check-token`, {
        headers: {
          'x-jdticket': token
        }
      });
      // token valid
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unknown error";

      console.error("Token invalid or request failed:", msg, err);
      refreshToken();
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.get(`${urlBe}/user/logout`, {
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

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${urlBe}/user/refresh-token`, {
        headers: {
          'x-jdticket': token
        }
      });
      const newToken = response.data?.token;
      if (newToken) {
        localStorage.setItem('token', newToken);
      }
    } catch (err) {
      console.error('Error refreshing token:', err);
      handleLogout();
    }
  };

  return (
    <>
      <SEO
        title="Kebbu — Event & Ticketing Platform"
        description="Kebbu membantu bikin event, jual tiket, dan bangun komunitas dengan mudah."
        canonical="https://kebbu.id"
        robots="index,follow"
        openGraph={{ image: "https://res.cloudinary.com/dtbaug0gp/image/upload/v1755609573/kebbu_MINI_LOGO_mj1pf9.png" }}
      />
      <div
        className="relative overflow-hidden pt-20"
        style={{
          background: "var(--backgroundd, linear-gradient(151.79deg, rgba(0, 28, 25, 1) 0%, rgba(9, 9, 9, 1) 50%))",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
          color: "#fff"
        }}
      >
        <Header user={user} isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        <main className={`min-h-screen ${withoutMaxWidth ? "w-full px-0" : "max-w-3xl px-6 mx-auto"}`}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default Layout;