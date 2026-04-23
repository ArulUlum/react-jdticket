import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';

const POLL_MS = 3000;
const urlBe = import.meta.env.VITE_URL_BE;

export default function PaymentPage(props) {
  const location = useLocation();
  const initialPayload = location.state || props?.payload || props || {};

  // Freeze payload once (biar stabil)
  const [payload] = useState(initialPayload);

  const [payment, setPayment] = useState(null);
  const [status, setStatus] = useState('LOADING'); // LOADING|PENDING|SUCCESS|EXPIRED|FAILED
  const [timeLeft, setTimeLeft] = useState(0);

  const createdRef = useRef(false);

  // 1) Create invoice ONCE
  useEffect(() => {
    // Guard: don't try to create invoice without a payload
    if (!payload || Object.keys(payload).length === 0) {
      console.error('PaymentPage: missing payload', payload);
      setStatus('FAILED');
      return;
    }

    let mounted = true;
    (async () => {
      try {
        console.log('Creating invoice with payload:', payload);
        // Route to correct endpoint based on payment method
        const paymentMethod = (payload.payment || '').toLowerCase();
        let invoiceEndpoint = '/payment/invoice/cring'; // default: QRIS
        if (paymentMethod.includes('xendit')) {
          invoiceEndpoint = '/payment/create-invoice-xendit';
        } else if (paymentMethod.includes('midtrans')) {
          invoiceEndpoint = '/payment/create-invoice-midtrans';
        }
        const response = await axios.post(`${urlBe}${invoiceEndpoint}`, payload);
        console.log('Invoice created:', response?.data);
        const data = response?.data?.data ?? response?.data;
        if (!mounted) return;
        setPayment(data);
        setStatus('PENDING');
      } catch (err) {
        console.error('Failed to create invoice:', err, payload);
        if (!mounted) return;
        setStatus('FAILED');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [JSON.stringify(payload)]);

  const invoiceCode = payment?.invoiceCode || payment?.referenceNo; // fallback kalau backend pakai referenceNo

  const qrString = useMemo(() => {
    const raw = payment?.qrCode || '';
    return raw.replace(/\s+/g, ' ').trim();
  }, [payment?.qrCode]);

  // 2) Countdown (UX)
  useEffect(() => {
    if (!payment?.expiredAt) return;

    const expiry = new Date(payment.expiredAt).getTime();

    const interval = setInterval(() => {
      const diff = expiry - Date.now();
      if (diff <= 0) {
        setTimeLeft(0);
        setStatus((s) => (s === 'SUCCESS' ? 'SUCCESS' : 'EXPIRED'));
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [payment?.expiredAt]);

  // 3) Polling status sampai terminal state
  useEffect(() => {
    if (!invoiceCode) return;
    if (['SUCCESS', 'EXPIRED', 'FAILED'].includes(status)) return;

    const controller = new AbortController();

    const interval = setInterval(async () => {
      try {
        // GANTI ini sesuai endpoint backend lu
        const res = await axios.post(`${urlBe}/payment/status`, 
          { invoiceCode },
          { signal: controller.signal }
        );

        const fresh = res.data?.data || res.data;
        if (!fresh?.status) return;

        setStatus(fresh.status);
        setPayment((p) => ({ ...p, ...fresh }));

        if (['SUCCESS', 'EXPIRED', 'FAILED'].includes(fresh.status)) {
          clearInterval(interval);
        }
      } catch (err) {
        if (axios.isCancel?.(err)) return;
        // polling error: log aja, jangan langsung FAILED
        console.warn('Polling error:', err?.message || err);
      }
    }, POLL_MS);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [invoiceCode, status]);

  const fmt = (ms) => {
    const s = Math.floor(ms / 1000);
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${m}:${ss}`;
  };

  // UI
  if (status === 'LOADING' || !payment) return <p>Loading...</p>;

  if (status === 'SUCCESS') {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2>✅ Pembayaran Berhasil</h2>
        <p>Tiket kamu sudah aktif.</p>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Invoice: {invoiceCode}
          <br />
          Paid at: {payment.paidAt || '-'}
        </div>
      </div>
    );
  }

  if (status === 'EXPIRED') {
    return (
      <div style={{ textAlign: 'center', color: 'crimson' }}>
        <h2>⛔ Pembayaran Kadaluarsa</h2>
        <p>Silakan buat pembayaran baru untuk mendapatkan QR yang masih aktif.</p>
      </div>
    );
  }

  if (status === 'FAILED') {
    return (
      <div style={{ textAlign: 'center', color: 'crimson' }}>
        <h2>❌ Terjadi masalah</h2>
        <p>Gagal membuat / mengecek pembayaran. Silakan coba lagi.</p>
      </div>
    );
  }

  // PENDING
  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Scan QR untuk Pembayaran</h3>

      <div
        style={{ display: 'inline-block', padding: 12, border: '1px solid #ddd', borderRadius: 12 }}
      >
        <QRCodeCanvas value={qrString} size={220} includeMargin />
      </div>

      <p style={{ marginTop: 10 }}>
        Kadaluarsa dalam: <b style={{ fontFamily: 'monospace' }}>{fmt(timeLeft)}</b>
      </p>

      <div style={{ fontSize: 12, opacity: 0.7 }}>Invoice: {invoiceCode}</div>
    </div>
  );
}
