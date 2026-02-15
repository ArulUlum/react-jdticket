import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const urlBe = import.meta.env.VITE_URL_BE;

function QRScanner() {
  const { id } = useParams(); // ambil event id dari route
  const qrCodeRegionId = 'qr-reader';
  const html5Ref = useRef(null); // instance Html5Qrcode
  const scanningRef = useRef(false); // flag cegah double-submit

  const [userData, setUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingCheckin, setLoadingCheckin] = useState(false);

  // ---- State summary dari BE ----
  const [summary, setSummary] = useState({
    event_name: '',
    event_start_date: '',
    all_count: 0,
    checked_in: 0,
    registered_count: 0,
    invitation_count: 0,
  });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState(null);

  // title sekali
  useEffect(() => {
    document.title = 'QR Scan - Kebbu';
  }, []);

  // ---- Fetch summary event dari BE ----
  useEffect(() => {
    let ignore = false;

    const fetchSummary = async () => {
      setLoadingSummary(true);
      setErrorSummary(null);
      try {
        const res = await axios.get(`${urlBe}/events/user/${id}/scan`, {
          headers: { 'x-jdticket': localStorage.getItem('token') || '' },
        });
        // Expecting format persis seperti yang kamu kasih
        // {
        //   code:"1",
        //   message:"Get Data Success",
        //   data:{ id, event_name, event_start_date, all_count, checked_in, registered_count, invitation_count }
        // }
        if (!ignore && res?.data?.code === '1' && res?.data?.data) {
          setSummary(res.data.data);
        } else if (!ignore) {
          setErrorSummary(res?.data?.message || 'Gagal memuat data');
        }
      } catch (e) {
        if (!ignore)
          setErrorSummary(e?.response?.data?.message || e.message || 'Gagal memuat data');
      } finally {
        if (!ignore) setLoadingSummary(false);
      }
    };

    if (id) fetchSummary();
    return () => {
      ignore = true;
    };
  }, [id]);

  // ---- Hitung progress dari summary ----
  const totalCheckedIn = summary.checked_in || 0;
  const totalGuest = summary.registered_count || 0;
  const totalInvitation = summary.invitation_count || 0;
  const totalCap = summary.all_count || totalGuest + totalInvitation || 1;
  const progress = Math.min(100, (totalCheckedIn / totalCap) * 100);

  // ---- QR Decode Handlers ----
  const handleQrScanNew = async (decodedText) => {
    if (scanningRef.current) return;
    scanningRef.current = true;

    try {
      const parts = decodedText.split('|');
      const invoice_code = parts[0] || null;
      const ticket_id = parts[1] || null;
      const serial_idx = parts[2] || null;
      const qty = parts[3] || null;

      const res = await axios.post(
        `${urlBe}/user/get-user-scan-new`,
        { invoice_code, ticket_id, serial_idx, qty },
        { headers: { 'x-jdticket': localStorage.getItem('token') || '' } },
      );

      setUserData(res.data.data);
      setShowModal(true);

      // pause kamera saat modal tampil
      await html5Ref.current?.pause(true);
    } catch (err) {
      scanningRef.current = false; // izinkan scan berikutnya
      alert(
        `❌ QR Tidak valid: ${err?.response?.data?.message || err.message || 'Terjadi kesalahan server'}`,
      );
    }
  };

  // ---- Init Scanner sekali ----
  useEffect(() => {
    const html5QrCode = new Html5Qrcode(qrCodeRegionId);
    html5Ref.current = html5QrCode;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!devices?.length) {
          alert('Kamera tidak ditemukan.');
          return;
        }
        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 24, qrbox: 250 },
          (decodedText) => handleQrScanNew(decodedText),
          () => {}, // ignore scan failure per frame
        );
      } catch (e) {
        console.error('Start scanner error:', e);
        alert('Gagal mengakses kamera. Pastikan izin kamera aktif.');
      }
    };

    startScanner();

    return () => {
      (async () => {
        try {
          await html5QrCode.stop(); // stop akan release kamera
        } catch (e) {
          // ignore
        }
      })();
    };
  }, []); // init sekali

  // ---- Keyboard ESC & body scroll lock saat modal ----
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => e.key === 'Escape' && closeModal();
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [showModal]);

  // ---- Actions ----
  const handleCheckIn = async () => {
    if (!userData || loadingCheckin) return;
    setLoadingCheckin(true);
    try {
      const { invoice_code, ticket_id } = userData;
      await axios.post(
        `${urlBe}/user/checkin-user`,
        { invoice_code, ticket_id },
        { headers: { 'x-jdticket': localStorage.getItem('token') || '' } },
      );
      alert('✅ Check-in Successful');
      closeModal();
    } catch (err) {
      alert(
        `❌ Failed check-in: ${err?.response?.data?.message || err.message || 'Unknown error'}`,
      );
    } finally {
      setLoadingCheckin(false);
    }
  };

  const closeModal = async () => {
    setShowModal(false);
    setUserData(null);

    // resume scanning
    try {
      if (html5Ref.current?.resume) {
        await html5Ref.current.resume();
      } else if (html5Ref.current?.start) {
        await html5Ref.current.start(
          { facingMode: 'environment' },
          { fps: 24, qrbox: 250 },
          (decodedText) => handleQrScanNew(decodedText),
          () => {},
        );
      }
    } catch (e) {
      // ignore
    } finally {
      scanningRef.current = false;
    }
  };

  // ---- Helper untuk teks "Starting in ..." ----
  const startingText = (() => {
    if (!summary.event_start_date) return '';
    // event_start_date dalam format "YYYY-MM-DD HH:mm:ss" (anggap lokal time)
    const eventTime = new Date(summary.event_start_date.replace(' ', 'T'));
    const nowToEvent = formatDistanceToNow(eventTime, { addSuffix: true });
    // hasil contoh: "in 3 hours" → kita buat kapitalisasi awal
    return nowToEvent.charAt(0).toUpperCase() + nowToEvent.slice(1);
  })();

  return (
    <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center p-6">
      {/* Header Event */}
      <div className="text-2xl font-bold mb-1">
        {loadingSummary ? 'Loading…' : summary.event_name || '—'}
      </div>
      <div className="text-sm text-gray-400 mb-4">
        {loadingSummary ? '' : errorSummary ? 'Failed to load event info' : startingText}
      </div>

      {/* QR Viewfinder */}
      <div className="relative w-full max-w-md rounded overflow-hidden mb-6">
        <div id={qrCodeRegionId} className="w-full" style={{ height: 300 }} />
      </div>

      {/* Stats */}
      <div className="bg-[#111] w-full max-w-md rounded-lg px-4 py-3">
        <div className="flex justify-between text-green-400 mb-1">
          <div className="font-semibold">{loadingSummary ? '-' : totalCheckedIn} Checked in</div>
          <div className="text-sm text-white">{loadingSummary ? '-' : totalGuest} Guest</div>
          <div className="text-sm text-white">
            {loadingSummary ? '-' : totalInvitation} Invitation
          </div>
        </div>
        <div className="w-full bg-gray-700 h-2 rounded">
          <div
            className="bg-green-400 h-2 rounded"
            style={{ width: `${loadingSummary ? 0 : progress}%` }}
          />
        </div>
        {!loadingSummary && !errorSummary && (
          <div className="mt-1 text-right text-xs text-gray-400">
            {totalCheckedIn}/{totalCap}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && userData && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-[#1c1c1c] rounded-xl p-6 w-[90%] max-w-md text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <img
                src={
                  userData.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || '')}`
                }
                alt="avatar"
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <div className="font-semibold text-lg">{userData.name}</div>
                <div className="text-sm text-gray-400">{userData.email}</div>
              </div>
              <span className="ml-auto border border-green-500 text-green-400 text-xs px-3 py-1 rounded-full">
                {userData.role}
              </span>
            </div>

            {userData.is_checkin === true ? (
              <>
                <div className="text-center text-gray-400 mb-1 text-sm">Check-in</div>
                <div className="text-center mb-4">{userData.checkin_date}</div>
                <div className="flex gap-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2 rounded bg-red-500 text-white font-semibold"
                  >
                    Already Checked In (click to close)
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center text-gray-400 mb-1 text-sm">Registered</div>
                <div className="text-center mb-4">{userData.create_date}</div>
                <div className="flex gap-4">
                  <button onClick={closeModal} className="flex-1 py-2 rounded bg-[#2a2a2a]">
                    Cancel
                  </button>
                  <button
                    onClick={handleCheckIn}
                    disabled={loadingCheckin}
                    className="flex-1 py-2 rounded bg-green-500 text-black font-semibold disabled:opacity-60"
                  >
                    {loadingCheckin ? 'Processing…' : 'Check In'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default QRScanner;
