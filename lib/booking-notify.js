const webhookUrl = process.env.BOOKING_WEBHOOK_URL;

export async function notifyNewBooking(booking) {
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        event: "booking.created",
        booking
      })
    });
  } catch {
    // Notification errors should not block booking creation.
  }
}
