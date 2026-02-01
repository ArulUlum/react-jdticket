import { useRef } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';

export default function TicketModal({
  isOpen,
  onClose,
  event,
  quantities,
  increaseQty,
  decreaseQty,
  errorMessage,
  onContinue,
}) {
  const ref = useRef(null);
  useClickOutside(ref, isOpen, onClose);

  if (!isOpen) return null;

  const getTicketStatus = (ticket) => {
    if (ticket.max_capacity === null) return null;

    const remaining = ticket.max_capacity - ticket.registered;

    if (remaining <= 0) {
      return {
        type: 'soldout',
        text: 'Sold out',
      };
    }

    if (remaining <= 10) {
      return {
        type: 'low',
        text: `Tickets only have ${remaining} left`,
      };
    }

    return null;
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div
        className="bg-[#141717] w-[90%] max-w-md p-6 rounded-lg border border-[#212121]"
        ref={ref}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-responsive-sub-title text-white">Registration</h2>
        </div>

        {event?.list_ticket?.map((ticket) => {
          const status = getTicketStatus(ticket);
          const isSoldOut = status?.type === 'soldout';

          return (
            <div
              key={ticket.id}
              className="flex mb-2 justify-between items-center bg-[#1C1D1D] rounded-lg px-4 py-2 border border-[#212121]"
            >
              <div>
                <h3 className="text-responsive-medium text-white">{ticket.name}</h3>
                <p className="text-responsive-caption text-[#a2a2a2]">
                  {ticket.price === 0 ? 'Free' : `Rp ${ticket.price.toLocaleString()}`}
                </p>

                {status && (
                  <p
                    className={`text-xs mt-1 ${status.type === 'soldout'
                        ? 'text-red-500'
                        : 'text-yellow-400'
                      }`}
                  >
                    {status.text}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => decreaseQty(ticket.id)}
                  disabled={isSoldOut}
                  className={`w-6 h-6 text-white text-sm rounded flex items-center justify-center
            ${isSoldOut ? 'bg-[#1f1f1f] cursor-not-allowed' : 'bg-[#303030]'}`}
                >
                  –
                </button>

                <span className="w-6 text-center text-white">
                  {quantities?.[ticket.id] || 0}
                </span>

                <button
                  onClick={() => increaseQty(ticket.id)}
                  disabled={isSoldOut}
                  className={`w-6 h-6 text-white text-sm rounded flex items-center justify-center
            ${isSoldOut ? 'bg-[#1f1f1f] cursor-not-allowed' : 'bg-[#303030]'}`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}


        {errorMessage && <p className="text-red-500 text-sm mb-2">{errorMessage}</p>}

        <button
          className="bg-white text-responsive-item-title text-[#141717] w-full py-2 mt-2 rounded hover:bg-[#ffffffe4]"
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
