import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  alternate?: boolean; // If true, use white background instead of off-white
}

const Section: React.FC<SectionProps> = ({ children, className = '', id, alternate = false }) => {
  return (
    <section 
      id={id} 
      className={`py-16 md:py-24 px-4 md:px-8 ${alternate ? 'bg-surface' : 'bg-background'} ${className}`}
    >
      <div className="max-w-3xl mx-auto">
        {children}
      </div>
    </section>
  );
};

export default Section;