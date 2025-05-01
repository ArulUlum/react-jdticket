// Import yang dibutuhkan
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateEvent() {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      name: formData.name,
      location: formData.location,
      description: formData.description,
      max_capacity: parseInt(formData.capacity),
      start_date: formData.start.replace('T', ' ') + ':00',
      end_date: formData.end.replace('T', ' ') + ':00',
      list_ticket: tickets,
    };

    try {
      const response = await axios.post(
        'https://jdticket-production.up.railway.app/events/create',
        payload,
        {
          headers: {
            'x-jdticket': localStorage.getItem('token') || '',
          },
        }
      );
      const { code, message } = response.data;
      if (code !== '1') {
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
    <div className="bg-[#060810] w-full min-h-screen relative p-20 text-white">
      <div className="max-w-[1250px] mx-auto px-6 mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            ←
          </button>
          <h1 className="text-3xl font-bold">Create Event</h1>
        </div>
      </div>

      <div className="max-w-[1250px] mx-auto px-6">
        <form onSubmit={handleSubmit} className="w-full flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3">
            <div className="bg-gray-400 rounded-xl w-full aspect-square"></div>
          </div>

          <div className="w-full lg:w-2/3 space-y-4">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 text-white"
              placeholder="Event Name"
            />

            <div className="flex gap-4">
              <input
                type="datetime-local"
                name="start"
                value={formData.start}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white"
              />
              <input
                type="datetime-local"
                name="end"
                value={formData.end}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white"
              />
            </div>

            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 text-white"
              placeholder="Location"
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 text-white"
              placeholder="Description"
              rows={3}
            />

            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 text-white"
              placeholder="Total Capacity"
            />

            <div>
              <h2 className="text-xl font-bold mb-2">Ticket Option</h2>
              <div className="flex gap-4">
                <div
                  onClick={() => openModal('Free')}
                  className="cursor-pointer bg-[#1b2141] p-6 rounded-xl text-center w-1/2 hover:bg-[#2a335f]"
                >
                  Free
                </div>
                <div
                  onClick={() => openModal('Paid')}
                  className="cursor-pointer bg-[#1b2141] p-6 rounded-xl text-center w-1/2 hover:bg-[#2a335f]"
                >
                  Paid
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Added Tickets:</h3>
              <ul className="space-y-2">
                {tickets.map((ticket, index) => (
                  <li
                    key={index}
                    className="bg-gray-800 p-4 rounded flex justify-between items-center"
                  >
                    <div>
                      <strong>{ticket.name}</strong> - {ticket.price === 0 ? 'Free' : `Rp ${ticket.price}`} ({
                        ticket.max_capacity
                      } pcs)
                    </div>
                    <button
                      onClick={() => handleRemoveTicket(index)}
                      className="text-red-400 hover:text-red-600 ml-4"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {submitError && <div className="text-red-500 font-semibold">{submitError}</div>}

            <button
              type="submit"
              className="bg-white text-black font-semibold px-4 py-2 rounded hover:bg-gray-200 disabled:opacity-50 w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>

      {showTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1c29] p-6 rounded-lg w-[400px] shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center">Add {selectedType} Ticket</h2>
            <div className="space-y-4">
              <input
                name="name"
                value={ticketInput.name}
                onChange={handleTicketInputChange}
                placeholder="Ticket Name"
                className="w-full p-2 rounded bg-[#2a2d3e] text-white"
              />
              {selectedType === 'Paid' && (
                <input
                  name="price"
                  type="number"
                  value={ticketInput.price}
                  onChange={handleTicketInputChange}
                  placeholder="Ticket Price"
                  className="w-full p-2 rounded bg-[#2a2d3e] text-white"
                />
              )}
              <input
                name="max_capacity"
                type="number"
                value={ticketInput.max_capacity}
                onChange={handleTicketInputChange}
                placeholder="Max Capacity"
                className="w-full p-2 rounded bg-[#2a2d3e] text-white"
              />
              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTicket}
                  className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
                >
                  Add Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateEvent;