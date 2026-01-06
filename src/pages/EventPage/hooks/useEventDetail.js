import { useEffect, useState } from 'react';
import axios from 'axios';

const urlBe = import.meta.env.VITE_URL_BE;

export function useEventDetail(url) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchData(currentUrl) {
    setLoading(true);
    try {
      const response = await axios.get(`${urlBe}/events/detail/${currentUrl}`);
      const data = response.data.data;
      setEvent(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch event detail:', err);
      setEvent(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { event, loading, refetch: () => fetchData(url) };
}
