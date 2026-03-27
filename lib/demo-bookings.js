let demoBookings = [];
let demoIdCounter = 1;

export function getDemoBookings() {
  return demoBookings;
}

export function addDemoBooking(booking) {
  const now = new Date().toISOString();
  const newBooking = {
    id: demoIdCounter++,
    ...booking,
    status: "confirmed",
    source: "demo",
    updated_at: now,
    created_at: now
  };
  demoBookings.unshift(newBooking);
  return newBooking;
}

export function updateDemoBooking(id, updates) {
  const booking = demoBookings.find(b => b.id === id);
  if (booking) {
    Object.assign(booking, updates, { updated_at: new Date().toISOString() });
  }
  return booking;
}

export function deleteDemoBooking(id) {
  const index = demoBookings.findIndex(b => b.id === id);
  if (index !== -1) {
    demoBookings.splice(index, 1);
    return true;
  }
  return false;
}

export function clearDemoBookings() {
  demoBookings = [];
  demoIdCounter = 1;
}