// Spark Mastery — Booking Service
// Deterministic slot generation with business hours (fixes PR #3 random slot bug)

export interface BookingSlot {
  date: string;       // ISO date string
  time: string;       // "HH:MM" format
  displayDate: string; // "Mon, Jan 15"
  displayTime: string; // "9:00 AM"
  available: boolean;
}

export interface BookingRequest {
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  sessionType: string;
  notes?: string;
  source?: string;
}

export interface BookingResult {
  success: boolean;
  message: string;
  confirmationUrl?: string;
  bookingId?: string;
}

const BUSINESS_HOURS = { start: 9, end: 18 }; // 9AM–6PM GST
const SLOT_DURATION = 60; // minutes
const DAYS_AHEAD = 7;

// External booking URL
const BOOKING_URL = 'https://tinyurl.com/bookptd';

/**
 * Generate available slots for the next N days.
 * Deterministic: all business-hour slots are available.
 * In production, this would query a calendar API.
 */
export const getAvailableSlots = (): BookingSlot[] => {
  const slots: BookingSlot[] = [];
  const now = new Date();

  for (let d = 1; d <= DAYS_AHEAD; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);

    // Skip weekends (Friday=5 is half-day in Dubai, Sat/Sun off)
    const day = date.getDay();
    if (day === 0 || day === 6) continue; // Sun, Sat

    const dateStr = date.toISOString().split('T')[0];
    const displayDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    for (let h = BUSINESS_HOURS.start; h < BUSINESS_HOURS.end; h++) {
      const timeStr = `${h.toString().padStart(2, '0')}:00`;
      const hour12 = h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayTime = `${hour12}:00 ${ampm}`;

      slots.push({
        date: dateStr,
        time: timeStr,
        displayDate,
        displayTime,
        available: true,
      });
    }
  }

  return slots;
};

/**
 * Create a booking.
 * In production: saves to Supabase, sends confirmation email, syncs with Cal.com.
 * Current: saves to localStorage + redirects to external booking URL.
 */
export const createBooking = async (booking: BookingRequest): Promise<BookingResult> => {
  try {
    // Save booking data locally (will be replaced with Supabase)
    const existingBookings = JSON.parse(localStorage.getItem('sparkBookings') || '[]');
    const newBooking = {
      ...booking,
      id: `booking_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    existingBookings.push(newBooking);
    localStorage.setItem('sparkBookings', JSON.stringify(existingBookings));

    return {
      success: true,
      message: 'Booking confirmed! Redirecting to scheduling...',
      confirmationUrl: BOOKING_URL,
      bookingId: newBooking.id,
    };
  } catch (error) {
    console.error('Booking creation failed:', error);
    return {
      success: false,
      message: 'Failed to create booking. Please try again.',
    };
  }
};
