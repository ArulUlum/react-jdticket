import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  getMonth,
  getYear,
  format,
} from 'date-fns';
import axios from 'axios';
import {
  UserPlus,
  Send,
  Share2,
  MapPin,
  PencilLine,
  ScanLine,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  CalendarDays,
  Calendar,
  Clock,
  X,
} from 'lucide-react';

const urlBe = import.meta.env.VITE_URL_BE;

function OverviewPage({ id, event }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [targetVisibility, setTargetVisibility] = useState(null);
  const [visibility, setVisibility] = useState(event.visibility === true ? 'public' : 'private');
  const [eventImage, setEventImage] = useState(
    event.image || 'https://wallpapercave.com/wp/wp9297718.jpg',
  );
  const [imageFile, setImageFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rawImage, setRawImage] = useState(null);
  const fileInputRef = useRef(null);

  // Edit Event Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: event.name || '',
    description: event.description || '',
    location: event.location || '',
    location_name: event.location_name || '',
    location_address: event.location_address || '',
    start_date: new Date(event.start_date),
    end_date: new Date(event.end_date),
  });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Helper to convert dataURL to File
  function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    for (var i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  const formattedStartDate = format(startDate, 'EEE, d MMM yyyy');

  const startDay = format(startDate, 'd'); // contoh: "1"
  const startMonth = format(startDate, 'MMM'); // contoh: "May"
  const formattedStartTime = format(startDate, 'HH:mm');
  const formattedEndTime = format(endDate, 'HH:mm');

  document.title = 'Overview Event - Kebbu';

  const handleVisibleClick = (status) => {
    setTargetVisibility(status === 'public' ? true : false);
    setShowModal(true);
  };

  const confirmChange = async () => {
    try {
      // Kirim ke backend
      const res = await axios.put(
        `${urlBe}/events/update/${id}`,
        {
          visibility: targetVisibility,
        },
        {
          headers: {
            'x-jdticket': localStorage.getItem('token') || '',
          },
        },
      );

      if (res.data.code === '1') {
        setVisibility(targetVisibility);
        setShowModal(false);
        window.location.reload();
      } else {
        alert('Gagal update: ' + res.data.message);
      }
    } catch (error) {
      if (error.response) {
        alert(`(${error.response.status}) ${error.response.data?.message || 'Server Error'}`);
      } else if (error.request) {
        alert('No response from server');
      } else {
        alert('Unexpected error' + error);
      }
    }
  };

  const handleImageUploadDirect = async (file) => {
    if (!file) {
      return;
    }

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const saveImgRes = await axios.post(`${urlBe}/image/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imgUrl = saveImgRes.data.img_url;

      const res = await axios.put(
        `${urlBe}/events/update/${id}`,
        { image: imgUrl },
        {
          headers: {
            'x-jdticket': localStorage.getItem('token') || '',
          },
        },
      );

      if (res.data.code === '1') {
        setEventImage(imgUrl);
        setImageFile(null);
        alert('Image updated successfully');
      } else {
        alert('Gagal update: ' + res.data.message);
      }
    } catch (error) {
      if (error.response) {
        alert(`(${error.response.status}) ${error.response.data?.message || 'Server Error'}`);
      } else if (error.request) {
        alert('No response from server');
      } else {
        alert('Unexpected error: ' + error);
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Location autocomplete for edit modal
  const fetchLocationSuggestions = async (input) => {
    try {
      const response = await axios.get(`${urlBe}/image/autocomplete`, {
        params: {
          input,
          key: 'AIzaSyDBnmmNXN3uCvSfjxeGafgUnRxtWxxLbOw',
          components: 'country:ID',
        },
        headers: {
          'x-requested-with': 'XMLHttpRequest',
        },
      });
      setLocationSuggestions(response.data.predictions);
    } catch (error) {
      console.error('Error fetching Google Places suggestions', error);
    }
  };

  const formatDateTime = (dateObj, timeObj) => {
    const date = new Date(dateObj);
    const time = new Date(timeObj);

    date.setHours(time.getHours());
    date.setMinutes(time.getMinutes());
    date.setSeconds(time.getSeconds());

    const pad = (num) => String(num).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // 0-indexed
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleEditSubmit = async () => {
    try {
      setIsSubmittingEdit(true);
      const startDateTime = formatDateTime(editFormData.start_date, editFormData.start_date);
      const endDateTime = formatDateTime(editFormData.end_date, editFormData.end_date);

      const updateData = {
        name: editFormData.name,
        description: editFormData.description,
        location: editFormData.location,
        location_name: editFormData.location_name,
        location_address: editFormData.location_address,
        start_date: startDateTime,
        end_date: endDateTime,
      };

      const res = await axios.put(`${urlBe}/events/update/${id}`, updateData, {
        headers: {
          'x-jdticket': localStorage.getItem('token') || '',
        },
      });

      if (res.data.code === '1') {
        alert('Event updated successfully');
        setShowEditModal(false);
        // Refresh event data
        window.location.reload();
      } else {
        alert('Gagal update: ' + res.data.message);
      }
    } catch (error) {
      if (error.response) {
        alert(`(${error.response.status}) ${error.response.data?.message || 'Server Error'}`);
      } else if (error.request) {
        alert('No response from server');
      } else {
        alert('Unexpected error: ' + error);
      }
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const actions = [
    {
      icon: <UserPlus className="w-6 h-6 text-black" />,
      label: 'Create Invitation',
      onClick: () => console.log('Invite'),
    },
    {
      icon: <Send className="w-6 h-6 text-black" />,
      label: 'Send a Blast',
      onClick: () => console.log('Blast'),
    },
    {
      icon: <Share2 className="w-6 h-6 text-black" />,
      label: 'Share Event',
      onClick: () => console.log('Share'),
    },
  ];

  const salesData = [
    {
      label: 'Total Sales',
      value: event.total_sales,
      trend: 'up',
      percent: '20%',
      color: 'green',
    },
    {
      label: 'Tickets Sold',
      value: event.ticket_sold + '/' + (event.total_ticket === null ? '∞' : event.total_ticket),
      trend: 'down',
      percent: '18%',
      color: 'red',
    },
    {
      label: 'Total Visitor',
      value: event.total_visitor,
      trend: 'up',
      percent: '75%',
      color: 'green',
    },
  ];

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto w-full max-w-[1120px]">
      <div className="grid gap-3 grid-cols-3">
        {actions.map(({ icon, label, onClick }, i) => (
          <button
            key={i}
            onClick={onClick}
            className="h-11 rounded-lg border border-white/60 bg-gradient-to-br from-[#001C19] to-[#090909] px-3 py-1.5"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#D9FF1A]">
                {icon}
              </span>
              <span className="text-xs font-bold sm:text-sm">{label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 w-full rounded-3xl border border-white/60 bg-gradient-to-br from-[#001C19] to-[#090909] p-3 sm:p-4 lg:p-5">
        <div className="flex flex-row items-start gap-3 sm:gap-4 lg:gap-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-[110px] w-[110px] shrink-0 cursor-pointer overflow-hidden rounded-2xl sm:h-[130px] sm:w-[130px] lg:h-[215px] lg:w-[215px]"
            title="Click to edit image"
          >
            <img src={eventImage} alt="event" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-[20px] leading-[1.12] font-bold sm:text-[24px] lg:text-[38px]">{event.name}</h1>
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#212121] bg-[#1C1D1D] px-2 py-1 text-[10px] leading-4 text-white/90 hover:bg-[#242525] sm:px-3 sm:py-1.5 sm:text-xs"
                title="Edit Event"
              >
                <span>Edit Event</span>
                <PencilLine className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>
            </div>

            <div className="mt-2.5 flex items-start gap-2.5 sm:mt-3 sm:gap-3">
              <div className="h-9 w-9 overflow-hidden rounded-lg border border-white/80 sm:h-11 sm:w-11 lg:h-12 lg:w-12">
                <div className="border-b border-white/80 px-1.5 py-0.5 text-center text-[9px] leading-none text-[#A2A2A2] lg:text-[10px]">
                  {startMonth}
                </div>
                <div className="flex h-[22px] items-center justify-center text-[14px] leading-none sm:h-[26px] sm:text-[18px] lg:h-[28px] lg:text-[22px]">
                  {startDay}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[13px] leading-[1.25] font-semibold sm:text-[16px] lg:text-[24px]">
                  {formattedStartDate}
                </div>
                <div className="text-[11px] leading-[1.25] text-[#A2A2A2] sm:text-[12px] lg:text-[19px]">
                  {formattedStartTime} - {formattedEndTime} WIB
                </div>
              </div>
            </div>

            <div className="mt-2.5 flex items-start gap-2.5 sm:mt-3 sm:gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/80 sm:h-11 sm:w-11 lg:h-12 lg:w-12">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[14px] leading-[1.2] font-semibold sm:text-[17px] lg:text-[26px]">
                  {event.location_name}
                </div>
                <div className="text-[10px] leading-[1.25] text-[#A2A2A2] sm:text-[11px] lg:text-[17px]">
                  {event.location_address}
                </div>
              </div>
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                const img = new window.Image();
                img.src = reader.result;
                img.onload = () => {
                  if (img.width !== img.height) {
                    setRawImage(reader.result);
                    setImageFile(file);
                    setShowCropper(true);
                  } else {
                    setEventImage(reader.result);
                    setImageFile(file);
                    setTimeout(() => {
                      setImageFile(file);
                      handleImageUploadDirect(file);
                    }, 0);
                  }
                };
              };
              reader.readAsDataURL(file);
              e.target.value = null;
            }
          }}
        />
        <Link
          to={`/event-user-scan/${id}`}
          className="mt-4 flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#D9FF4A] text-base font-semibold text-[#141717] sm:text-lg lg:mt-5 lg:text-[30px]"
        >
          <ScanLine className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
          Start Check-In
        </Link>
      </div>

      <div className="mt-5 border-t border-white/40 pt-4">
        <div className="flex items-center justify-between">
          <div className="text-[10px] leading-[10px] font-bold lg:text-sm lg:leading-4">Guests</div>
          <button className="rounded-[4px] border border-[#212121] bg-[#1C1D1D] px-2 py-1 text-[10px] leading-[10px] lg:text-xs lg:leading-3">
            View All
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-[7px] leading-[7px] lg:text-[11px] lg:leading-[12px]">
          <div>
            <div className="text-[17px] leading-[10px] font-medium lg:text-[22px] lg:leading-[16px]">{event.checkin_guest}/{event.total_guest}</div>
            <div className="text-[#A2A2A2]">Guests Checked in</div>
          </div>
          <div>
            <div className="text-[17px] leading-[10px] font-medium lg:text-[22px] lg:leading-[16px]">{event.checkin_invitees}/{event.total_invitees}</div>
            <div className="text-[#A2A2A2]">Invitees Checked in</div>
          </div>
          <div className="text-right">
            <div className="text-[17px] leading-[10px] font-medium lg:text-[22px] lg:leading-[16px]">{event.total_checkin}/{event.total_registered}</div>
            <div className="text-[#A2A2A2]">Total Registered</div>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-[4px] border border-white/60 ">
          {event.user_checkin.map((user, index) => (
            <div
              key={index}
              className={`flex items-center justify-between px-2.5 py-2 lg:px-3 lg:py-2.5 ${index > 0 ? 'border-t border-white/20' : ''}`}
            >
              <div className="flex items-center gap-2">
                <img
                  src={
                    user.image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
                  }
                  alt={user.name}
                  className="h-[10px] w-[10px] rounded-full object-cover lg:h-6 lg:w-6"
                />
                <div>
                  <div className="text-[8px] leading-[10px] font-medium lg:text-sm lg:leading-4">{user.name}</div>
                  <div className="text-[8px] leading-[10px] text-[#A2A2A2] lg:text-xs lg:leading-[14px]">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[6px] leading-[10px] lg:text-[10px] lg:leading-3 ${
                    user.role === 'GUEST'
                      ? 'bg-[#31D34F]/10 text-[#31D34F]'
                      : 'bg-[#303030] text-[#A2A2A2]'
                  }`}
                >
                  {user.role}
                </span>
                <span className="text-[8px] leading-[10px] text-[#A2A2A2] lg:text-xs lg:leading-[14px]">{format(new Date(user.date), 'HH:mm')} WIB</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-white/40 pt-4">
        <div className="flex items-center justify-between">
          <div className="text-[10px] leading-[10px] font-bold lg:text-sm lg:leading-4">Sales Report</div>
          <button className="rounded-[4px] border border-[#212121] bg-[#1C1D1D] px-2 py-1 text-[10px] leading-[10px] lg:text-xs lg:leading-3">
            View All
          </button>
        </div>
        <p className="mt-2 text-[8px] leading-[10px] text-[#A2A2A2] lg:text-[13px] lg:leading-[16px]">
          Track how your tickets are selling-see total sales, tickets sold, and total visitor.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {salesData.map((item, idx) => (
            <div
              key={idx}
              className="rounded-[4px] border border-white/60  px-2.5 py-2"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[7px] leading-[7px] lg:text-[13px] lg:leading-[10px]">{item.label}</div>
                <span className="text-[7px] leading-[7px] text-[#A2A2A2] lg:text-[13px] lg:leading-[10px]">All time</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[10px] leading-[10px] font-medium lg:text-base lg:leading-5">{String(item.value)}</div>
                <div
                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[7px] leading-[7px] lg:text-[10px] lg:leading-[10px] ${
                    item.color === 'green'
                      ? 'bg-[#31D34F]/15 text-[#31D34F]'
                      : 'bg-[#F94D4D]/15 text-[#F94D4D]'
                  }`}
                >
                  {item.trend === 'up' ? (
                    <TrendingUp className="h-2 w-2 lg:h-2.5 lg:w-2.5" />
                  ) : (
                    <TrendingDown className="h-2 w-2 lg:h-2.5 lg:w-2.5" />
                  )}
                  {item.percent}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-white/40 pt-4">
        <div className="text-[10px] leading-[10px] font-bold lg:text-sm lg:leading-4">Hosts</div>
        <p className="mt-2 text-[8px] leading-[10px] text-[#A2A2A2] lg:text-xs lg:leading-[16px]">Manage your event team and special guests here.</p>
        <div className="mt-3 space-y-2">
          {event.hosts.map((host, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-[4px] border border-white/60  px-2.5 py-2 lg:px-3 lg:py-2.5"
            >
              <div className="flex items-center gap-2">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    host.name,
                  )}&background=random&bold=true`}
                  alt={host.name}
                  className="h-[10px] w-[10px] rounded-full object-cover lg:h-6 lg:w-6"
                />
                <div className="text-[8px] leading-[10px] lg:text-sm lg:leading-4">{host.name}</div>
                <div className="text-[8px] leading-[10px] text-[#A2A2A2] lg:text-xs lg:leading-[14px]">{host.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-[#00594F] px-2 py-0.5 text-[8px] leading-[10px] lg:text-xs lg:leading-3">
                  {host.role}
                </span>
                {index === 0 && (
                  <button className="rounded-[4px] border border-[#212121] bg-[#1C1D1D] px-2 py-1 text-[8px] leading-[10px] lg:text-xs lg:leading-3">
                    Add Host +
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-white/40 pt-4">
        <div className="text-[10px] leading-[10px] font-bold lg:text-sm lg:leading-4">Visibility & Discovery</div>
        <p className="mt-2 text-[8px] leading-[10px] text-[#A2A2A2] lg:text-xs lg:leading-[16px]">
          Manage how your event appears on search and listings.
        </p>
        <div className="mt-3 flex gap-3">
          <button
            onClick={() => handleVisibleClick('public')}
            className={`flex h-[30px] flex-1 items-center justify-center gap-2 rounded-[4px] border text-[8px] leading-[10px] lg:h-10 lg:text-sm lg:leading-4 ${
              visibility === 'public'
                ? 'border-[#D9FF1A]  text-white'
                : 'border-white/60  text-[#A2A2A2]'
            }`}
          >
            <Eye className="h-2.5 w-2.5 lg:h-3.5 lg:w-3.5" />
            Public
          </button>
          <button
            onClick={() => handleVisibleClick('private')}
            className={`flex h-[30px] flex-1 items-center justify-center gap-2 rounded-[4px] border text-[8px] leading-[10px] lg:h-10 lg:text-sm lg:leading-4 ${
              visibility === 'private'
                ? 'border-[#D9FF1A]  text-white'
                : 'border-white/60  text-[#A2A2A2]'
            }`}
          >
            <EyeOff className="h-2.5 w-2.5 lg:h-3.5 lg:w-3.5" />
            Private
          </button>
        </div>
      </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1a1a1a] p-6 rounded-xl w-full max-w-sm text-white">
            <div className="text-lg font-semibold mb-4">
              {targetVisibility === false ? 'Make this event private?' : 'Make this event public?'}
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmChange}
                className="px-4 py-2 rounded bg-[#3DAA95] text-black font-semibold"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cropper Modal */}
      {showCropper && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => setShowCropper(false)}
        >
          <div
            className="bg-[#181818] rounded-xl p-6 shadow-lg w-[90vw] max-w-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white text-lg mb-4">Crop Image to 1:1</h2>
            <div className="relative w-full h-[350px] bg-black">
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
              />
            </div>
            <div className="flex gap-4 mt-4">
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded"
                onClick={() => setShowCropper(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#00594F] text-white px-4 py-2 rounded"
                onClick={async () => {
                  const croppedImg = await getCroppedImg(rawImage, croppedAreaPixels);
                  setEventImage(croppedImg);
                  const croppedFile = dataURLtoFile(croppedImg, 'event-image.png');
                  setImageFile(croppedFile);
                  setShowCropper(false);
                  await handleImageUploadDirect(croppedFile);
                }}
              >
                Crop & Use
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Event</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Event Name */}
              <div>
                <label className="text-white text-sm font-semibold block mb-2">Event Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-[#141717] border border-[#333] text-white rounded px-3 py-2 focus:outline-none focus:border-[#3DAA95]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-white text-sm font-semibold block mb-2">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  className="w-full bg-[#141717] border border-[#333] text-white rounded px-3 py-2 focus:outline-none focus:border-[#3DAA95] h-24 resize-none"
                />
              </div>

              {/* Location with Autocomplete */}
              <div>
                <label className="text-white text-sm font-semibold block mb-2">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    value={editFormData.location_address}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, location_address: e.target.value });
                      if (e.target.value.length > 2) {
                        fetchLocationSuggestions(e.target.value);
                        setShowLocationOptions(true);
                      }
                    }}
                    onFocus={() => editFormData.location_address && setShowLocationOptions(true)}
                    className="w-full bg-[#141717] border border-[#333] text-white rounded px-3 py-2 focus:outline-none focus:border-[#3DAA95]"
                    placeholder="Search location..."
                  />

                  {showLocationOptions && locationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#141717] border border-[#333] rounded max-h-48 overflow-y-auto z-50">
                      {locationSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setEditFormData({
                              ...editFormData,
                              location: suggestion.place_id,
                              location_name: suggestion.main_text,
                              location_address: suggestion.description,
                            });
                            setShowLocationOptions(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[#2a2a2a] text-white border-b border-[#333] last:border-b-0"
                        >
                          <div className="font-semibold">{suggestion.main_text}</div>
                          <div className="text-xs text-gray-400">{suggestion.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Start Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-semibold block mb-2">Start Date</label>
                  <DatePickerBox
                    value={editFormData.start_date}
                    onChange={(date) => setEditFormData({ ...editFormData, start_date: date })}
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-semibold block mb-2">Start Time</label>
                  <TimePickerBox
                    value={editFormData.start_date}
                    onChange={(date) => setEditFormData({ ...editFormData, start_date: date })}
                  />
                </div>
              </div>

              {/* End Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-semibold block mb-2">End Date</label>
                  <DatePickerBox
                    value={editFormData.end_date}
                    onChange={(date) => setEditFormData({ ...editFormData, end_date: date })}
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-semibold block mb-2">End Time</label>
                  <TimePickerBox
                    value={editFormData.end_date}
                    onChange={(date) => setEditFormData({ ...editFormData, end_date: date })}
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 text-white bg-[#2a2a2a] border border-[#333] rounded hover:bg-[#333] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={isSubmittingEdit}
                className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-[#44A08D] to-[#00594F] rounded hover:opacity-90 transition disabled:opacity-50"
              >
                {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const DatePickerBox = ({ value, onChange }) => {
  // Custom UI yang tidak pakai <input>
  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
    <div
      onClick={onClick}
      ref={ref}
      className="flex items-center justify-between bg-[#0f0f0f] border border-strokesss rounded-lg p-4 cursor-pointer w-full"
    >
      <div className="flex items-center gap-2.5 w-full">
        <Calendar className="w-5 h-5 text-white" />
        <span className="text-white text-base font-['Satoshi-Medium']">
          {value || 'Select date'}
        </span>
      </div>
      <span className="text-white text-sm">▼</span>
    </div>
  ));

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const customDateHeader = ({ date, changeMonth, changeYear }) => (
    <div className="flex justify-between items-center px-4 py-2 text-white">
      <select
        value={getMonth(date)}
        onChange={({ target: { value } }) => changeMonth(value)}
        className="bg-[#141717] text-white px-2 py-1 rounded"
      >
        {months.map((label, index) => (
          <option key={label} value={index}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={getYear(date)}
        onChange={({ target: { value } }) => changeYear(value)}
        className="bg-[#141717] text-white px-2 py-1 rounded"
      >
        {Array(30)
          .fill(0)
          .map((_, i) => {
            const year = 2000 + i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
      </select>
    </div>
  );

  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      dateFormat="EEE, MMM d"
      customInput={<CustomDateInput />}
      // renderCustomHeader={customDateHeader}
      calendarClassName="custom-calendar"
    />
  );
};

const TimePickerBox = ({ value, onChange }) => {
  const CustomTimeInput = React.forwardRef(({ value, onClick }, ref) => (
    <div
      onClick={onClick}
      ref={ref}
      className="flex items-center justify-between bg-[#0f0f0f] border border-strokesss rounded-lg p-4 cursor-pointer w-full"
    >
      <div className="flex items-center gap-2.5 w-full">
        <Clock className="w-5 h-5 text-white" />
        <span className="text-white text-base font-['Satoshi-Medium']">
          {value || 'Select time'}
        </span>
      </div>
      <span className="text-white text-sm">▼</span>
    </div>
  ));

  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={30}
      timeCaption="Time"
      dateFormat="HH:mm"
      timeFormat="HH:mm"
      customInput={<CustomTimeInput />}
    />
  );
};

export default OverviewPage;
