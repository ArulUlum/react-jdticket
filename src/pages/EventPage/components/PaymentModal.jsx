import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

const POLL_MS = 3000;
const urlBe = import.meta.env.VITE_URL_BE;

function normalizeQrString(raw) {
  if (!raw) return "";
  return String(raw).replace(/\s+/g, " ").trim();
}

function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${m}:${ss}`;
}

export default function PaymentModal({
  isOpen,
  onClose,
  payload,              // payload dari EventPage (paymentPayload)
  onSuccess,            // optional callback kalau SUCCESS (misal navigate/show success UI)
}) {
  const ref = useRef(null);

  const [payment, setPayment] = useState(null);
  const [status, setStatus] = useState("IDLE"); // IDLE|LOADING|PENDING|SUCCESS|EXPIRED|FAILED
  const [timeLeft, setTimeLeft] = useState(0);

  // guard supaya create invoice cuma sekali per "payloadKey"
  const lastKeyRef = useRef("");

  // Buat key stabil dari payload (kalau payload object baru tapi isi sama, masih dianggap sama)
  const payloadKey = useMemo(() => {
    if (!payload || Object.keys(payload).length === 0) return "";
    // Minimalkan noise: ambil field yang relevan aja
    const compact = {
      event_id: payload.event_id,
      email: payload.email,
      name: payload.name,
      no_hp: payload.no_hp,
      payment: payload.payment,
      total: payload.total,
      tickets: payload.tickets?.map((t) => ({ id: t.id, quantity: t.quantity, price: t.price })),
      fees: payload.fees,
    };
    return JSON.stringify(compact);
  }, [payload]);

  // Reset state ketika modal ditutup (biar bersih)
  useEffect(() => {
    if (!isOpen) {
      setPayment(null);
      setStatus("IDLE");
      setTimeLeft(0);
      lastKeyRef.current = "";
    }
  }, [isOpen]);

  // 1) Create invoice ketika modal open + payload ada
  useEffect(() => {
    if (!isOpen) return;
    if (!payloadKey) {
      setStatus("FAILED");
      return;
    }
    if (lastKeyRef.current === payloadKey) return; // sudah pernah create untuk payload yang sama
    lastKeyRef.current = payloadKey;

    let mounted = true;
    const controller = new AbortController();

    (async () => {
      try {
        setStatus("LOADING");
        const res = await axios.post(`${urlBe}/payment/create-invoice`, payload, {
          signal: controller.signal,
        });

        // Field mapping (sesuaikan dengan backend kamu)
        const data = res?.data?.data ?? res?.data;

        if (!mounted) return;
        setPayment(data);
        setStatus("PENDING");
      } catch (err) {
        if (axios.isCancel?.(err)) return;
        console.error("Failed to create invoice:", err);
        if (!mounted) return;
        setStatus("FAILED");
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [isOpen, payloadKey]); // payloadKey yang stabil

  // Field mapping: invoice code & expiredAt
  const invoiceCode =
    payment?.invoice_code ||
    payment?.invoiceCode ||
    "";

  const expiredAtRaw = payment?.expired_at || payment?.expiredAt || payment?.expiry || null;

  const qrString = useMemo(() => {
    // backend kamu sebelumnya return "qrCode" (string QRIS)
    return normalizeQrString(payment?.qrCode || payment?.qr_string || payment?.qr || "");
  }, [payment]);

  // 2) Countdown expiry
  useEffect(() => {
    if (!isOpen) return;
    if (!expiredAtRaw) return;
    if (status === "SUCCESS") return;

    const expiryMs = new Date(expiredAtRaw).getTime();
    if (Number.isNaN(expiryMs)) return;

    const interval = setInterval(() => {
      const diff = expiryMs - Date.now();
      if (diff <= 0) {
        setTimeLeft(0);
        setStatus((s) => (s === "SUCCESS" ? "SUCCESS" : "EXPIRED"));
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, expiredAtRaw, status]);

  // 3) Polling status
  useEffect(() => {
    if (!isOpen) return;
    if (!invoiceCode) return;
    if (["SUCCESS", "EXPIRED", "FAILED"].includes(status)) return;

    const controller = new AbortController();

    const interval = setInterval(async () => {
      try {
        const res = await axios.post(
          `${urlBe}/payment/status`,
          { invoiceCode },
          { signal: controller.signal }
        );

        const fresh = res?.data?.data ?? res?.data;
        if (!fresh?.status) return;

        // Kalau backend return "Success" dsb, normalisasi di sini
        const nextStatus = String(fresh.status).toUpperCase();
        const paidAt = fresh.paid_at || fresh.paidAt || null;

        setStatus(nextStatus);
        setPayment((p) => ({ ...p, ...fresh }));

        if (["SUCCESS", "EXPIRED", "FAILED"].includes(nextStatus)) {
          clearInterval(interval);
          if (nextStatus === "SUCCESS") onSuccess?.(fresh);
        }
      } catch (err) {
        if (axios.isCancel?.(err)) return;
        // polling error jangan langsung FAILED
        console.warn("Polling error:", err?.message || err);
      }
    }, POLL_MS);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [isOpen, invoiceCode, status, onSuccess]);

  const downloadQr = () => {
    try {
      const canvas = document.getElementById("kebbu-qris-canvas");
      if (!canvas) return;
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `QRIS-${invoiceCode || "payment"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn("Download QR failed:", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div
        ref={ref}
        className="bg-[#141717] text-white rounded-xl shadow-lg w-[90%] max-w-md max-h-[90vh] overflow-y-auto p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-responsive-sub-title text-white">Payment</h2>
            <div className="text-[#a2a2a2] text-sm">Scan QRIS untuk bayar</div>
          </div>
          <button className="text-[#a2a2a2]" onClick={onClose}>✕</button>
        </div>

        {/* States */}
        {status === "LOADING" && (
          <div className="text-center py-10">
            <div className="text-white">Create invoice...</div>
            <div className="text-[#a2a2a2] text-sm mt-2">Wait a Minute.</div>
          </div>
        )}

        {status === "FAILED" && (
          <div className="text-center py-10 text-red-400">
            <div className="text-lg font-semibold">Gagal membuat / mengecek pembayaran</div>
            <div className="text-sm text-[#a2a2a2] mt-2">
              Silakan tutup lalu coba lagi.
            </div>
          </div>
        )}

        {status === "EXPIRED" && (
          <div className="text-center py-10 text-yellow-300">
            <div className="text-lg font-semibold">QR Expired</div>
            <div className="text-sm text-[#a2a2a2] mt-2">
              Buat pembayaran baru untuk mendapatkan QR yang masih aktif.
            </div>
            <div className="text-xs text-[#a2a2a2] mt-3">Invoice: {invoiceCode || "-"}</div>
          </div>
        )}

        {status === "SUCCESS" && (
          <div className="text-center py-10 text-green-300">
            <div className="text-lg font-semibold">Pembayaran Berhasil ✅</div>
            <div className="text-sm text-[#a2a2a2] mt-2">
              Tiket kamu sudah aktif.
            </div>
            <div className="text-xs text-[#a2a2a2] mt-3">Invoice: {invoiceCode || "-"}</div>
            <div className="mt-6">
              <button
                className="bg-white text-[#141717] font-bold rounded-lg py-2 px-4"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* PENDING view */}
        {status === "PENDING" && payment && (
          <>
            <div className="w-full mx-auto text-white mb-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="text-[#a2a2a2]">Invoice Number</div>
                  <div className="text-white text-sm">{invoiceCode || "-"}</div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-[#a2a2a2]">Payment Status</div>
                  <div>
                    {(() => {
                      const payStatus = (payment?.paymentStatus || payment?.payment_status || "UNPAID").toString().toUpperCase();
                      if (payStatus.includes("PAID") || payStatus.includes("SUCCESS")) {
                        return (
                          <div className="bg-green-600 text-white text-xs py-1 px-3 rounded-full font-semibold">{payStatus}</div>
                        );
                      }
                      // default / unpaid
                      return (
                        <div className="bg-[#2b0f0f] text-[#ff6b6b] text-xs py-1 px-3 rounded-full font-semibold">{payStatus}</div>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-[#a2a2a2]">Transaction Status</div>
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-[#3b2b00] text-xs py-1 px-3 rounded-full font-semibold">{status}</div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-[#a2a2a2]">Expires in</div>
                  <div className="font-mono text-sm">{fmt(timeLeft)}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-3 rounded-xl">
                <QRCodeCanvas
                  id="kebbu-qris-canvas"
                  value={qrString || invoiceCode || "EMPTY"}
                  size={220}
                  includeMargin
                />
              </div>

              <div className="text-white text-lg">
                {payment?.amount?.value
                  ? `Rp ${Number(payment.amount.value).toLocaleString()}`
                  : (payload?.total ? `Rp ${Number(payload.total).toLocaleString()}` : "")}
              </div>
              <button
                className="mt-5 w-full rounded-2xl bg-[#3f7d73] text-white font-bold py-3 hover:opacity-95"
                onClick={downloadQr}
              >
                Download QR Code
              </button>
            </div>

            <div className="mt-6 text-[#a2a2a2] text-sm">
              <div className="font-semibold text-white mb-2">How to pay with QRIS</div>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open Mobile Banking / e-Wallet app</li>
                <li>Scan QRIS</li>
                <li>Pastikan nominal benar lalu konfirmasi</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
