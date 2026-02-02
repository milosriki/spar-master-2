import React from 'react';
import Button from './Button';
import { CheckCircle2, TrendingUp } from 'lucide-react';

interface HeroProps {
  onBookingClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBookingClick }) => {
  const scrollToAudit = () => {
    document.getElementById('audit')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCTAClick = () => {
    if (onBookingClick) {
      onBookingClick();
    } else {
      scrollToAudit();
    }
  };

  return (
    <header className="relative pt-8 pb-16 px-4 md:pt-16 md:pb-24 bg-background">
      <div className="max-w-3xl mx-auto">
        {/* Pre-headline Authority Signal */}
        <div className="inline-flex items-center space-x-2 bg-blue-100 text-primary px-3 py-1 rounded-full text-base font-bold mb-6">
          <TrendingUp className="w-5 h-5 text-accent" />
          <span className="uppercase tracking-wider text-sm md:text-base">For Executives 40+ in Dubai</span>
        </div>

        {/* Main Headline - High Contrast, Heavy Weight */}
        <h1 className="text-4xl md:text-5xl font-black text-primary leading-[1.1] mb-6 tracking-tight">
          Reclaim Your <span className="text-accent underline decoration-4 underline-offset-4">Prime</span>.
          <br />
          Maximize Your Biological Asset.
        </h1>

        {/* Subheadline - Readable size (20px+) */}
        <p className="text-xl text-gray-700 leading-relaxed mb-8 max-w-2xl">
          A precision health protocol for men who manage billion-dollar portfolios but need to manage their metabolic decline. Zero guesswork. High ROI.
        </p>

        {/* Action Chunk */}
        <div className="flex flex-col gap-4 mb-10">
          <Button onClick={handleCTAClick} size="xl" fullWidth className="md:w-auto shadow-orange-500/20">
            Start Your Transformation
          </Button>
          <p className="text-base text-gray-500 italic text-center md:text-left mt-2">
            Limited strictly to 5 executive slots per quarter.
          </p>
        </div>

        {/* Trust Indicators - Chunked in 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-200 pt-8">
          {[
            "Science-Based Protocol",
            "Data-Driven Nutrition",
            "Executive-Compatible Time"
          ].map((item, i) => (
            <div key={i} className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
              <span className="font-bold text-lg text-primary">{item}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Visual Cue for Scroll - Anti False Bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce opacity-50 hidden md:block">
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </header>
  );
};

export default Hero;