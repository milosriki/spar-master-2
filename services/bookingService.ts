/**
 * Booking Service - Manages consultation bookings and scheduling
 * Inspired by Cal.com functionality for appointment scheduling
 */

export interface BookingSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

export interface BookingData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  goal: string;
  notes?: string;
}

export interface BookingResponse {
  success: boolean;
  bookingId?: string;
  message: string;
  confirmationUrl?: string;
}

/**
 * Get available booking slots for consultation
 */
export const getAvailableSlots = async (date?: Date): Promise<BookingSlot[]> => {
  // In a real implementation, this would fetch from a backend API
  // For now, generate sample slots
  const slots: BookingSlot[] = [];
  const startDate = date || new Date();
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    
    // Skip weekends
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;
    
    // Generate time slots (9 AM - 5 PM)
    for (let hour = 9; hour < 17; hour++) {
      slots.push({
        id: `${currentDate.toISOString().split('T')[0]}-${hour}`,
        date: currentDate.toISOString().split('T')[0],
        time: `${hour}:00`,
        available: Math.random() > 0.3, // Simulate availability
      });
    }
  }
  
  return slots.filter(slot => slot.available);
};

/**
 * Create a new booking
 */
export const createBooking = async (bookingData: BookingData): Promise<BookingResponse> => {
  try {
    // Validate booking data
    if (!bookingData.name || !bookingData.email || !bookingData.date || !bookingData.time) {
      return {
        success: false,
        message: 'Please fill in all required fields',
      };
    }
    
    // In a real implementation, this would send to a backend API
    // For now, use the existing external booking URL
    const bookingId = `BK-${Date.now()}`;
    
    // Store booking data in localStorage for tracking
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingBookings.push({
      ...bookingData,
      bookingId,
      createdAt: new Date().toISOString(),
      status: 'pending',
    });
    localStorage.setItem('bookings', JSON.stringify(existingBookings));
    
    // Redirect to external booking system
    const bookingUrl = 'https://tinyurl.com/bookptd';
    
    return {
      success: true,
      bookingId,
      message: 'Booking created successfully! Redirecting to scheduling...',
      confirmationUrl: bookingUrl,
    };
  } catch (error) {
    console.error('Booking error:', error);
    return {
      success: false,
      message: 'Failed to create booking. Please try again.',
    };
  }
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId: string): Promise<BookingResponse> => {
  try {
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedBookings = existingBookings.map((booking: any) => 
      booking.bookingId === bookingId 
        ? { ...booking, status: 'cancelled', cancelledAt: new Date().toISOString() }
        : booking
    );
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    
    return {
      success: true,
      message: 'Booking cancelled successfully',
    };
  } catch (error) {
    console.error('Cancellation error:', error);
    return {
      success: false,
      message: 'Failed to cancel booking. Please try again.',
    };
  }
};

/**
 * Get user's bookings
 */
export const getUserBookings = (email: string) => {
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  return bookings.filter((booking: any) => booking.email === email);
};
