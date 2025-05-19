import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';

function QRScanner() {
  const qrCodeRegionId = 'qr-reader';
  const [userData, setUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [scanned, setScanned] = useState(false);

  const totalCheckedIn = 2;
  const totalGuest = 40;
  const totalInvitation = 2;
  const progress = (totalCheckedIn / (totalGuest + totalInvitation)) * 100;

  useEffect(() => {
    const html5QrCode = new Html5Qrcode(qrCodeRegionId);

    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 30, qrbox: 250 },
          async (decodedText) => {
            if (scanned) return;
            setScanned(true);

            const parts = decodedText.split('|');
            const event_id = parts[1] || null;
            const token_received = parts[2] || null;
            try {
              const res = await axios.post('https://jdticket-production.up.railway.app/user/get-user-scan', {
                event_id,
                token_received,
              });
              setUserData(res.data.data);
              setShowModal(true);
            } catch (err) {
              setScanned(false);
              alert(`❌ QR Tidak valid: ${err.response?.data?.message || err.message || 'Terjadi kesalahan server'}`);
            }
          },
          (error) => {}
        );
      }
    });

    return () => {
      Html5Qrcode.getCameras().then(() => {
        Html5Qrcode.getCameras().then(() => {
          Html5Qrcode.getCameras().then(devices => {
            if (devices.length > 0) {
              new Html5Qrcode(qrCodeRegionId).stop().catch(() => {});
            }
          });
        });
      });
    };
  }, [scanned]);

  const handleCheckIn = async () => {
    try {
      await axios.post('https://jdticket-production.up.railway.app/api/check-in', {
        event_id: userData.event_id,
        email: userData.email,
      });
      alert('✅ Check-in berhasil!');
      setShowModal(false);
    } catch (err) {
      alert('❌ Gagal check-in');
    }
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center p-6">
      <div className="text-2xl font-bold mb-1">XYZ Music Festival</div>
      <div className="text-sm text-gray-400 mb-4">Starting in 3 hours</div>

      <div className="relative w-full max-w-md rounded overflow-hidden mb-6">
        <div id="qr-reader" className="w-full" style={{ height: 300 }} />
      </div>

      <div className="bg-[#111] w-full max-w-md rounded-lg px-4 py-3">
        <div className="flex justify-between text-green-400 mb-1">
          <div className="font-semibold">{totalCheckedIn}</div>
          <div className="text-sm text-white">{totalGuest} Guest</div>
          <div className="text-sm text-white">{totalInvitation} Invitation</div>
        </div>
        <div className="w-full bg-gray-700 h-2 rounded">
          <div
            className="bg-green-400 h-2 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* MODAL */}
      {showModal && userData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#1c1c1c] rounded-xl p-6 w-[90%] max-w-md text-white">
            <div className="flex items-center mb-4">
              <img
                src={userData.avatar || 'https://ui-avatars.com/api/?name=' + userData.name}
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
            <div className="text-center text-gray-400 mb-1 text-sm">Registered</div>
            <div className="text-center mb-4">{userData.create_at || '18 May 2025, 21:35 WIB'}</div>
            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded bg-[#2a2a2a]">Cancel</button>
              <button onClick={handleCheckIn} className="flex-1 py-2 rounded bg-green-500 text-black font-semibold">Check In</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QRScanner;
