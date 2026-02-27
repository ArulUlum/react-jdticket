import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, Copy, CircleX } from 'lucide-react';

const urlBe = import.meta.env.VITE_URL_BE;

const MorePage = ({ id }) => {
  const [data, setData] = useState(null);
  document.title = 'More - Kebbu';

  // Modal Refs
  const cancelModalRef = useRef(null);
  const duplicateModalRef = useRef(null);
  // Tambahkan modal lainnya di sini...

  // Modal States
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  // Tambahkan modal lainnya di sini...

  // URL Update States
  const [urlInput, setUrlInput] = useState('');
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  // Cancel Event State
  const [isCancelingEvent, setIsCancelingEvent] = useState(false);

  const modals = [
    { ref: cancelModalRef, isOpen: isCancelModalOpen, close: () => setIsCancelModalOpen(false) },
    {
      ref: duplicateModalRef,
      isOpen: isDuplicateModalOpen,
      close: () => setIsDuplicateModalOpen(false),
    },
    // Tambahkan modal lain: { ref, isOpen, close }
  ];

  useEffect(() => {
    fetchData(id);

    const handleClickOutside = (event) => {
      modals.forEach(({ ref, isOpen, close }) => {
        if (isOpen && ref.current && !ref.current.contains(event.target)) {
          close();
        }
      });
    };

    // Cek apakah ada modal yang terbuka
    const anyOpen = modals.some(({ isOpen }) => isOpen);
    if (anyOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [id, modals.map((m) => m.isOpen).join()]);

  const fetchData = async (id) => {
    try {
      const response = await axios.get(`${urlBe}/events/more/${id}`, {
        headers: { 'x-jdticket': localStorage.getItem('token') || '' },
      });
      setData(response.data.data);
      setUrlInput(response.data.data?.url || '');
    } catch (err) {
      console.error('Failed to fetch sales report:', err);
    }
  };

  const handleUpdateUrl = async () => {
    if (!urlInput.trim()) {
      setUpdateMessage({ type: 'error', text: 'URL cannot be empty' });
      return;
    }

    setIsUpdatingUrl(true);
    setUpdateMessage('');

    try {
      const response = await axios.put(
        `${urlBe}/events/update-url/${id}`,
        { url: urlInput },
        {
          headers: { 'x-jdticket': localStorage.getItem('token') || '' },
        },
      );
      setData({ ...data, url: urlInput });
      setUpdateMessage({ type: 'success', text: 'Event URL updated successfully!' });
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update URL:', err);
      setUpdateMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update event URL. Please try again.',
      });
    } finally {
      setIsUpdatingUrl(false);
    }
  };

  const handleCopyUrl = async () => {
    const fullUrl = `kebbu.id/${urlInput}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setUpdateMessage({ type: 'success', text: 'URL copied to clipboard!' });
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      setUpdateMessage({ type: 'error', text: 'Failed to copy URL' });
    }
  };

  const handleCancelEvent = async () => {
    try {
      setIsCancelingEvent(true);
      const response = await axios.delete(`${urlBe}/events/${id}`, {
        headers: { 'x-jdticket': localStorage.getItem('token') || '' },
      });

      if (response.data.code === '1') {
        alert('Event cancelled successfully');
        setIsCancelModalOpen(false);
        // Redirect to user profile after successful cancellation
        setTimeout(() => {
          window.location.href = '/user-profil';
        }, 500);
      } else {
        alert('Failed to cancel event: ' + response.data.message);
      }
    } catch (err) {
      console.error('Failed to cancel event:', err);
      alert(err.response?.data?.message || 'Failed to cancel event. Please try again.');
    } finally {
      setIsCancelingEvent(false);
    }
  };

  return (
    <div>
      {/* Duplicate Event Section */}
      <div className="mt-4">
        <h2 className="text-responsive-sub-title text-white mb-3">Duplicate Event</h2>
        <p className="text-white mb-3 text-responsive-regular">
          Duplicate this event with the same details — excluding guest list and past messages.
        </p>
        <button
          className="flex items-center text-responsive-item-title gap-2 bg-white border border-[#212121] rounded-lg px-4 py-3 text-[#141717] mb-3"
          onClick={() => setIsDuplicateModalOpen(true)}
        >
          <Copy className="w-5 h-5 text-[#141717]" style={{ transform: 'scaleX(-1)' }} />
          Duplicate Event
        </button>
        {/* Duplicate Event Modal */}
        {isDuplicateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div
              ref={duplicateModalRef}
              className="bg-[#141717] rounded-[24px] p-8 w-[350px] md:w-[420px] shadow-lg relative border border-[#212121] flex flex-col items-start"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="bg-[linear-gradient(135deg,_rgba(255,255,255,0.2),_rgba(255,255,255,0))] rounded-full w-16 h-16 flex items-center justify-center">
                  <Copy className="w-8 h-8 text-white" style={{ transform: 'scaleX(-1)' }} />
                </div>
              </div>
              <h2 className="text-white text-2xl font-bold mb-2">Duplicate Event</h2>
              <p className="text-[#a2a2a2] text-base mb-6">
                Create a copy of this event with the same name, location, duration, and settings.
              </p>
              <div className="w-full mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-semibold">Event Start and Event End</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[#a2a2a2] w-16">Start</span>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="date"
                        className="bg-[#212121] text-white rounded-lg px-3 py-2 text-sm w-full"
                        value={data?.start_date ? data.start_date.split('T')[0] : ''}
                        onChange={(e) =>
                          setData({
                            ...data,
                            start_date:
                              e.target.value + (data?.start_time ? 'T' + data.start_time : ''),
                          })
                        }
                      />
                      <input
                        type="time"
                        className="bg-[#212121] text-white rounded-lg px-3 py-2 text-sm w-full"
                        value={data?.start_time || ''}
                        onChange={(e) => setData({ ...data, start_time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#a2a2a2] w-16">End</span>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="date"
                        className="bg-[#212121] text-white rounded-lg px-3 py-2 text-sm w-full"
                        value={data?.end_date ? data.end_date.split('T')[0] : ''}
                        onChange={(e) =>
                          setData({
                            ...data,
                            end_date: e.target.value + (data?.end_time ? 'T' + data.end_time : ''),
                          })
                        }
                      />
                      <input
                        type="time"
                        className="bg-[#212121] text-white rounded-lg px-3 py-2 text-sm w-full"
                        value={data?.end_time || ''}
                        onChange={(e) => setData({ ...data, end_time: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="bg-white rounded-[14px] px-4 py-3 w-full text-[#141717] text-lg font-semibold mb-2 hover:bg-[#e5e5e5] transition"
                onClick={() => {
                  // TODO: Implement duplicate event logic here
                  setIsDuplicateModalOpen(false);
                }}
              >
                Duplicate
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <hr className="my-9 border-[#333]" />

      {/* Customize Event URL Section */}
      <div className="mt-4">
        <h2 className="text-responsive-sub-title text-white mb-3">Customize Event URL</h2>
        <p className="text-white mb-3 text-responsive-regular">
          Edit the link to your event page. Make it short, clear, and easy to remember.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center text-responsive-regular bg-[#181818] border border-[#333] rounded-lg px-4 py-3 w-fit">
            <Link
              className="w-5 h-5 text-[#a2a2a2] mr-4 cursor-pointer hover:text-white transition"
              onClick={handleCopyUrl}
            />
            <span className="text-[#a2a2a2] ">kebbu.id/</span>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="bg-transparent text-white font-semibold outline-none w-32"
            />
          </div>
          <button
            onClick={handleUpdateUrl}
            disabled={isUpdatingUrl}
            className="bg-white border border-[#212121] rounded-lg px-4 py-3 text-[#141717] font-semibold hover:bg-[#e5e5e5] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdatingUrl ? 'Saving...' : 'Save URL'}
          </button>
        </div>
        {updateMessage && (
          <p
            className={`text-sm font-medium mt-3 ${updateMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
          >
            {updateMessage.text}
          </p>
        )}
      </div>

      {/* Divider */}
      <hr className="my-9 border-[#333]" />

      {/* Cancel Event Section */}
      <div className="mt-4 mb-20">
        <h2 className="text-responsive-sub-title text-white mb-3">Cancel Event</h2>
        <p className="text-white mb-3 text-responsive-regular">
          Cancel this event and prevent any new registrations. Guests will no longer be able to
          join.
        </p>
        <button
          className="flex items-center gap-2 bg-[#f94d4d] border border-[#212121] rounded-lg px-4 py-3 text-white font-semibold hover:bg-[#c93333] transition mb-3"
          onClick={() => setIsCancelModalOpen(true)}
        >
          <CircleX className="w-5 h-5 text-white" />
          Cancel Event
        </button>
      </div>

      {/* Cancel Event Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div
            ref={cancelModalRef}
            className="bg-[#181818] rounded-[24px] p-8 w-[350px] md:w-[420px] shadow-lg relative border border-[#212121] flex flex-col items-start"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-[#f94d4d] rounded-full w-16 h-16 flex items-center justify-center">
                <CircleX className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-white text-2xl font-bold mb-3">Cancel Event</h2>
            <p className="text-[#f94d4d] text-base mb-8">
              Are you sure you want to cancel this event? This action cannot be undone.
            </p>
            <button
              className="bg-[#f94d4d] rounded-[14px] px-4 py-3 w-full text-white text-lg font-semibold mb-2 hover:bg-[#c93333] transition disabled:opacity-50"
              onClick={handleCancelEvent}
              disabled={isCancelingEvent}
            >
              {isCancelingEvent ? 'Cancelling...' : 'Cancel Event'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MorePage;
