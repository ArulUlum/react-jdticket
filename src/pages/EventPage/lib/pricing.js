export function getSelectedTickets(event, quantities) {
  return event?.list_ticket?.filter((t) => (quantities?.[t.id] || 0) > 0) || [];
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

export function totalTaxAmount(price, type_tax, value_tax) {
  if (type_tax === "Percentage") {
    return (price * value_tax) / 100;
  } else if (type_tax === "Amount") {
    return value_tax;
  }
  return 0;
} 

export function getPaymentFee(isPaid, totalTicketPrice) {
  return isPaid ? totalTicketPrice * 0.01 : 0;
}

export function getTotalPrice(totalTicketPrice, platformFee, taxFee, paymentFee) {
  return totalTicketPrice + platformFee + taxFee + paymentFee;
}
