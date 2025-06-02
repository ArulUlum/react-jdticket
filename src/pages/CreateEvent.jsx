// Import yang dibutuhkan
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, addMinutes } from 'date-fns';
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

const urlBe = import.meta.env.VITE_URL_CLAW;

function CreateEvent() {
  const now = new Date();
  const roundedNow = new Date(Math.ceil(now.getTime() / (30 * 60000)) * 30 * 60000);

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
  const [capacityMode, setCapacityMode] = useState("unlimited");
  const [customCapacity, setCustomCapacity] = useState("");
  const [eventType, setEventType] = useState("Free Event");
  const [showEventTypeOptions, setShowEventTypeOptions] = useState(false);
  const [requireApproval, setRequireApproval] = useState(true);
  const [eventImage, setEventImage] = useState("https://wallpapercave.com/wp/wp9297718.jpg");
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

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

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const openModal = (type) => {
    setSelectedType(type);
    setShowTicketModal(true);
  };

  const closeModal = () => {
    setShowTicketModal(false);
    setTicketInput({ name: '', price: '', max_capacity: '' });
  };

  const handleTicketInputChange = (e) => {
    setTicketInput({ ...ticketInput, [e.target.name]: e.target.value });
  };

  const handleAddTicket = () => {
    const ticketToAdd = {
      ...ticketInput,
      price: selectedType === 'Free' ? 0 : parseFloat(ticketInput.price),
      max_capacity: parseInt(ticketInput.max_capacity),
    };
    setTickets([...tickets, ticketToAdd]);
    closeModal();
  };

  const handleRemoveTicket = (index) => {
    const updatedTickets = [...tickets];
    updatedTickets.splice(index, 1);
    setTickets(updatedTickets);
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
      visibility: visibility,
      start_date: formatDateTime(startDate, startTime),
      end_date: formatDateTime(endDate, endTime),
      location: locationInput,
      max_capacity: parseInt(capacityMode === "unlimited" ? -1 : capacityMode),
      list_ticket: tickets,
      approval: requireApproval
    };
    console.log(payload)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      name: eventName,
      description: description,
      visibility: visibility,
      start_date: formatDateTime(startDate, startTime),
      end_date: formatDateTime(endDate, endTime),
      location: locationInput,
      max_capacity: parseInt(capacityMode === "unlimited" ? -1 : capacityMode),
      list_ticket: tickets,
      approval: requireApproval
    };
    console.log(payload)

    try {
      const response = await axios.post(
        `${urlBe}/events/create`,
        payload,
        {
          headers: {
            'x-jdticket': localStorage.getItem('token') || '',
          },
        }
      );
      const { code, message } = response.data;
      if (code !== '1') {
        console.log(message)
        setSubmitError(message);
      } else {
        alert(message);
        navigate('/');
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

  return (
    <div className="flex flex-col lg:flex-row gap-4 pb-10 justify-center items-start">
      {/* Left Card */}
      <div className="bg-bg-card bg-[#141717] rounded-[10px] border border-strokesss w-full max-w-md lg:max-w-[350px] p-4 relative">
        <label htmlFor="image-upload" className="relative w-full flex justify-center cursor-pointer">
          <img
            className="rounded-[7px] w-full h-[317px] object-cover"
            src={eventImage}
            alt="Event Preview"
          />
          <label
            htmlFor="image-upload"
            className="absolute bottom-[12px] right-[12px] w-[43px] h-[43px] rounded-full border border-white bg-bg-card flex items-center justify-center cursor-pointer group"
          >
            <ImagePlus className="w-5 h-5 text-white group-hover:text-green-500 transition-colors duration-200" />
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setEventImage(reader.result);
                reader.readAsDataURL(file);
              }
            }}
          />
        </label>

        <div className="space-y-4 mt-6">
          <input
            type="text"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full bg-[#0f0f0f] border border-putih-parah rounded-lg p-4 text-grey-in-white font-['Satoshi-Medium'] text-base outline-none"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#0f0f0f] border border-putih-parah rounded-lg p-4 text-grey-in-white font-['Satoshi-Medium'] text-base outline-none resize-none h-16"
          />
          <input
            type="text"
            placeholder="Add tags..."
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-[#0f0f0f] border border-strokesss rounded-lg p-4 text-grey-in-white font-['Satoshi-Medium'] text-base outline-none"
          />
        </div>
      </div>

      {/* Right Card */}
      <div className="bg-bg-card bg-[#141717] rounded-[10px] border border-strokesss border-solid w-full max-w-3xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-y-4 gap-x-6 items-center">
          {/* Visibility */}
          <div className="text-white font-['Satoshi-Medium'] text-base leading-[18px]">
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
                <span className="text-white font-['Satoshi-Medium'] text-base leading-[18px]">{visibility}</span>
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
          <div className="text-white font-['Satoshi-Medium'] text-base leading-[18px]">
            Start
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-strokesss w-full">
              <DatePickerBox value={startDate} onChange={setStartDate} />
            </div>
            <div className="border border-strokesss w-full"> 
              <TimePickerBox value={startTime} onChange={setStartTime} />
            </div>
          </div>

          {/* End Date */}
          <div className="text-white font-['Satoshi-Medium'] text-base leading-[18px]">
            End
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-strokesss w-full">
              <DatePickerBox value={endDate} onChange={setEndDate} />
            </div>
            <div className="border border-strokesss w-full">
              <TimePickerBox value={endTime} onChange={setEndTime} />
            </div>
          </div>

          {/* Location */}
          <div className="text-white font-['Satoshi-Medium'] text-base leading-[18px]">
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
              <X className="w-5 h-5 text-white cursor-pointer" onClick={() => setLocationInput("")} />
            </div>
            {showLocationOptions && locationInput && (
              <div className="absolute z-10 w-full bg-[#0f0f0f] border border-strokesss rounded-lg mt-2 shadow-lg max-h-[300px] overflow-y-auto">
                {locationSuggestions.map((item, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-white"
                    onClick={() => {
                      setLocationInput(item.description);
                      setShowLocationOptions(false);
                    }}
                  >
                    <div className="font-semibold">{item.structured_formatting.main_text}</div>
                    <div className="text-xs text-gray-400">{item.structured_formatting.secondary_text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Capacity */}
          <div className="text-white font-['Satoshi-Medium'] text-base leading-[18px]">
            Capacity
          </div>
          {capacityMode === "unlimited" ? (
            <div className="flex items-center justify-between bg-[#0f0f0f] border border-strokesss rounded-lg p-4">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-white" />
                <span className="text-white font-['Satoshi-Medium'] text-base leading-[18px]">Unlimited</span>
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
          <div className="text-white font-['Satoshi-Medium'] text-base leading-[18px]">
            Event Type
          </div>
          <div className="relative w-full">
            <div
              onClick={() => setShowEventTypeOptions(!showEventTypeOptions)}
              className="flex items-center justify-between bg-[#0f0f0f] border border-strokesss rounded-lg p-4 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-white" />
                <span className="text-white font-['Satoshi-Medium'] text-base leading-[18px]">
                  {eventType}
                </span>
              </div>
              <span className="text-white text-sm">▼</span>
            </div>

            {showEventTypeOptions && (
              <div className="absolute z-10 mt-2 w-full bg-[#0f0f0f] border border-strokesss rounded-lg shadow-md">
                {["Free Event", "Paid Event"].map((option) => (
                  <div
                    key={option}
                    className="px-4 py-2 hover:bg-gray-800 text-white cursor-pointer"
                    onClick={() => {
                      setEventType(option);
                      setShowEventTypeOptions(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>


          <div className="text-white font-['Satoshi-Medium'] text-base leading-[18px]">
            Approval
          </div>
          <div className="flex items-center justify-between bg-[#0f0f0f] border border-strokesss rounded-lg p-4 w-full">
            <div className="flex items-center gap-2.5">
              {requireApproval ? (
                <>
                  <Lock className="w-5 h-5 text-white" />
                  <span className="text-white font-['Satoshi-Medium'] text-base leading-[18px]">Require Approval</span>
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5 text-white" />
                  <span className="text-white font-['Satoshi-Medium'] text-base leading-[18px]">No Need Approval</span>
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
            className="bg-[#303030] rounded-lg px-6 py-3 font-bold text-white font-['Satoshi-Bold'] w-full sm:w-1/2"
          >
            Save as Draft
          </button>
          <button 
            onClick={handleSubmit} 
            className="bg-[#00594F] rounded-lg px-6 py-3 font-bold text-white font-['Satoshi-Bold'] w-full sm:w-1/2"
          >
            Create Event
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
      className="flex items-center justify-between bg-[#0f0f0f] border border-strokesss rounded-lg px-4 py-2 cursor-pointer w-full"
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

  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      dateFormat="EEE, MMM d"
      customInput={<CustomDateInput />}
      calendarClassName="custom-calendar" // untuk styling dark mode
    />
  );
};

const TimePickerBox = ({ value, onChange }) => {
  const CustomTimeInput = React.forwardRef(({ value, onClick }, ref) => (
    <div
      onClick={onClick}
      ref={ref}
      className="flex items-center justify-between bg-[#0f0f0f] border border-strokesss rounded-lg px-4 py-2 cursor-pointer w-full"
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
      dateFormat="hh:mm"
      customInput={<CustomTimeInput />}
    />
  );
};


export default CreateEvent;