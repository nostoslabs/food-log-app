import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} <a href="https://nostoslabs.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline font-medium">Nostos Labs</a>. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Building tools for better health and wellness
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <a 
              href="/privacy" 
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="https://nostoslabs.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              More by Nostos Labs →
            </a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            foodlogger.me - Track your nutrition for better health outcomes
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;