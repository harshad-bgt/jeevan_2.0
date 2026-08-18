import React from 'react';
import { Heart, Droplet } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full mt-auto py-6 text-center border-t backdrop-blur-sm transition-all duration-300" style={{ borderColor: 'var(--card-border)', background: 'var(--app-bg)' }}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Droplet className="w-4 h-4 text-brand-600 fill-brand-600" />
          <span className="text-sm font-bold tracking-wide" style={{ color: 'var(--text-heading)' }}>
            JEEVAN 2.0
          </span>
        </div>
        <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} Jeevan AI-Powered Blood Lifeline. All rights reserved.
        </div>
        <div className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          Built with <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500 mx-0.5" /> for humanity
        </div>
      </div>
    </footer>
  );
};

export default Footer;
