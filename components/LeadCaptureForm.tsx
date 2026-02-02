import React, { useState } from 'react';
import { Mail, User, Phone, MapPin, Target } from 'lucide-react';
import Button from './Button';
import { createLead, LeadInput } from '../services/leadService';

interface LeadCaptureFormProps {
  source: string;
  onSuccess?: (leadId: string) => void;
  compact?: boolean;
  prefilledData?: Partial<LeadInput>;
}

const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({ 
  source, 
  onSuccess,
  compact = false,
  prefilledData 
}) => {
  const [formData, setFormData] = useState<Partial<LeadInput>>({
    name: prefilledData?.name || '',
    email: prefilledData?.email || '',
    phone: prefilledData?.phone || '',
    goal: prefilledData?.goal || '',
    ageRange: prefilledData?.ageRange || '',
    location: prefilledData?.location || '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert('Please fill in at least your name and email');
      return;
    }

    setLoading(true);
    try {
      const lead = await createLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        goal: formData.goal,
        ageRange: formData.ageRange,
        location: formData.location,
        source,
      });

      setSubmitted(true);
      if (onSuccess) {
        onSuccess(lead.id);
      }

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          goal: '',
          ageRange: '',
          location: '',
        });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to submit lead:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 text-lg font-bold mb-2">
          ✓ Thank You!
        </div>
        <p className="text-gray-700">
          We've received your information and will be in touch shortly.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            placeholder="Your Name"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            placeholder="Email"
            required
          />
        </div>
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Submitting...' : 'Get Started'}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-xl font-bold mb-4">Get Your Free Consultation</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <MapPin size={16} className="inline mr-2" />
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Dubai, UAE"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age Range
          </label>
          <select
            name="ageRange"
            value={formData.ageRange}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="">Select age range</option>
            <option value="30-39">30-39</option>
            <option value="40-49">40-49</option>
            <option value="50-59">50-59</option>
            <option value="60+">60+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Target size={16} className="inline mr-2" />
            Primary Goal
          </label>
          <select
            name="goal"
            value={formData.goal}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="">Select your primary goal</option>
            <option value="energy">Energy Optimization</option>
            <option value="physique">Metabolic Efficiency</option>
            <option value="longevity">Executive Longevity</option>
            <option value="performance">Peak Performance</option>
            <option value="weight">Weight Management</option>
          </select>
        </div>
      </div>

      <Button type="submit" fullWidth disabled={loading} size="lg">
        {loading ? 'Submitting...' : 'Submit & Book Consultation'}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        By submitting, you agree to receive communications about our services.
      </p>
    </form>
  );
};

export default LeadCaptureForm;
