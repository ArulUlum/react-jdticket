// Import yang dibutuhkan
import React, { useState, useRef } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, addMinutes, getMonth, getYear } from 'date-fns';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Eye,
  EyeOff,
  Calendar,
  Clock,
  MapPin,
  Edit,
  CreditCard,
  Lock,
  Unlock,
  X,
  Users,
  Video,
  ImagePlus 
} from "lucide-react";

const urlBe = import.meta.env.VITE_URL_BE;

function CreateEvent() {
  const now = new Date();
  const roundedNow = new Date(Math.ceil(now.getTime() / (30 * 60000)) * 30 * 60000);
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

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    start: '',
    end: '',
    location: '',
    description: '',
    capacity: '',
  });
  const [tickets, setTickets] = useState([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [ticketInput, setTicketInput] = useState({ name: '', price: '', max_capacity: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [visibility, setVisibility] = useState("Public");
  const [showVisibilityOptions, setShowVisibilityOptions] = useState(false);
  const [startDate, setStartDate] = useState(now);
  const [endDate, setEndDate] = useState(now);
  const [startTime, setStartTime] = useState(roundedNow);
  const [endTime, setEndTime] = useState(addMinutes(roundedNow, 60));
  const [locationInput, setLocationInput] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  const [showMaps, setShowMaps] = useState(false);
  const [capacityMode, setCapacityMode] = useState("unlimited");
  const [customCapacity, setCustomCapacity] = useState("");
  const [eventType, setEventType] = useState("Free Event");
  const [showEventTypeOptions, setShowEventTypeOptions] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [eventImage, setEventImage] = useState("https://wallpapercave.com/wp/wp9297718.jpg");
  const [eventImageFile, setEventImageFile] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rawImage, setRawImage] = useState(null);
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [locationName, setlocationName] = useState("");
  const [locationAddress, setlocationAddress] = useState("");
  const [tags, setTags] = useState("");
  document.title = 'Create Event - Kebbu';

  const fetchLocationSuggestions = async (input) => {
    try {
      const response = await axios.get(`${urlBe}/image/autocomplete`, {
        params: {
          input,
          key: "AIzaSyDBnmmNXN3uCvSfjxeGafgUnRxtWxxLbOw",
          components: "country:ID"
        },
        headers: {
          "x-requested-with" : "XMLHttpRequest"
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

    // Gabungkan tanggal dari `dateObj` dan jam/menit/detik dari `timeObj`
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


  const handleSaveDraft = async (e) => {
    e.preventDefault();
    const payload = {
      name: eventName,
      description: description,
      visibility: (visibility === "Public" ? true : false),
      start_date: formatDateTime(startDate, startTime),
      end_date: formatDateTime(endDate, endTime),
      location: locationInput,
      max_capacity: capacityMode === "unlimited" ? null : parseInt(capacityMode),
      list_ticket: tickets,
      approval: requireApproval
    };
    console.log(payload)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const tickets = {
      name: eventType === "Free Event" ? "Free" : "Paid",
      price: price,
      max_capacity: null,
    };

    try {
      let imgUrl = eventImage; // default kosong

      if (eventImageFile) {
        const formData = new FormData();
        formData.append("image", eventImageFile);

        const saveImgRes = await axios.post(`${urlBe}/image/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        imgUrl = saveImgRes.data.img_url; 
      }

      const payload = {
        name: eventName,
        image: imgUrl,
        description: description,
        visibility: visibility === "Public" ? true : false,
        start_date: formatDateTime(startDate, startTime),
        end_date: formatDateTime(endDate, endTime),
        location: locationInput,
        location_name: locationName,
        location_address: locationAddress,
        max_capacity: capacityMode === "unlimited" ? null : parseInt(capacityMode),
        tickets: tickets,
        approval: requireApproval
      };
      
      const response = await axios.post(
        `${urlBe}/events/create`,
        payload,
        {
          headers: {
            'x-jdticket': localStorage.getItem('token') || '',
          },
        }
      );
      const { code, message, event_id } = response.data;
      if (code !== '1') {
        console.log(message)
        setSubmitError(message);
      } else {
        alert(message);
        navigate(`/dashboard/${event_id}`);
      }
    } catch (error) {
      if (error.response) {
        setSubmitError(`(${error.response.status}) ${error.response.data?.message || 'Server Error'}`);
      } else if (error.request) {
        setSubmitError('No response from server');
      } else {
        setSubmitError('Unexpected error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitError) {
    alert(submitError)
    setSubmitError(null);
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-4 pb-10 justify-center items-start">
      {/* Left Card */}
      <div className="bg-[#141717] rounded-[10px] border border-strokesss w-full max-w-md lg:max-w-[300px] p-4 relative mx-auto lg:mx-0 flex flex-col items-center">
        <label htmlFor="image-upload" className="relative w-full flex justify-center cursor-pointer">
          <div className="aspect-square w-full bg-[#141717] rounded-[7px] overflow-hidden flex items-center justify-center">
            <img
              className="w-full h-full object-cover"
              src={eventImage}
              alt="Event Preview"
              style={{ aspectRatio: '1 / 1' }}
            />
            <label
              htmlFor="image-upload"
              className="absolute bottom-[12px] right-[12px] w-[43px] h-[43px] rounded-full border border-white hover:border-green-500 bg-[#141717] opacity-70 flex items-center justify-center cursor-pointer group"
            >
              <ImagePlus className="w-5 h-5 text-white group-hover:text-green-500" />
            </label>
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const img = new window.Image();
                  img.src = reader.result;
                  img.onload = () => {
                    if (img.width !== img.height) {
                      setRawImage(reader.result);
                      setEventImageFile(file); // keep file for later upload
                      setShowCropper(true);
                    } else {
                      setEventImage(reader.result);
                      setEventImageFile(file);
                    }
                  };
                };
                reader.readAsDataURL(file);
                // Reset input value so same file can be selected again
                e.target.value = null;
              }
            }}
          />
        </label>
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
                    setEventImageFile(dataURLtoFile(croppedImg, 'event-image.png'));
                    setShowCropper(false);
                  }}
                >Crop & Use</button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 mt-6 w-full">
          <input
            type="text"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full bg-[#0f0f0f] border border-white rounded-lg p-3 text-white text-responsive-medium outline-none"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#0f0f0f] border border-white rounded-lg p-3 text-white text-responsive-medium outline-none"
          />
          <input
            type="text"
            placeholder="Add tags..."
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-[#0f0f0f] border border-strokesss rounded-lg p-4 text-white text-responsive-medium outline-none"
          />
        </div>
      </div>

      {/* Right Card */}
      <div className="bg-[#141717] rounded-[10px] border border-strokesss border-solid w-full p-6 mx-auto lg:mx-0">
        <div className="grid gap-2 items-center">
          {/* Visibility */}
          <div className="text-white text-responsive-medium leading-[18px]">
            Visibility
          </div>
          <div className="relative w-full">
            <div
              onClick={() => setShowVisibilityOptions(!showVisibilityOptions)}
              className="flex items-center justify-between bg-[#0f0f0f] border border-strokesss rounded-lg p-4 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {visibility === 'Public' ? (
                  <Eye className="w-5 h-5 text-white" />
                ) : (
                  <EyeOff className="w-5 h-5 text-white" />
                )}
                <span className="text-white text-responsive-medium leading-[18px]">{visibility}</span>
              </div>
              <span className="text-white text-sm">▼</span>
            </div>
            {showVisibilityOptions && (
              <div className="absolute z-10 w-full bg-[#1f1f1f] border border-strokesss rounded-lg shadow-md">
                {['Public', 'Private'].map(option => (
                  <div
                    key={option}
                    className="px-4 py-2 hover:bg-gray-800 text-white cursor-pointer"
                    onClick={() => {
                      setVisibility(option);
                      setShowVisibilityOptions(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Start Date */}
          <div className="text-white text-responsive-medium leading-[18px]">
            Start
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="w-full">
              <DatePickerBox value={startDate} onChange={setStartDate} />
            </div>
            <div className="w-full"> 
              <TimePickerBox value={startTime} onChange={setStartTime} />
            </div>
          </div>

          {/* End Date */}
          <div className="text-white text-responsive-medium leading-[18px]">
            End
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="w-full">
              <DatePickerBox value={endDate} onChange={setEndDate} />
            </div>
            <div className="w-full">
              <TimePickerBox value={endTime} onChange={setEndTime} />
            </div>
          </div>

          {/* Location */}
          <div className="text-white text-responsive-medium leading-[18px]">
            Location
          </div>
          <div className="relative w-full">
            <div className="flex items-center gap-2.5 bg-[#0f0f0f] border border-strokesss rounded-lg p-4">
              <MapPin className="w-5 h-5 text-white" />
              <input
                value={locationInput}
                onChange={e => {
                  const val = e.target.value;
                  setLocationInput(val);
                  setShowLocationOptions(true);
                  if (val.length > 1) fetchLocationSuggestions(val);
                }}
                placeholder="Enter location or virtual link"
                className="bg-transparent outline-none text-white w-full font-['Satoshi-Medium']"
              />
              <X 
                className="w-5 h-5 text-white cursor-pointer" 
                onClick={() => {
                  setLocationInput("")
                  setShowMaps(false);}
                }
              />
            </div>
            {showLocationOptions && locationInput && (
              <div className="absolute z-10 w-full bg-[#0f0f0f] border border-strokesss rounded-lg mt-2 shadow-lg max-h-[300px] overflow-y-auto">
                {locationSuggestions.map((item, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-white"
                    onClick={() => {
                      setLocationInput(item.description);
                      setlocationName(item.structured_formatting.main_text)
                      setlocationAddress(item.structured_formatting.secondary_text)
                      setShowMaps(true)
                      setShowLocationOptions(false);
                    }}
                  >
                    <div className="font-['Satoshi-Bold']">{item.structured_formatting.main_text}</div>
                    <div className="text-xs text-gray-400">{item.structured_formatting.secondary_text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {showMaps && (
            <>
            <div className='my-1'>
              <iframe
                title="event-location"
                src={`https://www.google.com/maps?q=${encodeURIComponent(locationInput)}&output=embed`}
                className="w-full h-60 rounded-lg border border-gray-700"
                loading="lazy"
              ></iframe>
            </div>
            </>
          )}
          
          {/* Capacity */}
          <div className="text-white text-responsive-medium leading-[18px]">
            Capacity
          </div>
          {capacityMode === "unlimited" ? (
            <div className="flex items-center justify-between bg-[#0f0f0f] border border-strokesss rounded-lg p-4">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-white" />
                <span className="text-white text-responsive-medium leading-[18px]">Unlimited</span>
              </div>
              <Edit className="w-4 h-4 text-white cursor-pointer" onClick={() => setCapacityMode("custom")} />
            </div>
          ) : (
            <div className="flex items-center justify-between bg-[#0f0f0f] border border-strokesss rounded-lg p-4">
              <div className="flex items-center gap-2.5 w-full">
                <Users className="w-5 h-5 text-white" />
                <input
                  type="number"
                  min={1}
                  value={customCapacity}
                  onChange={(e) => setCustomCapacity(e.target.value)}
                  placeholder="Enter capacity"
                  className="bg-transparent text-white outline-none w-full font-['Satoshi-Medium']"
                />
              </div>
              <X className="w-4 h-4 text-white cursor-pointer" onClick={() => { setCapacityMode("unlimited"); setCustomCapacity(""); }} />
            </div>
          )}

          {/* Event Type */}
          <div className="text-white text-responsive-medium leading-[18px]">
            Event Type
          </div>
          <div className="relative w-full">
            <div
              onClick={() => setShowEventTypeOptions(!showEventTypeOptions)}
              className="flex items-center justify-between bg-[#0f0f0f] border border-strokesss rounded-lg p-4 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-white" />
                <span className="text-white text-responsive-medium leading-[18px]">
                  {eventType}
                </span>
              </div>
              <span className="text-white text-sm">▼</span>
            </div>

            {showEventTypeOptions && (
              <div className="absolute z-10 w-full bg-[#1f1f1f] border border-strokesss rounded-lg shadow-md">
                {["Free Event", "Paid Event"].map((option) => (
                  <div
                    key={option}
                    className="px-4 py-2 hover:bg-gray-800 text-white cursor-pointer"
                    onClick={() => {
                      setEventType(option);
                      setShowEventTypeOptions(false);
                      if (option === "Free Event") {
                        setPrice(0);
                      }
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
          {eventType === "Paid Event" && (
            <>
              <div className="text-white text-responsive-medium leading-[18px]">
                Input Price
              </div>
              <div className="relative w-full">
                <div className="flex items-center justify-between bg-[#0f0f0f] border border-strokesss rounded-lg p-4 w-full">
                  <div className="flex items-center gap-2.5 w-full">
                    <div className="text-white text-responsive-medium leading-[18px]">
                      Rp
                    </div>
                    <input
                      type="number"
                      className="bg-transparent text-white outline-none w-full font-['Satoshi-Medium']"
                      placeholder="Contoh: 50000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Approval */}
          <div className="text-white text-responsive-medium leading-[18px]">
            Approval
          </div>
          <div className="flex items-center justify-between bg-[#0f0f0f] border border-strokesss rounded-lg p-4 w-full">
            <div className="flex items-center gap-2.5">
              {requireApproval ? (
                <>
                  <Lock className="w-5 h-5 text-white" />
                  <span className="text-white text-responsive-medium leading-[18px]">Require Approval</span>
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5 text-white" />
                  <span className="text-white text-responsive-medium leading-[18px]">No Need Approval</span>
                </>
              )}
            </div>
            <div
              onClick={() => setRequireApproval(!requireApproval)}
              className={`w-10 h-5 rounded-full flex items-center cursor-pointer px-1 ${
                requireApproval ? "bg-[#31D34F]" : "bg-gray-400"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white transition-transform duration-300 ${
                  requireApproval ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            onClick={handleSaveDraft} 
            className="bg-[#303030] rounded-lg px-6 py-3 text-white font-['Satoshi-Bold'] w-full sm:w-1/2"
          >
            Save as Draft
          </button>
          <button 
            onClick={() => handleSubmit()} 
            className="bg-[#00594F] rounded-lg px-6 py-3 text-white font-['Satoshi-Bold'] w-full sm:w-1/2 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Created..." : "Create Event"}
          </button>
        </div>
      </div>
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
          {value || "Select date"}
        </span>
      </div>
      <span className="text-white text-sm">▼</span>
    </div>
  ));

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
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
          {value || "Select time"}
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
      customInput={<CustomTimeInput />}
    />
  );
};


export default CreateEvent;