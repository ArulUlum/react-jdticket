import { useGoogleLogin } from '@react-oauth/google';
import googleIcon from '../assets/Google.svg'
import axios from 'axios';
import { Link, useNavigate, useLocation } from "react-router-dom";

const urlBe = import.meta.env.VITE_URL_BE;

function GoogleLoginCustom() {
  const navigate = useNavigate();
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Login Success:', tokenResponse);
      // Kirim tokenResponse.access_token atau id_token ke backend
      try {
        const res = await axios.post(`${urlBe}/user/login-google`, {
            access_token: tokenResponse.access_token,
        });
        if (res.data.code === "1") {
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.data));
            navigate("/");
        } else {
            alert("Login Google gagal: " + res.data.message);
        }
      } catch (err) {
        alert('Login dengan Google gagal.' + err);
      }
    },
    onError: () => {
      alert('Login dengan Google gagal.');
    },
  });

  return (
    <div className='pt-5'>
        <button
            onClick={() => login()}
            className="flex items-center justify-center gap-3 w-full py-3 rounded-lg bg-[#303030] text-[#A2A2A2] font-['Satoshi-Bold',_sans-serif] hover:bg-[#535353] transition duration-150 shadow-sm"
            >
            <img
                src={googleIcon}
                alt="Google"
                className="w-6 h-6 ml-2"
            />
            <span className="flex-1 text-center -ml-5">Sign in with Google</span>
        </button>
    </div>
  );
}

export default GoogleLoginCustom;