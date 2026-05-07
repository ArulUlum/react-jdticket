import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const urlBe = import.meta.env.VITE_URL_BE;

/**
 * Tracks a visitor session for an event page.
 *
 * - Fires POST /events/track-visit when the component mounts (page opened)
 * - Fires POST /events/track-session-end via sendBeacon when the visitor
 *   leaves the page (tab close, navigate away, SPA unmount, visibility hidden)
 *
 * @param {number|null} eventId - The numeric event ID (from event detail response)
 */
export function useTrackVisit(eventId) {
  const sessionIdRef = useRef(null);
  const startTimeRef = useRef(null);
  const endSentRef = useRef(false);

  useEffect(() => {
    if (!eventId) return;

    const sessionId = uuidv4();
    sessionIdRef.current = sessionId;
    startTimeRef.current = Date.now();
    endSentRef.current = false;

    // Track visit when the page opens
    axios
      .post(`${urlBe}/events/track-visit`, {
        event_id: eventId,
        session_id: sessionId,
        referrer: document.referrer || null,
      })
      .catch((err) => console.warn('Track visit failed:', err));

    // Send session-end via sendBeacon (survives tab close)
    const sendSessionEnd = () => {
      if (endSentRef.current) return;
      endSentRef.current = true;

      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      const payload = JSON.stringify({
        session_id: sessionIdRef.current,
        session_duration: duration,
        page_views: 1,
      });

      navigator.sendBeacon(
        `${urlBe}/events/track-session-end`,
        new Blob([payload], { type: 'application/json' }),
      );
    };

    const handleBeforeUnload = () => sendSessionEnd();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendSessionEnd();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sendSessionEnd(); // cleanup on SPA navigation (component unmount)
    };
  }, [eventId]);

  return sessionIdRef;
}
