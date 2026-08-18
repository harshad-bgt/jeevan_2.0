import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import DonorCard from '../components/DonorCard';
import { Droplet, ArrowLeft, Sparkles, AlertCircle, MapPin, CheckCircle2 } from 'lucide-react';

const DonorList = () => {
  const location = useLocation();
  const state = location.state || {};
  const { matchedDonors = [], bloodGroup = '', hospitalAddress = '', patientName = '', unitsRequired = 1, urgency = 'Urgent' } = state;

  if (!bloodGroup || !hospitalAddress) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center space-y-6">
        <div className="card-panel p-8 space-y-4" style={{ border: '1px solid var(--card-border)' }}>
          <AlertCircle className="w-12 h-12 text-brand-500 mx-auto" />
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>No active matches loaded</h2>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            Please make an emergency request from the Request Blood page first to locate compatible donors.
          </p>
          <Link
            to="/create-request"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all"
          >
            Create Request
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      {/* Back Button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold transition-all uppercase tracking-wider"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      {/* REQUEST METADATA PROFILE */}
      <section className="p-6 card-panel shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center" style={{ border: '1px solid var(--card-border)' }}>
        <div className="md:col-span-2 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand-600 px-2.5 py-0.5 rounded uppercase tracking-widest" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}>
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            AI Matching Engine Complete
          </div>
          <h2 className="text-2xl font-black tracking-wide" style={{ color: 'var(--text-heading)' }}>
            Matches for Patient {patientName}
          </h2>
          <div className="flex items-start gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
            <span>Hospital location: {hospitalAddress}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl justify-center" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Required</span>
            <span className="text-xl font-black text-brand-600 mt-0.5">{bloodGroup}</span>
          </div>
          <div className="w-px h-8" style={{ background: 'var(--card-border)' }} />
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Quantity</span>
            <span className="text-xl font-black mt-0.5" style={{ color: 'var(--text-heading)' }}>
              {unitsRequired} {unitsRequired === 1 ? 'Unit' : 'Units'}
            </span>
          </div>
        </div>
      </section>

      {/* SMS ALERTS BROADCAST CONFIRMATION */}
      {matchedDonors.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--text-heading)' }}>
            <span className="font-bold block mb-0.5 text-emerald-600">Automated Proximity Alerts Sent!</span>
            Jeevan 2.0 has auto-triggered fallback emergency SMS notifications to top matched compatible donors ({matchedDonors.slice(0, 3).map(d => d.name).join(', ')}). Coordinate with them directly via WhatsApp below.
          </div>
        </div>
      )}

      {/* DONORS RESULTS LIST */}
      <section className="space-y-4">
        <h3 className="text-base font-bold uppercase tracking-widest" style={{ color: 'var(--text-heading)' }}>
          Compatible Nearby Donors ({matchedDonors.length} found)
        </h3>

        {matchedDonors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matchedDonors.map((donor) => (
              <DonorCard key={donor._id} donor={donor} />
            ))}
          </div>
        ) : (
          <div className="p-10 card-panel text-center space-y-2" style={{ border: '1px solid var(--card-border)' }}>
            <Droplet className="w-12 h-12 mx-auto" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>No compatible available donors found nearby.</p>
            <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
              Try checking back later or broadening your request address coordinates.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default DonorList;
