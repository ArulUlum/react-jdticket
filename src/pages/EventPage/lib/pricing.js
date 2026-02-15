export function getSelectedTickets(event, quantities) {
  return event?.list_ticket?.filter((t) => (quantities?.[t.id] || 0) > 0) || [];
}

export function getTotalselectedTickets(selectedTickets, quantities) {
  return selectedTickets.reduce((sum, t) => {
    const qty = quantities?.[t.id] || 0;
    return sum + qty;
  }, 0);
}

export function hasPaidTicket(selectedTickets) {
  return selectedTickets.some((t) => (t.price || 0) > 0);
}

export function getTotalTicketPrice(selectedTickets, quantities) {
  return selectedTickets.reduce((sum, t) => {
    const qty = quantities?.[t.id] || 0;
    return sum + (t.price || 0) * qty;
  }, 0);
}

export function countPriceWithType(price, type_tax, value_tax, quantities) {
  if (type_tax === 'Percentage') {
    return (price * value_tax) / 100;
  } else if (type_tax === 'Amount') {
    return value_tax * (quantities || 1);
  }
  return 0;
}

export function getPaymentFee(isPaid, totalTicketPrice) {
  return isPaid ? totalTicketPrice * 0.015 : 0;
}

export function getTotalPrice(totalTicketPrice, platformFee, taxFee, paymentFee, discountAmount) {
  return totalTicketPrice + platformFee + taxFee + paymentFee - (discountAmount || 0);
}
