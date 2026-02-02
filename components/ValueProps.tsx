import React from 'react';
import Section from './Section';
import { Brain, Battery, ShieldCheck } from 'lucide-react';
import { Benefit } from '../types';

const benefits: Benefit[] = [
  {
    title: "Restore Executive Focus",
    description: "Eliminate brain fog. We optimize your neurochemistry through targeted nutrition and sleep protocols, returning your cognitive sharpness to its peak.",
    icon: <Brain className="w-10 h-10 text-accent" strokeWidth={1.5} />,
  },
  {
    title: "Double Daily Energy",
    description: "Bypass the afternoon crash. Our metabolic conditioning trains your body to burn fat for fuel, providing a stable, high-output energy source all day.",
    icon: <Battery className="w-10 h-10 text-accent" strokeWidth={1.5} />,
  },
  {
    title: "Future-Proof Health",
    description: "Reduce cardiovascular risk. We use clinical data to design a regimen that strengthens your heart and joints, ensuring longevity to enjoy your wealth.",
    icon: <ShieldCheck className="w-10 h-10 text-accent" strokeWidth={1.5} />,
  }
];

const ValueProps: React.FC = () => {
  return (
    <Section alternate id="benefits">
      <h2 className="text-3xl md:text-4xl font-black text-primary mb-12 leading-tight">
        ROI Beyond the Boardroom.<br/>
        <span className="text-gray-500">Why optimization matters.</span>
      </h2>
      
      <div className="space-y-12">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0 bg-orange-50 p-4 rounded-xl">
              {benefit.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary mb-3">
                {benefit.title}
              </h3>
              <p className="text-xl text-gray-700 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default ValueProps;