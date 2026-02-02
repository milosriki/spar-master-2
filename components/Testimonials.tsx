import React from 'react';
import Section from './Section';
import { Quote } from 'lucide-react';
import { Testimonial } from '../types';

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Ahmed K.",
    role: "Managing Director",
    company: "Real Estate Holdings",
    quote: "I didn't have time for a gym. The Spark protocol gave me back 2 hours a day in pure focus energy.",
    result: "Lost 12kg in 90 days"
  },
  {
    id: "2",
    name: "James W.",
    role: "Senior Partner",
    company: "Legal Consultancy",
    quote: "Direct, brutal honesty, and results. Exactly how I run my business, and exactly what I needed for my health.",
    result: "Reversed Pre-Diabetes"
  }
];

const Testimonials: React.FC = () => {
  return (
    <Section alternate className="border-t border-gray-200">
      <h2 className="text-3xl font-black text-primary mb-10">
        Peer Validation.<br />
        <span className="text-gray-500 text-2xl font-bold">Results speak louder.</span>
      </h2>
      
      <div className="grid grid-cols-1 gap-8">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-white p-8 rounded-xl shadow-sm border-l-4 border-accent">
            <Quote className="w-8 h-8 text-gray-300 mb-4" />
            <p className="text-xl text-primary font-medium italic mb-6">
              "{t.quote}"
            </p>
            <div className="flex flex-col md:flex-row md:items-end justify-between">
               <div>
                  <div className="font-bold text-lg text-primary">{t.name}</div>
                  <div className="text-gray-500">{t.role}, {t.company}</div>
               </div>
               <div className="mt-2 md:mt-0 inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold text-sm">
                 Verified Result: {t.result}
               </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Testimonials;