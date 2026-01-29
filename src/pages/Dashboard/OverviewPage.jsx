import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  X
} from "lucide-react";
import { format } from 'date-fns';
import axios from 'axios';

const urlBe = import.meta.env.VITE_URL_BE;

function OverviewPage({ id, event }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [targetVisibility, setTargetVisibility] = useState(null);
  const [visibility, setVisibility] = useState(event.visibility === true ? "public" : "private");
  const [eventImage, setEventImage] = useState(event.image || "https://wallpapercave.com/wp/wp9297718.jpg");
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
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
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

  const startDay = format(startDate, 'd');         // contoh: "1"
  const startMonth = format(startDate, 'MMM');     // contoh: "May"
  const formattedStartTime = format(startDate, 'HH:mm');
  const formattedEndTime = format(endDate, 'HH:mm');

  document.title = 'Overview Event - Kebbu';

  const handleVisibleClick = (status) => {
    setTargetVisibility(status === "public" ? true : false);
    setShowModal(true);
  };

  const confirmChange = async () => {
    try {
      // Kirim ke backend
      const res = await axios.put(`${urlBe}/events/update/${id}`,
        {
          visibility: targetVisibility,
        },
        {
          headers: {
            'x-jdticket': localStorage.getItem('token') || '',
          }
        }
      );

      if (res.data.code === "1") {
        setVisibility(targetVisibility);
        setShowModal(false);
        window.location.reload();
      } else {
        alert("Gagal update: " + res.data.message);
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

      const res = await axios.put(`${urlBe}/events/update/${id}`, 
        { image: imgUrl },
        {
          headers: {
            'x-jdticket': localStorage.getItem('token') || '',
          }
        }
      );

      if (res.data.code === "1") {
        setEventImage(imgUrl);
        setImageFile(null);
        alert('Image updated successfully');
      } else {
        alert("Gagal update: " + res.data.message);
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
          key: "AIzaSyDBnmmNXN3uCvSfjxeGafgUnRxtWxxLbOw",
          components: "country:ID"
        },
        headers: {
          "x-requested-with": "XMLHttpRequest"
        }
      });
      setLocationSuggestions(response.data.predictions);
    } catch (error) {
      console.error("Error fetching Google Places suggestions", error);
    }
  };

  const formatDateTime = (dateObj, timeObj) => {
    const date = new Date(dateObj);
    const time = new Date(timeObj);
    date.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
    return date.toISOString();
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
        }
      });

      if (res.data.code === "1") {
        alert('Event updated successfully');
        setShowEditModal(false);
        // Refresh event data
        window.location.reload();
      } else {
        alert("Gagal update: " + res.data.message);
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
      icon: <UserPlus className="w-6 h-6 text-white" />,
      label: "Create Invitation",
      onClick: () => console.log("Invite"),
    },
    {
      icon: <Send className="w-6 h-6 text-white" />,
      label: "Send a Blast",
      onClick: () => console.log("Blast"),
    },
    {
      icon: <Share2 className="w-6 h-6 text-white" />,
      label: "Share Event",
      onClick: () => console.log("Share"),
    },
  ];

  const salesData = [
    {
      label: "Total Sales",
      value: event.total_sales,
      trend: "up",
      percent: "20%",
      color: "green",
    },
    {
      label: "Tickets Sold",
      value: event.ticket_sold + "/" + (event.total_ticket === null ? "∞" : event.total_ticket),
      trend: "down",
      percent: "18%",
      color: "red",
    },
    {
      label: "Total Visitor",
      value: event.total_visitor,
      trend: "up",
      percent: "75%",
      color: "green",
    },
  ];


  return (
    <div>
      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-4">
        {actions.map(({ icon, label, onClick }, i) => (
          <button
            key={i}
            onClick={onClick}
            className="w-full flex gap-3 bg-[#141717] rounded-xl px-4"
          >
            <div
              className="p-1 rounded-md flex w-8 h-8"
              style={{
                background: "var(--backgroundd, linear-gradient(90deg, rgba(68, 160, 141, 1) 0%, rgba(0, 89, 79, 1) 100%))",
                color: "#fff"
              }}
            >
              {icon}
            </div>
            <span className="text-white font-['Satoshi-Bold',_sans-serif] text-lg">{label}</span>
          </button>
        ))}
      </div>

      {/* Event Card */}
      <div className="bg-[#141717] rounded-xl mt-6 p-5 flex gap-6 items-start text-white font-satoshi">
        {/* Left: Image */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 cursor-pointer hover:opacity-80 transition rounded-lg overflow-hidden"
          title="Click to edit image"
        >
          <img
            src={eventImage}
            alt="event"
            className="w-[250px] h-[250px] object-cover rounded-lg"
          />
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

        {/* Right: Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h1 className="text-responsive-title mb-4">{event.name}</h1>
            <button onClick={() => setShowEditModal(true)} className="flex items-center gap-1 text-sm text-white bg-[#1c1d1d] px-3 py-1 rounded-lg border border-[#212121] hover:bg-[#2a2a2a] transition">
              Edit Event
              <PencilLine className="w-4 h-4" />
            </button>
          </div>

          {/* Date */}
          <div className="flex items-start gap-3 mb-6 mt-2">
            <div className="w-11 h-11 rounded-lg border border-[#666] flex items-center justify-center">
              <CalendarDays className="text-white w-6 h-6" />
            </div>
            <div>
              <div className="text-base font-['Satoshi-Bold',_sans-serif]">{formattedStartDate}</div>
              <div className="text-sm text-[#A2A2A2] font-['Satoshi-Regular']">{formattedStartTime} - {formattedEndTime} WIB</div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3 mb-6">
            <div className="w-11 h-11 rounded-lg border border-[#666] flex items-center justify-center">
              <MapPin className="text-white w-6 h-6" />
            </div>
            <div>
              <div className="text-base font-['Satoshi-Bold',_sans-serif]">{event.location_name}</div>
              <div className="text-sm text-[#A2A2A2] font-['Satoshi-Regular']">
                {event.location_address}
              </div>
            </div>
          </div>

          {/* Start Check-In */}
          <Link
            to={`/event-user-scan/${id}`}
            className="w-full bg-[#00594f] text-white py-3 rounded-lg text-responsive-sub-title flex items-center justify-center gap-2 hover:bg-[#35796f] hover:text-white transition"
          >
            <ScanLine className="w-5 h-5" />
            Start Check-In
          </Link>
        </div>
      </div>

      {/* Registration Info */}
      <div className="bg-transparent pt-6 rounded-xl font-satoshi text-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-['Satoshi-Bold',_sans-serif]">Guests</div>
          <button className="text-sm bg-[#1e1e1e] border border-[#333] px-3 py-1 rounded-lg hover:bg-[#2a2a2a]">
            View All
          </button>
        </div>

        {/* Stats */}
        <div className="flex justify-between mb-6">
          <div className="flex gap-10">
            <div className="flex items-start gap-2">
              <span className="text-2xl font-['Satoshi-Bold',_sans-serif]">{event.checkin_guest}/{event.total_guest}</span>
              <div className="text-sm text-[#A2A2A2] leading-tight">
                <div>Guests</div>
                <div>Checked in</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-2xl font-['Satoshi-Bold',_sans-serif]">{event.checkin_invitees}/{event.total_invitees}</span>
              <div className="text-sm text-[#A2A2A2] leading-tight">
                <div>Invitees</div>
                <div>Checked in</div>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-2xl font-['Satoshi-Bold',_sans-serif]">{event.total_checkin}/{event.total_registered}</span>
            <div className="text-sm text-[#A2A2A2] leading-tight">
              <div>Total</div>
              <div>Registered</div>
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="bg-[#1A1A1A] rounded-xl overflow-hidden divide-y divide-[#2a2a2a]">
          {event.user_checkin.map((user, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              {/* Left: Avatar & Name */}
              <div className="flex items-center gap-3">
                <img
                  src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="font-medium">{user.name}</div>
                <div className="text-[#A2A2A2] text-xs">{user.email}</div>
              </div>

              {/* Center: Role */}
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${user.role === "GUEST"
                    ? "border-green-600 text-green-300"
                    : "border-blue-600 text-blue-300"
                    }`}
                >
                  {user.role}
                </span>
              </div>

              {/* Right: Time */}
              <div className="text-[#A2A2A2] text-sm">{format(new Date(user.date), 'HH:mm')} WIB</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sales Report */}
      <div className="font-satoshi text-white pt-6">
        {/* Heading */}
        <div className="mb-2 text-lg font-['Satoshi-Bold',_sans-serif]">Sales Report</div>
        <p className="text-sm text-[#A2A2A2] mb-4">
          Track how your tickets are selling—see total sales, tickets sold, and total visitor.
        </p>

        {/* Card Grid */}
        <div className="flex gap-4 flex-wrap">
          {salesData.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#1a1a1a] rounded-xl px-4 pt-4 w-full max-w-[280px] flex-1"
            >
              {/* Top row: Label kiri, All Time kanan */}
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-[#A2A2A2]">{item.label}</div>
                <span className="text-xs text-[#A2A2A2]">All time</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xl font-['Satoshi-Bold',_sans-serif] mb-3">
                  {item.value}
                </div>
                {/* Bottom: Trend (icon + percent) */}
                <div
                  className={`inline-flex items-center gap-1 px-2 py-[2px] text-xs font-medium rounded-md ${item.color === "green"
                    ? "bg-green-900 text-green-400"
                    : "bg-red-900 text-red-400"
                    }`}
                >
                  {item.trend === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {item.percent}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hosts */}
      <div className="font-satoshi text-white pt-6">
        {/* Heading */}
        <div className="mb-2 text-lg font-['Satoshi-Bold',_sans-serif]">Hosts</div>
        <p className="text-sm text-[#A2A2A2] mb-4">
          Manage your event team and special guests here.
        </p>

        {/* Host List */}
        <div className="space-y-3">
          {event.hosts.map((host, index) => (
            <div
              key={index}
              className="bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between"
            >
              {/* Left: Avatar, Name, Email */}
              <div className="flex items-center gap-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    host.name
                  )}&background=random&bold=true`}
                  alt={host.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="font-medium">{host.name}</div>
                <div className="text-sm text-[#A2A2A2]">{host.email}</div>
              </div>

              {/* Right: Role Badge + Add Button (only first) */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full border ${host.role === "Creator"
                    ? "border-green-600 text-green-300"
                    : "border-blue-600 text-blue-300"
                    }`}
                >
                  {host.role}
                </span>

                {index === 0 && (
                  <button className="text-sm bg-[#1e1e1e] border border-[#333] px-3 py-1 rounded-lg hover:bg-[#2a2a2a] flex items-center gap-1">
                    Add Host <span className="text-lg leading-none">+</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visibility */}
      <div className="font-satoshi text-white pt-6">
        {/* Heading */}
        <div className="mb-2 text-lg font-['Satoshi-Bold',_sans-serif]">Visibility & Discovery</div>
        <p className="text-sm text-[#A2A2A2] mb-4">
          Manage how your event appears on search and listings.
        </p>

        {/* Toggle Buttons */}
        <div className="flex gap-4 w-full">
          {/* Public Button */}
          <button
            onClick={() => handleVisibleClick("public")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm w-full
              ${visibility === "public"
                ? "border-[#3DAA95] bg-[#1a1a1a] text-white"
                : "border-transparent bg-[#1a1a1a] text-gray-500"
              }`}
          >
            <Eye className="w-4 h-4" />
            Public
          </button>

          {/* Private Button */}
          <button
            onClick={() => handleVisibleClick("private")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm w-full
              ${visibility === "private"
                ? "border-[#3DAA95] bg-[#1a1a1a] text-white"
                : "border-transparent bg-[#1a1a1a] text-gray-500"
              }`}
          >
            <EyeOff className="w-4 h-4" />
            Private
          </button>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1a1a1a] p-6 rounded-xl w-full max-w-sm text-white">
            <div className="text-lg font-semibold mb-4">
              {targetVisibility === false
                ? "Make this event private?"
                : "Make this event public?"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setShowCropper(false)}>
          <div className="bg-[#181818] rounded-xl p-6 shadow-lg w-[90vw] max-w-lg relative" onClick={e => e.stopPropagation()}>
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
                onChange={e => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded"
                onClick={() => setShowCropper(false)}
              >Cancel</button>
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
              >Crop & Use</button>
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
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full bg-[#141717] border border-[#333] text-white rounded px-3 py-2 focus:outline-none focus:border-[#3DAA95]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-white text-sm font-semibold block mb-2">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
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
                      setEditFormData({...editFormData, location_address: e.target.value});
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
                              location_address: suggestion.description
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
                  <DatePicker
                    selected={editFormData.start_date}
                    onChange={(date) => setEditFormData({...editFormData, start_date: date})}
                    dateFormat="dd/MM/yyyy"
                    className="w-full bg-[#141717] border border-[#333] text-white rounded px-3 py-2 focus:outline-none focus:border-[#3DAA95]"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-semibold block mb-2">Start Time</label>
                  <DatePicker
                    selected={editFormData.start_date}
                    onChange={(date) => setEditFormData({...editFormData, start_date: date})}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    dateFormat="HH:mm"
                    className="w-full bg-[#141717] border border-[#333] text-white rounded px-3 py-2 focus:outline-none focus:border-[#3DAA95]"
                  />
                </div>
              </div>

              {/* End Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-semibold block mb-2">End Date</label>
                  <DatePicker
                    selected={editFormData.end_date}
                    onChange={(date) => setEditFormData({...editFormData, end_date: date})}
                    dateFormat="dd/MM/yyyy"
                    className="w-full bg-[#141717] border border-[#333] text-white rounded px-3 py-2 focus:outline-none focus:border-[#3DAA95]"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-semibold block mb-2">End Time</label>
                  <DatePicker
                    selected={editFormData.end_date}
                    onChange={(date) => setEditFormData({...editFormData, end_date: date})}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    dateFormat="HH:mm"
                    className="w-full bg-[#141717] border border-[#333] text-white rounded px-3 py-2 focus:outline-none focus:border-[#3DAA95]"
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
  )
}

export default OverviewPage;