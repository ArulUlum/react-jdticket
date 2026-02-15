// src/components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop({ smooth = false }) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Kalau ada anchor (#section), biarkan browser scroll ke anchor
    if (hash) return;

    const opts = smooth ? { top: 0, left: 0, behavior: 'smooth' } : { top: 0, left: 0 };
    window.scrollTo(opts);
  }, [pathname, hash, smooth]);

  return null;
}
