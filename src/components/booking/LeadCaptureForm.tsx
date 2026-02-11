import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Loader2, Mail, User, Sparkles } from 'lucide-react';
import { AICoachService, AIHabitPlan } from '@/services/AICoachService';
import { createLead, LeadInput } from '@/services/leadService';

interface LeadCaptureFormProps {
  source?: string;
  compact?: boolean;
  onSuccess?: (leadId: string, plan?: AIHabitPlan) => void;
}

export const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
  source = 'ai_coach',
  compact = false,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    goal: '',
    ageRange: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please enter your name and email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const input: LeadInput = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        goal: formData.goal || undefined,
        ageRange: formData.ageRange || undefined,
        location: formData.location || undefined,
        source,
      };

      // 1. Capture Lead
      const lead = await createLead(input);
      
      // 2. Generate AI Plan (if goal provided)
      let aiPlan: AIHabitPlan | undefined;
      if (formData.goal) {
        setGeneratingPlan(true);
        try {
           aiPlan = await AICoachService.generateHabitPlan(formData.goal, formData.ageRange);
        } catch (aiError) {
           console.error("AI Plan Generation Failed:", aiError);
           // Continue without plan (graceful degradation)
        } finally {
           setGeneratingPlan(false);
        }
      }

      setSubmitted(true);
      onSuccess?.(lead.id, aiPlan);

      // Auto-reset after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', goal: '', ageRange: '', location: '' });
      }, 3000);
    } catch (err) {
      console.error('Lead capture failed:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
        <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-emerald-300 font-medium text-center">
            Thanks! We'll be in touch soon.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Compact form (inline)
  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            className="bg-slate-800/50 border-slate-600/50 text-white text-sm placeholder:text-slate-500"
          />
        </div>
        <div className="flex-1">
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="bg-slate-800/50 border-slate-600/50 text-white text-sm placeholder:text-slate-500"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          size="sm"
          className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Get Started'}
        </Button>
      </form>
    );
  }

  // Full form
  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-slate-700/50 backdrop-blur-xl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-4">
            <Sparkles className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-white">Get Your Free Fitness Plan</h3>
            <p className="text-xs text-slate-400">Join 500+ Dubai professionals who've transformed</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lc-name" className="text-slate-400 text-xs flex items-center gap-1">
                <User className="w-3 h-3" /> Name *
              </Label>
              <Input
                id="lc-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="bg-slate-800/50 border-slate-600/50 text-white text-sm placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lc-email" className="text-slate-400 text-xs flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email *
              </Label>
              <Input
                id="lc-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@email.com"
                className="bg-slate-800/50 border-slate-600/50 text-white text-sm placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lc-age" className="text-slate-400 text-xs">Age Range</Label>
              <select
                id="lc-age"
                name="ageRange"
                value={formData.ageRange}
                onChange={handleChange}
                className="w-full rounded-md bg-slate-800/50 border border-slate-600/50 text-white text-sm p-2"
              >
                <option value="">Select...</option>
                <option value="20-30">20-30</option>
                <option value="30-40">30-40</option>
                <option value="35-45">35-45</option>
                <option value="40-50">40-50</option>
                <option value="45-55">45-55</option>
                <option value="55+">55+</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lc-location" className="text-slate-400 text-xs">Area</Label>
              <select
                id="lc-location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-md bg-slate-800/50 border border-slate-600/50 text-white text-sm p-2"
              >
                <option value="">Select...</option>
                <option value="Business Bay">Business Bay</option>
                <option value="DIFC">DIFC</option>
                <option value="Downtown">Downtown</option>
                <option value="Marina">Marina</option>
                <option value="Palm Jumeirah">Palm Jumeirah</option>
                <option value="JBR">JBR</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lc-goal" className="text-slate-400 text-xs">Fitness Goal</Label>
            <Input
              id="lc-goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              placeholder="e.g. Lose 10kg, build muscle, manage stress..."
              className="bg-slate-800/50 border-slate-600/50 text-white text-sm placeholder:text-slate-500"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {generatingPlan ? 'Designing Plan...' : 'Submitting...'}</>
            ) : (
              'Get My Free Plan →'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LeadCaptureForm;
