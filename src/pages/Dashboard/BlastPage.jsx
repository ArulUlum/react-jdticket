import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, set } from 'date-fns';
import { ChevronDown, X, SendHorizonal, Bell, MessageSquareText } from 'lucide-react';

const dummySent = [
  {
    name: 'JoinDong',
    message:
      'Selamat Pagi, alajsndasondoau asondsasodnoasuhd nasousdnasndlasjin oausdhalksndliasindo iaosdin oasinds oasndas bdno uboabsdinaosdjb noasndalskjdnlasjdln aosidhao  aosndlaskndfljasbn ajlksndl alskndlasnkdoadhn oainidlaksdnl . o as da',
    recipients: 'Going - All',
    sent_date: new Date(2025, 5, 21, 14, 0),
  },
];
const urlBe = import.meta.env.VITE_URL_BE;

function BlastPage({ id }) {
  const [sent, setSent] = useState([]);
  const [options, setOptions] = useState([]);
  // const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  // Modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  document.title = 'Blast Email - Kebbu';

  const handleCloseScheduleModal = () => {
    setScheduleDate('');
    setScheduleTime('');
    setShowScheduleModal(false);
  };

  const handleOptionClick = (option) => {
    // const exists = selectedOptions.some(
    //   (item) => item.label === option.label
    // );
    // if (!exists) {
    //   setSelectedOptions((prev) => [...prev, option]);
    // }
    setSelectedOption(option);
    setShowOptions(false);
  };

  const handleRemove = (index) => {
    // setSelectedOptions((prev) => prev.filter((_, idx) => idx !== index));
    setSelectedOption(null);
  };

  useEffect(() => {
    getDataRecipients(id);
    getSentEmails(id);
  }, [id]);

  const getDataRecipients = async (id) => {
    try {
      const response = await axios.get(`${urlBe}/events/get-recipient-options/${id}`, {
        headers: { 'x-jdticket': localStorage.getItem('token') || '' },
      });
      setOptions(response.data.data);
    } catch (err) {
      console.error('Failed Get Data Recipients:', err);
    }
  };

  const sendEmailBlast = async (id) => {
    let scheduler = null;
    if (scheduleDate && scheduleTime) {
      scheduler = `${scheduleDate}T${scheduleTime}:00`;
    }
    const payload = {
      id: id,
      subject: subject,
      message: message,
      recipient_status: selectedOption ? selectedOption.value : null,
      scheduler: scheduler,
    };

    try {
      const response = await axios.post(`${urlBe}/events/send-blast-email`, payload, {
        headers: { 'x-jdticket': localStorage.getItem('token') || '' },
      });
      alert(response.data.message);
    } catch (error) {
      if (error.response) {
        alert(`(${error.response.status}) ${error.response.data?.message || 'Server Error'}`);
      } else if (error.request) {
        alert('No response from server');
      } else {
        alert('Unexpected error');
      }
    }
  };

  const getSentEmails = async (id) => {
    try {
      const response = await axios.get(`${urlBe}/events/get-sent-email/${id}`, {
        headers: { 'x-jdticket': localStorage.getItem('token') || '' },
      });
      setSent(response.data.data);
    } catch (err) {
      console.error('Failed to fetch sent emails:', err);
    }
  };

  return (
    <div>
      <div className="bg-[#141717] rounded-[10px] border border-[#212121] p-6 mt-6 mb-8">
        <h2 className="text-white font-['Satoshi-Bold',_sans-serif] text-lg mb-4">
          Send Blast Email to Guests
        </h2>

        <div className="border-t border-[#303030] mb-6"></div>

        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Recipients */}
          <div className="flex-1">
            <label className="text-white font-['Satoshi-Medium',_sans-serif] text-lg block mb-2">
              Recipients
            </label>
            <div
              className="bg-[#1c1d1d] rounded-lg border border-[#212121] p-3 flex items-center justify-between w-full cursor-pointer"
              onClick={() => setShowOptions(!showOptions)}
            >
              <div className="flex flex-wrap items-center gap-2">
                {/*
                {selectedOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-[#303030]  rounded-[10px] border border-[#212121] px-2 py-1"
                  >
                    <span className="text-white text-sm pr-2">{opt.label}</span>
                    <X
                      onClick={(e) => {
                        e.stopPropagation(); // agar tidak toggle dropdown
                        handleRemove(idx);
                      }}
                      className="text-[#a2a2a2] w-3 h-3 hover:text-red-400"
                    />
                  </div>
                ))}
                */}
                {selectedOption && (
                  <div className="flex items-center gap-1 bg-[#303030] rounded-[10px] border border-[#212121] px-2 py-1">
                    <span className="text-white text-sm pr-2">{selectedOption.label}</span>
                    <X
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove();
                      }}
                      className="text-[#a2a2a2] w-3 h-3 hover:text-red-400"
                    />
                  </div>
                )}
              </div>
              <ChevronDown className="w-5 h-5 text-white transition-transform duration-200 transform" />
            </div>

            {showOptions && (
              <div className="absolute z-10 mt-2 bg-[#1c1d1d] border-[#212121] rounded-lg shadow-lg w-full max-w-[410px]">
                {options.map((option, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 hover:bg-[#303030] cursor-pointer rounded-lg"
                    onClick={() => handleOptionClick(option)}
                  >
                    <span className="text-white text-sm">{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="flex-1">
            <label className="text-white font-['Satoshi-Medium',_sans-serif] text-lg block mb-2">
              Subject
            </label>
            <div className="bg-[#1c1d1d] rounded-lg border border-[#212121] p-3 items-center w-full">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Reminder: Bring Your Ticket!"
                className="text-sm outline-none bg-transparent font-['Satoshi-Medium',_sans-serif] w-full"
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <label className="text-white font-['Satoshi-Medium',_sans-serif] text-lg block mb-2">
            Message
          </label>
          <div className="bg-[#1c1d1d] rounded-lg border border-[#212121] p-3 min-h-[150px] w-full">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write Message Here"
              className="text-sm outline-none bg-transparent font-['Satoshi-Medium',_sans-serif] w-full resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-end">
          <button className="bg-[#1c1d1d] rounded-[10px] border border-[#212121] px-4 py-2 text-[#a2a2a2] text-base font-['Satoshi-Bold',_sans-serif]">
            Preview
          </button>
          <button
            className="bg-[#1c1d1d] rounded-[10px] border border-[#212121] px-4 py-2 text-[#a2a2a2] text-base font-['Satoshi-Bold',_sans-serif]"
            onClick={() => setShowScheduleModal(true)}
          >
            Schedule
          </button>
          <button
            onClick={() => sendEmailBlast(id)}
            className="bg-white rounded-[10px] border border-[#212121] px-4 py-2 flex items-center gap-2 text-[#171414] text-base font-['Satoshi-Bold',_sans-serif]"
          >
            Send Now
            <SendHorizonal className="w-5 h-5" />
          </button>
        </div>

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-[#141717] rounded-[20px] p-8 w-[350px] md:w-[420px] shadow-lg relative border border-[#212121]">
              <button
                className="absolute top-4 right-4 text-[#a2a2a2] hover:text-white"
                onClick={() => handleCloseScheduleModal()}
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-white font-['Satoshi-Bold',_sans-serif] text-2xl mb-2">
                Schedule Blast
              </h2>
              <p className="text-[#a2a2a2] font-['Satoshi-Medium',_sans-serif] mb-6">
                Set a date and time to schedule your message.
              </p>
              <div className="flex gap-2 mb-8">
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="bg-[#1c1d1d] text-white border border-[#212121] rounded-[10px] px-4 py-3 text-base font-['Satoshi-Medium',_sans-serif] w-[60%]"
                  min={new Date().toISOString().split('T')[0]}
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="bg-[#1c1d1d] text-white border border-[#212121] rounded-[10px] px-4 py-3 text-base font-['Satoshi-Medium',_sans-serif] w-[40%]"
                />
              </div>
              <button
                className="bg-white rounded-[10px] border border-[#212121] px-4 py-3 w-full flex items-center justify-center gap-2 text-[#171414] text-base font-['Satoshi-Bold',_sans-serif]"
                onClick={() => {
                  sendEmailBlast(id);
                  handleCloseScheduleModal();
                }}
              >
                <span>
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="#171414"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6l4 2"
                    />
                    <circle cx="12" cy="12" r="10" stroke="#171414" strokeWidth="2" />
                  </svg>
                </span>
                Schedule
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h3 className="text-white text-lg font-['Satoshi-Bold',_sans-serif] mb-4">Sent</h3>
        {sent.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#141717] rounded-lg p-4 mb-2 flex flex-row items-start gap-4"
          >
            {/* Avatar */}
            <img
              src={item.image || 'https://randomuser.me/api/portraits/men/32.jpg'}
              alt={item.name}
              className="w-10 h-10 rounded-full object-cover bg-[#333]"
            />
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <span className="text-white font-['Satoshi-Bold',_sans-serif] text-base mr-2">
                  {item.name}
                </span>
                <span className="text-[#a2a2a2] font-['Satoshi-Medium',_sans-serif] text-sm ml-auto">
                  {format(item.sent_date, 'd MMMM yyyy, HH.mm')} WIB
                </span>
              </div>
              <div className="text-[#515151] text-sm mb-1">{item.message}</div>
              <div className="text-[#a2a2a2] text-sm">Sent to: {item.recipients}</div>
            </div>
          </div>
        ))}
      </div>

      <hr className="my-2 border-[#333]" />

      <div className="mb-8 mt-8">
        <h3 className="text-white text-lg font-['Satoshi-Bold',_sans-serif] mb-4">
          System Message
        </h3>
        <div className="flex flex-col space-y-2">
          <div className="bg-[#141717] rounded-lg p-4 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background:
                  'var(--gr-bc-icon, linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%))',
              }}
            >
              <Bell className="text-white w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-white font-['Satoshi-Bold']">Event Reminders</div>
              <div className="text-[#a2a2a2] font-['Satoshi-Medium'] text-sm">
                Guests will receive automatic reminders via email, Whatsapp, and push notifications.
              </div>
            </div>
            <button className="bg-[#1c1d1d] text-[#a2a2a2] px-4 py-2 rounded-lg">Manage</button>
          </div>

          <div className="bg-[#141717] rounded-lg p-4 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background:
                  'var(--gr-bc-icon, linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%))',
              }}
            >
              <MessageSquareText className="text-white w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-white font-['Satoshi-Bold']">Post-Event Feedback</div>
              <div className="text-[#a2a2a2] font-['Satoshi-Medium'] text-sm">
                Set up a feedback email to be sent after the event ends.
              </div>
            </div>
            <button className="bg-[#1c1d1d] text-[#a2a2a2] px-4 py-2 rounded-lg">Schedule</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlastPage;
