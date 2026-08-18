import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Droplet, User, Map } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const MobileBottomNav = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Render a mobile tab item
  const renderTab = (path, icon, label) => {
    const active = isActive(path);
    return (
      <Link
        to={path}
        className={`flex flex-col items-center justify-center w-full py-2.5 transition-all duration-300 ${active ? 'text-brand-600 scale-110' : 'text-gray-500 hover:text-gray-400'}`}
        style={active ? {} : { color: 'var(--text-muted)' }}
      >
        <div className={`relative ${active ? 'mb-1' : 'mb-0.5'}`}>
          {icon}
          {active && (
            <span className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-brand-600 rounded-full animate-pulse" />
          )}
        </div>
        <span className={`text-[10px] font-bold tracking-wide ${active ? 'opacity-100' : 'opacity-70'}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 w-full z-50 backdrop-blur-xl border-t pb-safe transition-all duration-300"
      style={{
        backgroundColor: 'var(--mobile-nav-bg)',
        borderColor: 'var(--card-border)',
        boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="flex items-center justify-between px-2">
        {renderTab('/', <Home className="w-5.5 h-5.5" />, 'Home')}
        
        {user ? (
          <>
            {renderTab('/dashboard', <Map className="w-5.5 h-5.5" />, 'Hub')}
            {renderTab('/create-request', <Droplet className={`w-5.5 h-5.5 ${isActive('/create-request') ? 'fill-current' : ''}`} />, 'Request')}
            {renderTab('/profile', <User className="w-5.5 h-5.5" />, 'Profile')}
          </>
        ) : (
          <>
            {renderTab('/login', <User className="w-5.5 h-5.5" />, 'Login')}
          </>
        )}
      </div>
    </div>
  );
};

export default MobileBottomNav;
