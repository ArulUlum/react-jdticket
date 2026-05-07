import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLoginCustom from './GoogleLoginCustom';
import { LogIn, ChevronLeft, Clipboard, Upload } from 'lucide-react';

const urlBe = import.meta.env.VITE_URL_BE;
const google_client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const OTP_LEN = 6;
const RESEND_SECONDS = 60;

const normalizeEmail = (v) =>
  String(v || '')
    .trim()
    .toLowerCase();

function parseOtp(text) {
  const numbers = String(text || '')
    .replace(/\D/g, '')
    .slice(0, OTP_LEN)
    .split('');
  return numbers.length === OTP_LEN ? numbers : null;
}

function getErrMsg(err) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Terjadi kesalahan tak dikenal.'
  );
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const emailNormalized = useMemo(() => normalizeEmail(email), [email]);

  const [name, setName] = useState('');
  const [noHp, setNoHp] = useState('');

  const [codeOtp, setCodeOtp] = useState(() => new Array(OTP_LEN).fill(''));

  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [errorName, setErrorName] = useState('');
  const [loginError, setLoginError] = useState('');

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // OTP input refs (tanpa document.getElementById)
  const otpRefs = useRef([]);

  // Title
  useEffect(() => {
    document.title = 'Login - Kebbu';
  }, []);

  // Alert error (side-effect yang aman)
  useEffect(() => {
    if (!loginError) return;
    alert(loginError);
    setLoginError('');
  }, [loginError]);

  // Cleanup objectURL untuk avatar preview
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  // Timer resend: jalan hanya saat step 2 dan timer > 0
  useEffect(() => {
    if (step !== 2) return;
    if (resendTimer <= 0) return;

    const t = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(t);
  }, [step, resendTimer]);

  const resetOtpUI = () => {
    setCodeOtp(new Array(OTP_LEN).fill(''));
    // fokus ke kotak pertama
    requestAnimationFrame(() => otpRefs.current?.[0]?.focus?.());
  };

  const setToken = (res) => {
    const token = res?.data?.token;
    if (token) localStorage.setItem('token', token);
  };
  const setUserData = (res) => {
    const user = res?.data?.data;
    if (user) localStorage.setItem('user', JSON.stringify(user));
  };

  const goToHome = (res) => {
    setToken(res);
    setUserData(res);
    setStep(5);
    setTimeout(() => navigate('/'), 1500);
  };

  const sendOtpToEmail = async ({ forceResetTimer = true } = {}) => {
    if (!emailNormalized) {
      setLoginError('Email is required');
      return false;
    }

    setIsSendingEmail(true);
    try {
      const res = await axios.post(`${urlBe}/user/login-v2`, { email: emailNormalized });

      if (res?.data?.code === '1') {
        setStep(2);
        resetOtpUI();
        if (forceResetTimer) setResendTimer(RESEND_SECONDS);
        return true;
      }

      setLoginError('Login gagal: ' + (res?.data?.message || 'Unknown error'));
      return false;
    } catch (err) {
      setLoginError('Login gagal: ' + getErrMsg(err));
      return false;
    } finally {
      setIsSendingEmail(false);
    }
  };

  const verifyOtp = async (finalCode) => {
    if (isVerifyingOtp) return;
    if (!finalCode || finalCode.length !== OTP_LEN) {
      setLoginError('OTP harus 6 digit');
      return;
    }
    if (!emailNormalized) {
      setLoginError('Email is required');
      setStep(1);
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await axios.post(`${urlBe}/user/login-v2/verify`, {
        email: emailNormalized,
        code: finalCode,
      });

      if (res?.data?.code !== '1') {
        setLoginError('Login gagal: ' + (res?.data?.message || 'Invalid code'));
        return;
      }

      const data = res?.data?.data || {};
      setName(data?.name || '');
      setNoHp(data?.no_hp || '');

      // Kalau sudah lengkap, langsung masuk
      if (data?.name) {
        goToHome(res);
        return;
      }

      // Kalau belum lengkap, lanjut onboarding
      setToken(res);
      if (!data?.no_hp) setStep(3);
      else setStep(4);
    } catch (err) {
      setLoginError('Login gagal: ' + getErrMsg(err));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const fillOtpAndSubmit = (otpArr) => {
    setCodeOtp(otpArr);
    // fokus terakhir biar rapi
    requestAnimationFrame(() => otpRefs.current?.[OTP_LEN - 1]?.focus?.());
    verifyOtp(otpArr.join(''));
  };

  const handleOtpChange = (idx, raw) => {
    if (isVerifyingOtp) return;

    const value = String(raw || '');
    const char = value.slice(-1); // ambil karakter terakhir (biar kalau user paste 2 char, tetep aman)

    // kosong -> backspace behavior
    if (char === '') {
      setCodeOtp((prev) => {
        const next = [...prev];
        next[idx] = '';
        return next;
      });
      if (idx > 0) otpRefs.current?.[idx - 1]?.focus?.();
      return;
    }

    // harus digit
    if (!/^\d$/.test(char)) return;

    setCodeOtp((prev) => {
      const next = [...prev];
      next[idx] = char;

      // move focus
      if (idx < OTP_LEN - 1) {
        requestAnimationFrame(() => otpRefs.current?.[idx + 1]?.focus?.());
      }

      // auto submit kalau lengkap
      const joined = next.join('');
      if (next.every((n) => n !== '') && joined.length === OTP_LEN) {
        verifyOtp(joined);
      }
      return next;
    });
  };

  const handleOtpKeyDown = (idx, e) => {
    if (isVerifyingOtp) return;

    if (e.key === 'Backspace') {
      // kalau current cell kosong, pindah ke kiri
      if (!codeOtp[idx] && idx > 0) {
        e.preventDefault();
        otpRefs.current?.[idx - 1]?.focus?.();
      }
    }

    // paste via keyboard
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
      // biarin onPaste handler yang jalan
    }
  };

  const handleOtpPaste = (e) => {
    if (isVerifyingOtp) return;

    const text = e.clipboardData?.getData('text') || '';
    const otpArr = parseOtp(text);
    if (!otpArr) return;

    e.preventDefault();
    fillOtpAndSubmit(otpArr);
  };

  const pasteFromClipboard = async () => {
    if (isVerifyingOtp) return;

    try {
      const clipText = await navigator.clipboard.readText();
      const otpArr = parseOtp(clipText);
      if (!otpArr) {
        setLoginError('Clipboard tidak berisi 6 digit OTP.');
        return;
      }
      fillOtpAndSubmit(otpArr);
    } catch {
      setLoginError('Gagal membaca clipboard. Coba paste manual.');
    }
  };

  const handleSubmitNoHp = () => setStep(4);

  const handleSkipNoHp = () => {
    setNoHp('');
    setStep(4);
  };

  const handleSaveProfile = async () => {
    if (isSavingProfile) return;

    const trimmedName = String(name || '').trim();
    if (!trimmedName) {
      setErrorName('Name is required');
      return;
    }
    if (!emailNormalized) {
      setLoginError('Email is required');
      setStep(1);
      return;
    }

    setIsSavingProfile(true);
    try {
      let imgUrl = '';

      if (avatarFile) {
        const formData = new FormData();
        formData.append('image', avatarFile);

        const saveImgRes = await axios.post(`${urlBe}/image/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        imgUrl = saveImgRes?.data?.img_url || '';
      }

      const payload = {
        name: trimmedName,
        email: emailNormalized,
        no_hp: noHp,
        image: imgUrl,
      };

      const res = await axios.put(`${urlBe}/user/edit-profile`, payload, {
        headers: { 'x-jdticket': localStorage.getItem('token') || '' },
      });

      if (res?.data?.code === '1') {
        localStorage.setItem('user', JSON.stringify(payload));
        goToHome(res);
      } else {
        setLoginError('Login gagal: ' + (res?.data?.message || 'Unknown error'));
      }
    } catch (err) {
      setLoginError('Login gagal: ' + getErrMsg(err));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const isAnyBusy = isSendingEmail || isVerifyingOtp || isSavingProfile;

  return (
    <GoogleOAuthProvider clientId={google_client_id}>
      <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute">
        {/* STEP 1 */}
        {step === 1 && (
          <div
            className="p-6 rounded-xl w-[360px] shadow-xl border-solid border-[#212121] border"
            style={{
              background:
                'var(--backgroundd, linear-gradient(135.91deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%))',
              color: '#fff',
            }}
          >
            <div className="flex mb-4">
              <div
                onClick={() => navigate('/')}
                className="w-12 h-12 flex items-center justify-center rounded-full cursor-pointer"
                style={{
                  background:
                    'var(--backgroundd, linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%))',
                  color: '#fff',
                }}
              >
                <LogIn className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="text-white text-xl font-['Satoshi-Bold'] mb-2">Welcome to Kebbu</div>
            <p className="text-gray-400 text-sm font-['Satoshi-Regular',_sans-serif] mb-4">
              Please sign in or sign up below.
            </p>

            <div className="text-gray-300 text-sm font-['Satoshi-Medium',_sans-serif] mb-2">
              Email
            </div>

            <input
              type="email"
              autoComplete="email"
              className="w-full px-3 py-2 rounded bg-black text-white font-['Satoshi-Medium',_sans-serif] border border-gray-700 placeholder:text-gray-500"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendOtpToEmail();
              }}
              disabled={isAnyBusy}
            />

            <button
              type="button"
              className="w-full bg-white text-black font-['Satoshi-Bold'] mt-4 py-2 rounded disabled:opacity-50"
              disabled={isAnyBusy || !emailNormalized}
              onClick={() => sendOtpToEmail()}
            >
              {isSendingEmail ? 'Continue...' : 'Continue'}
            </button>

            <GoogleLoginCustom />
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div
            className="p-6 rounded-xl w-[360px] shadow-xl border-solid border-[#212121] border"
            style={{
              background:
                'var(--backgroundd, linear-gradient(135.91deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%))',
              color: '#fff',
            }}
          >
            <div className="mb-4 flex justify-between items-start">
              <div
                onClick={() => {
                  setStep(1);
                  resetOtpUI();
                  setResendTimer(RESEND_SECONDS);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#2a2a2a] transition disabled:opacity-50"
                style={{
                  background:
                    'var(--backgroundd, linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%))',
                  color: '#fff',
                }}
                disabled={isAnyBusy}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="text-white text-xl font-['Satoshi-Bold'] mb-2">Enter Code</div>
            <p className="text-gray-400 text-sm font-['Satoshi-Regular',_sans-serif] mb-4">
              Please enter the 6 digit code we send to <br />
              <span className="text-white font-['Satoshi-Regular',_sans-serif]">
                {emailNormalized}
              </span>
            </p>

            <div className="flex justify-between gap-2 mb-4" onPaste={handleOtpPaste}>
              {codeOtp.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-10 h-10 rounded-md bg-black border border-gray-700 text-white text-center text-lg focus:outline-white disabled:opacity-50"
                  disabled={isAnyBusy}
                />
              ))}
            </div>

            <div className="flex items-center justify-between mt-2 mb-2">
              <button
                type="button"
                onClick={pasteFromClipboard}
                className="text-sm text-[#A2A2A2] font-['Satoshi-Bold'] bg-[#303030] rounded flex items-center gap-2 px-3 py-1.5 disabled:opacity-50"
                disabled={isAnyBusy}
              >
                <Clipboard className="w-3 h-3" />
                Paste Code
              </button>

              <p className="text-gray-500 text-sm">
                {resendTimer > 0 ? (
                  `Resend code in ${resendTimer}s`
                ) : (
                  <button
                    type="button"
                    className="text-blue-400 cursor-pointer hover:underline disabled:opacity-50"
                    disabled={isAnyBusy}
                    onClick={() => sendOtpToEmail({ forceResetTimer: true })}
                  >
                    Resend Code
                  </button>
                )}
              </p>
            </div>

            {isVerifyingOtp && <p className="text-xs text-gray-400 mt-3">Verifying code...</p>}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div
            className="p-6 rounded-xl w-[360px] shadow-xl border-solid border-[#212121] border"
            style={{
              background:
                'var(--backgroundd, linear-gradient(135.91deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%))',
              color: '#fff',
            }}
          >
            <div className="text-white text-xl font-['Satoshi-Bold'] mb-2">Link Phone Number</div>
            <p className="text-[#A2A2A2] text-sm font-['Satoshi-Regular',_sans-serif] mb-4">
              Link your phone number to receive reminders via SMS and find your friends.
            </p>

            <p className="text-white text-sm font-['Satoshi-Medium',_sans-serif] mb-2">
              Phone Number
            </p>

            <input
              type="tel"
              placeholder="+62 812 345 678"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              className="w-full px-3 py-2 rounded bg-black text-white border border-gray-700 placeholder:text-gray-500"
              disabled={isAnyBusy}
            />

            <button
              type="button"
              className="w-full bg-white text-black font-['Satoshi-Bold'] mt-4 py-2 rounded disabled:opacity-50"
              onClick={handleSubmitNoHp}
              disabled={isAnyBusy}
            >
              Continue
            </button>

            <button
              type="button"
              className="w-full text-[#A2A2A2] font-['Satoshi-Bold'] mt-2 py-2 flex items-center justify-center cursor-pointer disabled:opacity-50"
              onClick={handleSkipNoHp}
              disabled={isAnyBusy}
            >
              Skip
            </button>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div
            className="p-6 rounded-xl w-[360px] shadow-xl border-solid border-[#212121] border"
            style={{
              background:
                'var(--backgroundd, linear-gradient(135.91deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%))',
              color: '#fff',
            }}
          >
            <div className="text-white text-xl font-['Satoshi-Bold'] mb-2">
              Complete Your Profile
            </div>
            <p className="text-[#A2A2A2] text-sm font-['Satoshi-Regular',_sans-serif] mb-4">
              Enter your name and choose an avatar so your friends can recognize you.
            </p>

            <div className="flex items-center gap-4 mb-4">
              {/* Avatar Upload */}
              <label htmlFor="avatar-upload" className="relative w-16 h-16 cursor-pointer">
                <img
                  src={
                    avatarPreview ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      name?.trim() || 'User',
                    )}&background=random`
                  }
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border border-gray-700"
                />

                <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#1e1e1e] border border-gray-600 rounded-full flex items-center justify-center hover:bg-[#333] transition">
                  <Upload className="w-3 h-3" />
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                      setAvatarFile(file);
                      setAvatarPreview(URL.createObjectURL(file));
                    }}
                    className="hidden"
                    disabled={isAnyBusy}
                  />
                </div>
              </label>

              {/* Name Input */}
              <div className="flex-1">
                <label className="block text-sm text-white font-['Satoshi-Medium',_sans-serif] mb-1">
                  Name
                </label>

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
                  disabled={isAnyBusy}
                />
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-white text-black font-['Satoshi-Bold'] py-2 rounded disabled:opacity-50"
              onClick={handleSaveProfile}
              disabled={isAnyBusy}
            >
              {isSavingProfile ? 'Saving...' : 'Let’s Go'}
            </button>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-white text-lg font-['Satoshi-Bold']">Welcome to Kebbu!</p>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}
