import { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GoogleLoginCustom from './GoogleLoginCustom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { 
  LogIn,
  ChevronLeft,
  Clipboard,
  Upload
} from "lucide-react";

const urlBe = import.meta.env.VITE_URL_BE;

function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [noHp, setNoHp] = useState('');
  const [loginError, setLoginError] = useState('');
  const [codeOtp, setCodeOtp] = useState(new Array(6).fill(""));
  const [resendTimer, setResendTimer] = useState(60);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [errorName, setErrorName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (step === 2 && resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, resendTimer]);

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setIsLoggingIn(true);
  //   try {
  //     const res = await axios.post(`${urlBe}/user/login`, {
  //       email,
  //       password,
  //     });

  //     if (res.data.code === "1") {
  //       localStorage.setItem("token", res.data.token);
  //       localStorage.setItem("user", JSON.stringify(res.data.data));
  //       navigate("/"); // redirect ke home setelah login
  //     } else {
  //       setLoginError("Login gagal: " + res.data.message);
  //     }
  //   } catch (err) {
  //     setLoginError("Login error. Coba lagi.");
  //   } finally {
  //     setIsLoggingIn(false);
  //   }
  // };

  const handleContinueEmail = async () => {
    if (!email.trim()) {
      setLoginError('Email or Phone is required')
      return;
    }
    setLoginError('')
    setIsLoggingIn(true)
    // simulate sending email
    try {
      const res = await axios.post(`${urlBe}/user/login-v2`, {
        email,
      });
      if (res.data.code === "1") {
        setStep(2);
      } else {
        setLoginError("Login gagal: " + res.data.message);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setLoginError("Login gagal: " + err.response.data.message);
      } else if (err.message) {
        setLoginError("Login gagal: " + err.message);
      } else {
        setLoginError("Login gagal: Terjadi kesalahan tak dikenal.");
      }
    } finally {
      setIsLoggingIn(false);
    }
    // setStep(2);
  };

  if (loginError) {
    console.log(loginError)
    alert(loginError)
    setLoginError('')
    return;
  }
  
  const handleSubmitCode = async (finalCode) => {
    try {
      if (!finalCode || finalCode.length !== 6) {
        alert("OTP harus 6 digit");
        return;
      }

      const res = await axios.post(`${urlBe}/user/verif-login-v2`, {
        email,
        code: finalCode,
      });

      if (res.data.code === "1") {
        setName(res.data.data.name);
        setNoHp(res.data.data.no_hp);

        if (res.data.data.name) {     // jika sudah ada nama langsung ke dashboard
          goToHome(res);
          return;
        }
        
        if (!res.data.data.no_hp ) {   // cek no hp
          setTimeout(() => setStep(3), 200);
        } else {
          setTimeout(() => setStep(4), 200);
        } 

      } else {
        setLoginError("Login gagal: " + res.data.message);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setLoginError("Login gagal: " + err.response.data.message);
      } else {
        setLoginError("Login gagal: " + err.message || "Terjadi kesalahan tak dikenal.");
      }
    }
  };


  const handleChangeCode = (e, idx) => {
    const value = e.target.value;

    const newCode = [...codeOtp];

    if (value === "") {
      newCode[idx] = "";
      setCodeOtp(newCode);
      if (idx > 0) document.getElementById(`code-${idx - 1}`)?.focus();
      return;
    }

    if (!/^\d$/.test(value)) return;

    newCode[idx] = value;
    setCodeOtp(newCode);

    if (idx < 5) document.getElementById(`code-${idx + 1}`)?.focus();

    // ✅ Gunakan nilai newCode langsung
    const joinedCode = newCode.join("");
    if (joinedCode.length === 6 && newCode.every(n => n !== "")) {
      console.log("✅ newCode:", joinedCode);
      handleSubmitCode(joinedCode); // ⬅️ langsung kirim ke parameter
    }
  };


  const handleSubmitNoHp = () => {
    setStep(4);
  };

  const handleSkipNoHp = () => {
    setNoHp('')
    setStep(4);
  };

  const handleLastStep = async () => {
    if (!name.trim()) {
      setErrorName('Name is required');
      return;
    }
    try {
      let imgUrl = ""; // default kosong

      if (avatarFile) {
        const formData = new FormData();
        formData.append("image", avatarFile);

        const saveImgRes = await axios.post(`${urlBe}/image/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        imgUrl = saveImgRes.data.img_url; 
      }

      const res = await axios.post(`${urlBe}/user/update`, {
        name,
        email,
        no_hp: noHp,
        image: imgUrl,
      });

      if (res.data.code === "1") {
        goToHome(res);
      } else {
        setLoginError("Login gagal: " + res.data.message);
      }

    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setLoginError("Login gagal: " + err.response.data.message);
      } else if (err.message) {
        setLoginError("Login gagal: " + err.message);
      } else {
        setLoginError("Login gagal: Terjadi kesalahan tak dikenal.");
      }
    }
    
  }

  const goToHome = (res) => {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.data));
    setStep(5);
    setTimeout(() => {
      navigate('/')
    }, 1500);
  }

  return (
    <GoogleOAuthProvider clientId="785284739839-i6i68i0ft8ep1bqf9ogdrkg9i38rutcs.apps.googleusercontent.com">
    <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute ">
      {step === 1 && (
        <div 
          className="p-6 rounded-xl w-[360px] shadow-xl border-solid border-[#212121] border"
          style={{
            background: "var(--backgroundd, linear-gradient(135.91deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%))",
            color: "#fff"
          }}
        >
          <div className="flex mb-4">
            <div
              onClick={() => navigate("/")} 
              className="w-12 h-12 flex items-center justify-center rounded-full cursor-pointer"
              style={{
                background: "var(--backgroundd, linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%))",
                color: "#fff"
              }}
            >
              <LogIn className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-white text-xl font-['Satoshi-Bold'] mb-2">Welcome to Kebbu</div>
          <p className="text-gray-400 text-sm font-['Satoshi-Regular',_sans-serif] mb-4">Please sign in or sign up below.</p>
          <div className="text-gray-300 text-sm font-['Satoshi-Medium',_sans-serif] mb-2">Email or Phone</div>
          {/* {loginError && <div className="text-red-500 text-sm mb-2">{loginError}</div>} */}
          <input
            type="text"
            className="w-full px-3 py-2 rounded bg-black text-white font-['Satoshi-Medium',_sans-serif] border border-gray-700 placeholder:text-gray-500"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleContinueEmail();
              }
            }}
          />
          <button
            className="w-full bg-white text-black font-['Satoshi-Bold'] mt-4 py-2 rounded disabled:opacity-50"
            disabled={isLoggingIn}
            onClick={handleContinueEmail}
          >
            {isLoggingIn ? "Continue..." : "Continue"}
          </button>
          <GoogleLoginCustom />
        </div>
      )}

      {step === 2 && (
        <div 
          className="p-6 rounded-xl w-[360px] shadow-xl border-solid border-[#212121] border"
          style={{
            background: "var(--backgroundd, linear-gradient(135.91deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%))",
            color: "#fff"
          }}
        >
          <div className="mb-4 flex justify-between items-start">
            <div
              onClick={() => {
                setStep(1);
                setCodeOtp(new Array(6).fill(""));
                setResendTimer(60);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#2a2a2a] transition"
              style={{
                background: "var(--backgroundd, linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%))",
                color: "#fff"
              }}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-white text-xl font-['Satoshi-Bold'] mb-2">Enter Code</div>
          <p className="text-gray-400 text-sm font-['Satoshi-Regular',_sans-serif] mb-4">
            Please enter the 6 digit code we send to 
            <br />
            <span className="text-white font-['Satoshi-Regular',_sans-serif]">{email}</span>
          </p>
          <div 
            className="flex justify-between gap-2 mb-4"
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "v") {
                navigator.clipboard.readText().then((clipText) => {
                  const numbers = clipText.replace(/\D/g, "").slice(0, 6).split("");
                  if (numbers.length === 6) {
                    setCodeOtp(numbers);
                    handleSubmitCode(numbers.join(""));
                  }
                });
              }
            }}
            tabIndex={0}
          >
            {codeOtp.map((val, idx) => (
              <input
                key={idx}
                id={`code-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={(e) => handleChangeCode(e, idx)}
                onPaste={(e) => {
                  const paste = e.clipboardData.getData("text");
                  const numbers = paste.replace(/\D/g, "").slice(0, 6).split("");
                  if (numbers.length === 6) {
                    setCodeOtp(numbers);
                    handleSubmitCode(numbers.join(""));
                    e.preventDefault();
                  }
                }}
                className="w-10 h-10 rounded-md bg-black border border-gray-700 text-white text-center text-lg focus:outline-white"
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 mb-2">
            <button
              onClick={() => {
                navigator.clipboard.readText().then((clipText) => {
                  const numbers = clipText.replace(/\D/g, "").slice(0, 6).split("");
                  if (numbers.length === 6) {
                    setCodeOtp(numbers);
                    handleSubmitCode(numbers.join(""));
                  }
                });
              }}
              className="text-sm text-[#A2A2A2] font-['Satoshi-Bold'] bg-[#303030] rounded flex items-center gap-2 px-3 py-1.5"
            >
              <Clipboard className="w-3 h-3"/>
              Paste Code
            </button>
            <p className="text-gray-500 text-sm">
              {resendTimer > 0
                ? `Resend code in ${resendTimer}s`
                : <span className="text-blue-400 cursor-pointer hover:underline" onClick={handleContinueEmail}>Resend Code</span>}
            </p>
          </div>
        </div>
      )}

      {step === 3 && (
        <div 
          className="p-6 rounded-xl w-[360px] shadow-xl border-solid border-[#212121] border"
          style={{
            background: "var(--backgroundd, linear-gradient(135.91deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%))",
            color: "#fff"
          }}
        >
          <div className="text-white text-xl font-['Satoshi-Bold'] mb-2">Link Phone Number</div>
          <p className="text-[#A2A2A2] text-sm font-['Satoshi-Regular',_sans-serif] mb-4">Link your phone number to receive reminders via SMS and find your friends.</p>
          <p className="text-white text-sm font-['Satoshi-Medium',_sans-serif] mb-2">Phone Number</p>
          <input
            type="text"
            placeholder="+62 812 345 678"
            value={noHp}
            onChange={(e) => setNoHp(e.target.value)}
            className="w-full px-3 py-2 rounded bg-black text-white border border-gray-700 placeholder:text-gray-500"
          />
          <button
            className="w-full bg-white text-black font-['Satoshi-Bold'] mt-4 py-2 rounded"
            onClick={handleSubmitNoHp}
          >
            Continue
          </button>
          <div 
            className="text-[#A2A2A2] font-['Satoshi-Bold'] mt-4 py-2 flex items-center justify-center cursor-pointer"
            role="button"
            onClick={handleSkipNoHp}
          >Skip</div>
        </div>
      )}

      {step === 4 && (
        <div 
          className="p-6 rounded-xl w-[360px] shadow-xl border-solid border-[#212121] border"
          style={{
            background: "var(--backgroundd, linear-gradient(135.91deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%))",
            color: "#fff"
          }}
        >
          <div className="text-white text-xl font-['Satoshi-Bold'] mb-2">Complete Your Profile</div>
          <p className="text-[#A2A2A2] text-sm font-['Satoshi-Regular',_sans-serif] mb-4">Enter your name and choose an avatar so your friends can recognize you.</p>
          
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar Upload */}
            <label htmlFor="avatar-upload" className="relative w-16 h-16 cursor-pointer">
              <img
                src={avatarPreview || "https://ui-avatars.com/api/?name=User&background=random"}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border border-gray-700"
              />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#1e1e1e] border border-gray-600 rounded-full flex items-center justify-center hover:bg-[#333] transition">
                <Upload className="w-3 h-3"/>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setAvatarFile(file);
                      setAvatarPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
              </div>
            </label>

            {/* Name Input */}
            <div className="flex-1">
              <label className="block text-sm text-white font-['Satoshi-Medium',_sans-serif] mb-1">Name</label>
              {errorName && <div className="text-red-500 text-xs mb-1">{errorName}</div>}
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorName) setErrorName('');
                }}
                className={`w-full px-3 py-2 rounded bg-black text-white border ${
                  errorName ? 'border-red-500' : 'border-gray-700'
                } placeholder:text-gray-500`}
              />
            </div>
          </div>
          <button
            className="w-full bg-white text-black font-['Satoshi-Bold'] py-2 rounded"
            onClick={handleLastStep}
          >
            Let’s Go
          </button>
        </div>
      )}

      {step === 5 && (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-white text-lg font-['Satoshi-Bold']">Welcome to Kebbu!</p>
        </div>
      )}
    </div>
    </GoogleOAuthProvider>
  );
}

export default LoginPage;