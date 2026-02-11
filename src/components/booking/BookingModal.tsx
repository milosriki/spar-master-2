import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  User, Mail, Phone, Calendar, Clock,
  ChevronRight, ChevronLeft, Check, Loader2,
} from 'lucide-react';
import {
  BookingSlot,
  getAvailableSlots,
  createBooking,
} from '@/services/bookingService';
import { createLead } from '@/services/leadService';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillData?: {
    name?: string;
    email?: string;
    sessionType?: string;
    notes?: string;
    goal?: string;
  };
}

type Step = 1 | 2 | 3;

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  sessionType: 'consultation',
  notes: '',
};

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  prefillData,
}) => {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slots = useMemo(() => getAvailableSlots(), []);
  const availableDates = useMemo(
    () => [...new Set(slots.map((s) => s.date))],
    [slots]
  );
  const timesForDate = useMemo(
    () => slots.filter((s) => s.date === selectedDate && s.available),
    [slots, selectedDate]
  );

  // Reset state when modal opens — auto-fill from AI context if available
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      // Build AI-enriched notes from prefill context
      const contextNotes = [
        prefillData?.goal && `Goal: ${prefillData.goal}`,
        prefillData?.notes,
      ].filter(Boolean).join(' | ');

      setFormData({
        ...INITIAL_FORM,
        name: prefillData?.name || '',
        email: prefillData?.email || '',
        sessionType: prefillData?.sessionType || 'consultation',
        notes: contextNotes || '',
      });
      setSelectedDate(null);
      setSelectedTime(null);
      setError(null);
      setLoading(false);
    }
  }, [isOpen, prefillData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const canProceedStep1 = formData.name.trim() && formData.email.trim();
  const canProceedStep2 = selectedDate && selectedTime;

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;
    setLoading(true);
    setError(null);

    try {
      // Capture lead first
      await createLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        source: 'booking_modal',
      });

      // Create booking
      const result = await createBooking({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        date: selectedDate,
        time: selectedTime,
        sessionType: formData.sessionType,
        notes: formData.notes || undefined,
        source: 'spark_mastery',
      });

      if (result.success) {
        if (result.confirmationUrl) {
          window.open(result.confirmationUrl, '_blank', 'noopener,noreferrer');
        }
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedSlot = slots.find(
    (s) => s.date === selectedDate && s.time === selectedTime
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Book Your Consultation
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {step === 1 && 'Tell us about yourself'}
            {step === 2 && 'Choose your preferred time'}
            {step === 3 && 'Review and confirm'}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 my-2">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s === step
                    ? 'bg-orange-500 text-white ring-2 ring-orange-400/30'
                    : s < step
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-700/50 text-slate-500 border border-slate-600/30'
                }`}
              >
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 ${s < step ? 'bg-emerald-500/30' : 'bg-slate-700/50'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@email.com"
                className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone (optional)
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+971 50..."
                className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionType" className="text-slate-300">Session Type</Label>
              <select
                id="sessionType"
                name="sessionType"
                value={formData.sessionType}
                onChange={handleChange}
                className="w-full rounded-md bg-slate-800/50 border border-slate-600/50 text-white p-2 text-sm"
              >
                <option value="consultation">Free Consultation (30 min)</option>
                <option value="assessment">Fitness Assessment (60 min)</option>
                <option value="trial">Trial Session (45 min)</option>
              </select>
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 2: Date/Time Selection */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Select Date
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {availableDates.map((date) => {
                  const slot = slots.find((s) => s.date === date);
                  return (
                    <button
                      key={date}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedTime(null);
                      }}
                      className={`p-2.5 rounded-lg text-xs font-medium transition-all ${
                        selectedDate === date
                          ? 'bg-orange-500 text-white ring-2 ring-orange-400/30'
                          : 'bg-slate-800/50 text-slate-300 border border-slate-600/30 hover:border-orange-500/30'
                      }`}
                    >
                      {slot?.displayDate || date}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Select Time (GST)
                </Label>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                  {timesForDate.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`p-2 rounded-lg text-xs font-medium transition-all ${
                        selectedTime === slot.time
                          ? 'bg-orange-500 text-white ring-2 ring-orange-400/30'
                          : 'bg-slate-800/50 text-slate-300 border border-slate-600/30 hover:border-orange-500/30'
                      }`}
                    >
                      {slot.displayTime}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-slate-600 text-slate-300">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                Review <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="space-y-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
              <h3 className="text-sm font-semibold text-slate-300">Booking Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500 text-xs">Name</span>
                  <p className="text-white">{formData.name}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Email</span>
                  <p className="text-white">{formData.email}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Date</span>
                  <p className="text-white">{selectedSlot?.displayDate}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Time</span>
                  <p className="text-white">{selectedSlot?.displayTime} GST</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 text-xs">Session</span>
                  <p className="text-white capitalize">{formData.sessionType.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-300 text-sm">
                Additional Notes (optional)
              </Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any injuries, goals, or preferences..."
                rows={2}
                className="w-full rounded-md bg-slate-800/50 border border-slate-600/50 text-white placeholder:text-slate-500 p-2 text-sm resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 border-slate-600 text-slate-300">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Booking...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" /> Confirm Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
