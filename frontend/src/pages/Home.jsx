import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import RequestCard from '../components/RequestCard';
import DonorCard from '../components/DonorCard';
import LiveDonorMap from '../components/LiveDonorMap';
import { Droplet, Search, MapPin, Sparkles, Activity, ShieldCheck, HeartHandshake, UserPlus } from 'lucide-react';

const Home = () => {
  const { user: authUser, applicationProfile: user } = useContext(AuthContext);
  const [activeRequests, setActiveRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Quick lookup state
  const [bloodGroup, setBloodGroup] = useState('O-');
  const [locationInput, setLocationInput] = useState('');
  const [matchedDonors, setMatchedDonors] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Fetch active requests
  useEffect(() => {
    const fetchActiveRequests = async () => {
      try {
        const res = await api.get('/requests/active');
        if (res.data && res.data.success) {
          setActiveRequests(res.data.requests);
        }
      } catch (err) {
        console.error('Failed to load active requests:', err);
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchActiveRequests();
  }, []);

  const handleQuickLookup = async (e) => {
    e.preventDefault();
    if (!locationInput.trim()) return;

    setLookupLoading(true);
    setSearched(true);
    try {
      const res = await api.post('/requests/match', {
        bloodGroup,
        hospitalAddress: locationInput
      });
      if (res.data && res.data.success) {
        setMatchedDonors(res.data.matchedDonors);
      }
    } catch (err) {
      console.error('Lookup matching failed:', err);
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20">
      {/* HERO SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4">
        <div className="lg:col-span-7 space-y-6">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-brand-700 text-xs font-bold uppercase tracking-wider"
            style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Empowering Proximity Transfusions
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight" style={{ color: 'var(--text-heading)' }}>
            Your Proximity-Based <span className="text-brand-600">Lifeline</span>
          </h1>
          <p className="text-sm md:text-base max-w-xl leading-relaxed font-semibold" style={{ color: 'var(--text-muted)' }}>
            Jeevan 2.0 bridges the gap between patient locations and nearby active donors. Using AI-powered matching, we calculate compatibility scores based on blood group, eligibility, proximity, and donor health screening.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {user ? (
              <Link
                to="/create-request"
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-brand-600/20 flex items-center gap-2"
              >
                <Droplet className="w-4 h-4 fill-current" />
                Request Blood Now
              </Link>
            ) : (
              <div className="flex gap-4">
                <Link
                  to="/register"
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-brand-600/20 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Join Jeevan 2.0
                </Link>
                <Link
                  to="/login"
                  className="font-bold py-3.5 px-6 rounded-xl transition-all"
                  style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-heading)' }}
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* HERO PROMO STATS */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {[
            { icon: <Activity className="w-7 h-7 text-brand-500" />, title: '24-Hour TTL', desc: 'Auto-deletion index guarantees only active emergencies are shown.' },
            { icon: <MapPin className="w-7 h-7 text-sky-500" />, title: 'Proximity Match', desc: 'AI algorithm scores donors by blood compatibility and physical proximity.' },
            { icon: <ShieldCheck className="w-7 h-7 text-emerald-500" />, title: 'AI Matching', desc: 'Multi-factor scoring: blood type, eligibility, availability & distance.' },
            { icon: <HeartHandshake className="w-7 h-7 text-amber-500" />, title: 'SMS Alerts', desc: 'Top matched donors receive automated emergency notifications.' }
          ].map((card, i) => (
            <div key={i} className="p-5 card-panel space-y-2" style={{ border: '1px solid var(--card-border)' }}>
              {card.icon}
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>{card.title}</h3>
              <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--text-muted)' }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE DONOR MAP */}
      <section>
        <LiveDonorMap />
      </section>

      {/* QUICK LOOKUP WIDGET */}
      <section className="p-6 md:p-8 card-panel shadow-md" style={{ border: '1px solid var(--card-border)' }}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-bold tracking-wide" style={{ color: 'var(--text-heading)' }}>
              Quick Proximity Matcher
            </h2>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              Test Jeevan 2.0's AI matching engine instantly. Select blood group and enter location.
            </p>
          </div>

          <form onSubmit={handleQuickLookup} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Target Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-heading)' }}
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((gp) => (
                  <option key={gp} value={gp}>{gp} (Show matching donors)</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Hospital Address / City
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. T Nagar, Chennai or Bandra, Mumbai"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full rounded-xl pl-4 pr-12 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-heading)' }}
                />
                <button type="submit" className="absolute right-1.5 top-1.5 bg-brand-600 hover:bg-brand-700 p-2 rounded-lg text-white transition-all cursor-pointer">
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>

          {/* Matches */}
          {searched && (
            <div className="pt-5 space-y-4" style={{ borderTop: '1px solid var(--card-border)' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Matches Found: {matchedDonors.length} compatible donor{matchedDonors.length === 1 ? '' : 's'}
              </h3>

              {lookupLoading ? (
                <div className="flex justify-center items-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-brand-500"></div>
                </div>
              ) : matchedDonors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchedDonors.slice(0, 4).map((donor) => (
                    <DonorCard key={donor._id} donor={donor} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  No active/available compatible donors found near "{locationInput}". Try adding a location in Chennai, Bangalore, or Mumbai.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ACTIVE EMERGENCY REQUESTS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-wide" style={{ color: 'var(--text-heading)' }}>Live Urgent Requests</h2>
            <p className="text-xs font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>
              Active patient emergencies posted. Click to contact them directly.
            </p>
          </div>
          {user && (
            <Link to="/create-request" className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors uppercase tracking-wider">
              Post Request &rarr;
            </Link>
          )}
        </div>

        {loadingRequests ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-brand-500"></div>
          </div>
        ) : activeRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRequests.map((request) => (
              <RequestCard key={request._id} request={request} />
            ))}
          </div>
        ) : (
          <div className="p-10 card-panel text-center space-y-2" style={{ border: '1px solid var(--card-border)' }}>
            <Droplet className="w-10 h-10 mx-auto" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>No active emergency requests right now.</p>
            <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
              Register as a donor to be notified when blood requests are posted in your city.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
