import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Droplet, MapPin, Sparkles, PlusCircle, AlertCircle, ShieldAlert } from 'lucide-react';

const CreateRequest = () => {
  const navigate = useNavigate();

  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O-');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [unitsRequired, setUnitsRequired] = useState(1);
  const [urgency, setUrgency] = useState('Urgent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/requests/create', {
        patientName,
        bloodGroup,
        hospitalAddress,
        unitsRequired: Number(unitsRequired),
        urgency
      });

      if (res.data && res.data.success) {
        navigate('/donors', {
          state: {
            matchedDonors: res.data.matchedDonors,
            bloodGroup,
            hospitalAddress,
            patientName,
            unitsRequired,
            urgency
          }
        });
      }
    } catch (err) {
      console.error('Request creation error:', err);
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-heading)' };
  const labelStyle = { color: 'var(--text-muted)' };

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <div className="card-panel p-8 space-y-6" style={{ border: '1px solid var(--card-border)' }}>
        
        {/* HEADER */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-2.5 rounded-2xl" style={{ background: 'rgba(220,38,38,0.08)' }}>
            <PlusCircle className="w-7 h-7 text-brand-600" />
          </div>
          <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>Request Blood</h2>
          <p className="text-xs font-semibold" style={labelStyle}>
            Fill in patient details to geocode and find nearby AI-matched donors
          </p>
        </div>

        {/* ERROR BOX */}
        {error && (
          <div className="p-3.5 text-brand-700 text-xs font-semibold rounded-xl flex items-center gap-2" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}>
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* REQUEST FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={labelStyle}>
              Patient Name
            </label>
            <input
              type="text"
              required
              placeholder="Patient Name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={labelStyle}>
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                style={inputStyle}
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((gp) => (
                  <option key={gp} value={gp}>
                    {gp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={labelStyle}>
                Units Required
              </label>
              <input
                type="number"
                required
                min="1"
                max="20"
                value={unitsRequired}
                onChange={(e) => setUnitsRequired(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={labelStyle}>
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                style={inputStyle}
              >
                <option value="Critical">Critical</option>
                <option value="Urgent">Urgent</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={labelStyle}>
              Hospital Address / Landmark
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Hospital Address / Landmark"
                value={hospitalAddress}
                onChange={(e) => setHospitalAddress(e.target.value)}
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                style={inputStyle}
              />
              <MapPin className="absolute left-3.5 top-3 w-4 h-4" style={labelStyle} />
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-[10px] font-semibold" style={labelStyle}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>We locate compatible available donors in this vicinity.</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-600/20 cursor-pointer"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit & Match Nearby Donors</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CreateRequest;
