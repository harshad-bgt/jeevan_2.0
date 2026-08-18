import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Droplet, User, LogOut, PlusCircle, Menu, X, Activity, ChevronDown, Sun, Moon, Building2, Database } from 'lucide-react';

const Navbar = () => {
  const { user, applicationProfile: profile, logout, toggleAvailability } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('jeevan_theme') || 'light');

  // Initialize and synchronize theme class on document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('jeevan_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const roleLabel = profile?.role === 'hospital' ? 'Hospital' : profile?.role === 'bloodbank' ? 'Blood Bank' : 'Donor';

  return (
    <nav
      className="sticky top-0 z-50 py-3.5 px-6 backdrop-blur-md border-b transition-all duration-300"
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(9,9,11,0.92)' : 'rgba(255,255,255,0.95)',
        borderColor: 'var(--card-border)'
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div
            className="w-10 h-10 rounded-xl group-hover:scale-105 transition-all duration-300 flex items-center justify-center overflow-hidden bg-white/10"
          >
            <img src="/logo.png" alt="Jeevan Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-wider leading-none" style={{ color: 'var(--text-heading)' }}>
              JEEVAN 2.0
            </span>
            <span className="text-[9px] font-bold tracking-widest uppercase text-brand-600 mt-1">
              AI-Powered Blood Lifeline
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-semibold tracking-wide transition-colors ${
              isActive('/') ? 'text-brand-600' : ''
            }`}
            style={isActive('/') ? {} : { color: 'var(--text-muted)' }}
          >
            Home
          </Link>
          {user && (
            <>
              <Link
                to="/dashboard"
                className={`text-sm font-semibold tracking-wide transition-colors ${
                  isActive('/dashboard') ? 'text-brand-600' : ''
                }`}
                style={isActive('/dashboard') ? {} : { color: 'var(--text-muted)' }}
              >
                Dashboard
              </Link>
              <Link
                to="/create-request"
                className={`text-sm font-semibold tracking-wide transition-colors ${
                  isActive('/create-request') ? 'text-brand-600' : ''
                }`}
                style={isActive('/create-request') ? {} : { color: 'var(--text-muted)' }}
              >
                Request Blood
              </Link>
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`text-sm font-semibold tracking-wide transition-colors ${
                    isActive('/admin') ? 'text-brand-600' : ''
                  }`}
                  style={isActive('/admin') ? {} : { color: 'var(--text-muted)' }}
                >
                  Admin Panel
                </Link>
              )}
            </>
          )}
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden md:flex items-center gap-5">
          {/* Day / Night Theme Switch */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl transition-all cursor-pointer"
            style={{
              background: 'var(--subtle-bg)',
              border: '1px solid var(--card-border)',
              color: 'var(--text-muted)'
            }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {user ? (
            <>
              {/* Donor Status Toggle (only for donors) */}
              {profile?.role !== 'bloodbank' && (
                <div
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl"
                  style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}
                >
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Live:</span>
                  <button
                    onClick={toggleAvailability}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 focus:outline-none cursor-pointer ${
                      profile?.isAvailable ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                    title="Toggle active status"
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300 ${
                        profile?.isAvailable ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      profile?.isAvailable ? 'text-emerald-500' : ''
                    }`}
                    style={profile?.isAvailable ? {} : { color: 'var(--text-muted)' }}
                  >
                    {profile?.isAvailable ? 'Active' : 'Busy'}
                  </span>
                </div>
              )}

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 transition-all py-1.5 px-3 rounded-lg font-semibold text-sm cursor-pointer"
                  style={{ color: 'var(--text-heading)' }}
                >
                  <div className="w-6.5 h-6.5 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                    {profile?.name?.charAt(0) || user?.email?.charAt(0)}
                  </div>
                  <span>{profile?.name?.split(' ')[0] || user?.email?.split('@')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl shadow-2xl py-1 z-50"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
                  >
                    <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        {roleLabel} Account
                      </span>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 py-2.5 px-4 text-xs font-semibold transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 text-brand-600 hover:text-brand-700 py-2.5 px-4 text-xs font-bold border-t text-left cursor-pointer"
                      style={{ borderColor: 'var(--card-border)' }}
                    >
                      <LogOut className="w-4 h-4 text-brand-500" />
                      <span>Logout Account</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-semibold transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-brand-500/30"
              >
                Join Jeevan 2.0
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU BUTTON - Replaced by MobileBottomNav, just keep Theme/Live toggle on top right */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)' }}
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          {user && profile?.role !== 'bloodbank' && (
            <button
              onClick={toggleAvailability}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                profile?.isAvailable
                  ? 'border-emerald-400 text-emerald-500 bg-emerald-500/10'
                  : ''
              }`}
              style={profile?.isAvailable ? {} : { background: 'var(--subtle-bg)', borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}
              title="Toggle Status"
            >
              <Activity className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </nav>
  );
};

export default Navbar;
