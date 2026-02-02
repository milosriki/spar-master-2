import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white py-12 px-4">
      <div className="max-w-3xl mx-auto text-center md:text-left">
        <div className="mb-8">
          <h2 className="text-2xl font-black mb-2">SPARK MASTERY</h2>
          <p className="text-gray-400 text-lg">Precision Performance for the Dubai Executive.</p>
        </div>
        
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Spark Mastery. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;