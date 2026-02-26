import { useRef } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
import { payments } from '../lib/payments';

export default function RegistrationModal({
  isOpen,
  onClose,
  event,
  headerInfo, // { startDay, startMonth, formattedStartTime }
  pricingInfo, // { selectedTickets, isPaid, platformFee, taxFee, paymentFee, totalPrice, quantities }
  showPromoInput,
  setShowPromoInput,
  formData,
  setFormData,
  selectedPaymentGroup,
  setSelectedPaymentGroup,
  selectedPayment,
  setSelectedPayment,
  isSubmitting,
  onSubmit,
  onApplyPromo,
  isApplyingPromo,
  promoError,
  promoMessage,
}) {
  const ref = useRef(null);
  useClickOutside(ref, isOpen, onClose);

  if (!isOpen || !event) return null;

  const { startDay, startMonth, formattedStartTime } = headerInfo;
  const {
    selectedTickets,
    isPaid,
    platformFee,
    taxFee,
    paymentFee,
    totalPrice,
    quantities,
    discountAmount,
  } = pricingInfo;

  const handleApplyPromoClick = () => {
    if (!formData.promoCode) return;
    onApplyPromo?.({
      code: formData.promoCode,
      eventId: event.id,
      ticketIds: selectedTickets.map((t) => t.id),
    });
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div
        ref={ref}
        className="bg-[#141717] text-white rounded-xl shadow-lg w-[90%] max-w-md max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="text-responsive-sub-title">Registration</div>
        </div>

        {/* Event Info */}
        <div className="border border-[#a2a2a2] rounded-xl p-4 w-full max-w-md mx-auto text-white">
          <div className="flex gap-4 mb-4">
            <img
              src={event.image || 'https://wallpapercave.com/wp/wp9297718.jpg'}
              alt="Event"
              className="w-16 h-16 rounded object-cover"
            />
            <div>
              <h3 className="text-responsive-item-title">{event.name}</h3>
              <p className="text-responsive-caption text-[#a2a2a2]">
                {startDay} {startMonth} at {formattedStartTime} WIB
              </p>
              <p className="text-responsive-caption text-[#a2a2a2]">{event.location_name}</p>
            </div>
          </div>

          {/* Promo Code */}
          {isPaid && (
            <div className="mb-4">
              <div
                onClick={() => setShowPromoInput(!showPromoInput)}
                className="text-[#13E7BD] text-responsive-caption cursor-pointer w-1/3"
              >
                Add Promo Code
              </div>

              {showPromoInput && (
                <>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={formData.promoCode || ''}
                      onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                      className="flex-1 rounded border border-[#a2a2a2] bg-transparent px-3 py-2 text-responsive-regular focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      className="bg-white text-black px-4 rounded text-responsive-medium-normal disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={handleApplyPromoClick}
                      disabled={isApplyingPromo}
                    >
                      {isApplyingPromo ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                  {promoError && <p className="text-red-400 text-xs mt-1">{promoError}</p>}
                  {promoMessage && !promoError && (
                    <p className="text-[#13E7BD] text-xs mt-1">{promoMessage}</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Harga */}
          <div className="space-y-1 text-responsive-caption text-[#a2a2a2]">
            {selectedTickets.map((t) => (
              <div key={t.id} className="flex justify-between">
                <span>
                  {t.name} (x{quantities[t.id]})
                </span>
                <span>
                  {t.price === 0 ? 'FREE' : `Rp ${(t.price * quantities[t.id]).toLocaleString()}`}
                </span>
              </div>
            ))}

            {isPaid && (
              <>
                {Number(platformFee) > 0 && (
                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span>Rp {platformFee.toLocaleString()}</span>
                  </div>
                )}
                {Number(taxFee) > 0 && (
                  <div className="flex justify-between">
                    <span>Event Tax Fee</span>
                    <span>Rp {taxFee.toLocaleString()}</span>
                  </div>
                )}
                {Number(paymentFee) > 0 && (
                  <div className="flex justify-between">
                    <span>Payment Fee</span>
                    <span>Rp {paymentFee.toLocaleString()}</span>
                  </div>
                )}
                {Number(discountAmount) > 0 && (
                  <div className="flex justify-between text-[#13E7BD]">
                    <span>Promo Discount</span>
                    <span>- Rp {discountAmount.toLocaleString()}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-between text-responsive-medium mt-1">
            <span>Total Price</span>
            <span>{!isPaid ? 'FREE' : `Rp ${totalPrice.toLocaleString()}`}</span>
          </div>
        </div>

        {/* Form */}
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.();
          }}
        >
          {/* User Info */}
          <div className="flex flex-col gap-3 w-full">
            <div className="text-white text-responsive-sub-title">Your Info</div>

            <div className="flex flex-col gap-1">
              <label className="text-white text-responsive-caption-bold">Name *</label>
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[#1c1d1d] border border-gray-600 rounded-lg px-3 py-2 text-gray-400 w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-white text-responsive-caption-bold">Email *</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-[#1c1d1d] border border-gray-600 rounded-lg px-3 py-2 text-gray-400 w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-white text-responsive-caption-bold">Phone Number</label>
              <input
                type="tel"
                placeholder="081XXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-[#1c1d1d] border border-gray-600 rounded-lg px-3 py-2 text-gray-400 w-full"
              />
            </div>
          </div>

          {/* Payment */}
          {isPaid && (
            <div className="flex flex-col gap-3 w-full mt-4">
              <div className="text-white text-responsive-sub-title">Payment</div>

              <div className="flex flex-col gap-1 mb-2">
                {payments.map((group) => (
                  <div key={group.group} className="flex flex-col gap-1">
                    <div
                      className={`text-responsive-caption-bold cursor-pointer py-1 rounded transition-colors duration-150 ${
                        selectedPaymentGroup === group.group ? 'text-white' : 'text-[#a2a2a2]'
                      }`}
                      onClick={() => {
                        if (selectedPaymentGroup !== group.group) {
                          setSelectedPaymentGroup(group.group);
                          setSelectedPayment(''); // konsisten string
                        }
                      }}
                    >
                      {group.group}
                    </div>

                    {selectedPaymentGroup === group.group && (
                      <div className="flex flex-col gap-1 w-full">
                        {group.items.map((item) => {
                          const isDisabled = item.disabled;
                          const wrapperClasses = [`flex items-center gap-3 p-2 rounded-lg border w-full`];
                          if (isDisabled) {
                            wrapperClasses.push('bg-gray-800 border-gray-600 cursor-not-allowed opacity-60');
                          } else if (selectedPayment === item.label) {
                            wrapperClasses.push('border-[#13E7BD] bg-[#1c1d1d]');
                          } else {
                            wrapperClasses.push('border-[#212121] bg-[#1c1d1d] cursor-pointer');
                          }

                          return (
                            <div
                              key={item.label}
                              className={wrapperClasses.join(' ')}
                              onClick={() => !isDisabled && setSelectedPayment(item.label)}
                            >
                              <img src={item.icon} alt={item.label} className="w-9 h-9" />
                              <div className="text-[#a2a2a2] text-responsive-medium flex-1">
                                {item.label}
                                {item.note && (
                                  <span className="text-xs text-yellow-300 block">
                                    {item.note}
                                  </span>
                                )}
                              </div>
                              <input
                                type="radio"
                                name="paymentMethod"
                                value={item.label}
                                checked={selectedPayment === item.label}
                                onChange={() => !isDisabled && setSelectedPayment(item.label)}
                                className="accent-[#13E7BD] w-5 h-5 cursor-pointer"
                                disabled={isDisabled}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Continue */}
          <button
            type="submit"
            className="bg-white text-[#1a1c29] font-bold rounded-lg py-3 w-full mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={
              isSubmitting || (isPaid && !selectedPayment) // can't continue if paid event and no payment chosen
            }
          >
            {isSubmitting ? 'Continue...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
