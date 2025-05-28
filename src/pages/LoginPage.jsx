import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GoogleLoginCustom from './GoogleLoginCustom';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

const urlBe = import.meta.env.VITE_URL_CLAW;

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await axios.post(`${urlBe}/user/login`, {
        email,
        password,
      });

      if (res.data.code === "1") {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data));
        navigate("/"); // redirect ke home setelah login
      } else {
        setLoginError("Login gagal: " + res.data.message);
      }
    } catch (err) {
      setLoginError("Login error. Coba lagi.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId="785284739839-i6i68i0ft8ep1bqf9ogdrkg9i38rutcs.apps.googleusercontent.com">
    <div className="flex justify-center items-center h-screen bg-[#1a1c29] text-white">
      <div className="bg-[#2a2d3e] p-6 rounded-lg w-[400px] shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
        {loginError && <p className="text-red-500 text-sm mb-2">{loginError}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm">Email</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded bg-[#1f1f2e] text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded bg-[#1f1f2e] text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 disabled:opacity-50"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
        <GoogleLoginCustom />
      </div>
    </div>
    </GoogleOAuthProvider>
  );
}

export default LoginPage;