import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Mail, Phone, Target } from 'lucide-react';
import Button from './Button';
import { getAvailableSlots, createBooking, BookingSlot, BookingData } from '../services/bookingService';
import { createLead } from '../services/leadService';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledData?: Partial<BookingData>;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, prefilledData }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [formData, setFormData] = useState<Partial<BookingData>>({
    name: prefilledData?.name || '',
    email: prefilledData?.email || '',
    phone: prefilledData?.phone || '',
    goal: prefilledData?.goal || '',
    notes: '',
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAvailableSlots();
    }
  }, [isOpen]);

  const loadAvailableSlots = async () => {
    setLoading(true);
    try {
      const slots = await getAvailableSlots();
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Failed to load slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !selectedDate || !selectedTime) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Create lead first
      await createLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        goal: formData.goal,
        source: 'booking-modal',
        location: 'Dubai',
      });

      // Create booking
      const result = await createBooking({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        date: selectedDate,
        time: selectedTime,
        goal: formData.goal || '',
        notes: formData.notes,
      });

      if (result.success) {
        alert('Booking request submitted! Redirecting to confirmation...');
        if (result.confirmationUrl) {
          window.location.href = result.confirmationUrl;
        }
        onClose();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUniqueDates = (): string[] => {
    const dates = [...new Set(availableSlots.map(slot => slot.date))] as string[];
    return dates.slice(0, 5); // Show next 5 available dates
  };

  const getTimesForDate = (date: string) => {
    return availableSlots
      .filter(slot => slot.date === date && slot.available)
      .map(slot => slot.time);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Book Your Consultation</h2>
            <p className="text-gray-600 text-sm mt-1">Step {step} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">Your Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="+971 XX XXX XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target size={16} className="inline mr-2" />
                  Primary Goal *
                </label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                >
                  <option value="">Select your primary goal</option>
                  <option value="energy">Energy Optimization</option>
                  <option value="physique">Metabolic Efficiency</option>
                  <option value="longevity">Executive Longevity</option>
                  <option value="performance">Peak Performance</option>
                  <option value="weight">Weight Management</option>
                </select>
              </div>

              <Button onClick={() => setStep(2)} fullWidth>
                Continue to Date Selection
              </Button>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">Select Date & Time</h3>

              {loading ? (
                <div className="text-center py-8">Loading available slots...</div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-2" />
                      Select Date *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {getUniqueDates().map(date => (
                        <button
                          key={date}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedTime('');
                          }}
                          className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                            selectedDate === date
                              ? 'border-black bg-black text-white'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock size={16} className="inline mr-2" />
                        Select Time *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {getTimesForDate(selectedDate).map(time => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-2 border rounded-lg text-sm font-medium transition-all ${
                              selectedTime === time
                                ? 'border-black bg-black text-white'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-2 mt-6">
                <Button onClick={() => setStep(1)} fullWidth variant="secondary">
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  fullWidth
                  disabled={!selectedDate || !selectedTime}
                >
                  Continue to Review
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">Review Your Booking</h3>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                {formData.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{formData.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Goal:</span>
                  <span className="font-medium">{formData.goal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Any specific concerns or questions you'd like to discuss..."
                />
              </div>

              <div className="flex gap-2 mt-6">
                <Button onClick={() => setStep(2)} fullWidth variant="secondary">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  fullWidth
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
