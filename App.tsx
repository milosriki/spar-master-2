import React from 'react';
import Hero from './components/Hero';
import ValueProps from './components/ValueProps';
import AiAudit from './components/AiAudit';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import Button from './components/Button';
import Section from './components/Section';

function App() {
  const handleBooking = () => {
    window.location.href = 'https://tinyurl.com/bookptd';
  };

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-accent selection:text-white">
      <Hero />
      <ValueProps />
      
      {/* Layer-Cake Logic: Break the reading pattern with the interactive element */}
      <AiAudit />
      
      <Section id="method" className="py-12">
        <h2 className="text-3xl font-black mb-8">The Protocol</h2>
        <div className="space-y-6 text-xl text-gray-700 leading-relaxed">
          <p>
            <strong>Phase 1: Metric Analysis.</strong> We don't guess. We measure blood, sleep, and stress markers to establish a physiological baseline.
          </p>
          <p>
            <strong>Phase 2: Metabolic Reset.</strong> A 21-day nutrition shift to adapt your body to burn stored energy, eliminating cravings and afternoon fatigue.
          </p>
          <p>
            <strong>Phase 3: Hypertrophy & Longevity.</strong> Minimal effective dose training. 3 hours per week. Maximum hormonal response.
          </p>
        </div>
      </Section>

      <Testimonials />
      
      {/* Final CTA Section - Sticky Concept Logic (though placed at bottom, it's the final catch) */}
      <Section id="apply" className="bg-white border-t border-gray-200">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            Slots are strictly limited.
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto">
            I work personally with every client. Quality control is my obsession. If you are ready to treat your body like a billion-dollar asset, let's talk.
          </p>
          <Button size="xl" onClick={handleBooking}>
            Apply For Consultation
          </Button>
          <p className="mt-4 text-gray-500 text-sm">
            Serious inquiries only. Dubai based.
          </p>
        </div>
      </Section>

      <Footer />
      
      {/* Sticky Mobile CTA for ease of access */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 md:hidden z-50">
        <Button fullWidth onClick={() => document.getElementById('apply')?.scrollIntoView({behavior: 'smooth'})}>
            Apply Now
        </Button>
      </div>
    </div>
  );
}

export default App;