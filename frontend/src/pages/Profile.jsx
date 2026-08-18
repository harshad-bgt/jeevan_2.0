import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  User,
  Phone,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  Activity,
  Calendar,
  Clock,
  Heart,
  AlertTriangle,
  Stethoscope,
  Scale,
  X,
  History,
  FileText,
  AlertCircle
} from 'lucide-react';

const Profile = () => {
  const { user: authUser, applicationProfile: user, updateProfile, submitHealthCheckup, error, setError } = useContext(AuthContext);

  // Edit Basic Profile Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [location, setLocation] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [weight, setWeight] = useState('65');
  const [hemoglobin, setHemoglobin] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Health Checkup Modal State
  const [showCheckupModal, setShowCheckupModal] = useState(false);
  const [checkupWeight, setCheckupWeight] = useState('65');
  const [checkupHb, setCheckupHb] = useState('');
  const [checkupHealth, setCheckupHealth] = useState('Healthy');
  const [checkupConditions, setCheckupConditions] = useState(['None']);
  const [checkupMeds, setCheckupMeds] = useState('None');
  const [checkupIllness, setCheckupIllness] = useState(false);
  const [checkupTattoo, setCheckupTattoo] = useState(false);
  const [checkupPregnancy, setCheckupPregnancy] = useState('Not Applicable');
  const [checkupDonationType, setCheckupDonationType] = useState('First-Time Donor');
  const [checkupLastDonationDate, setCheckupLastDonationDate] = useState('');
  const [checkupLoading, setCheckupLoading] = useState(false);
  const [checkupSuccessMsg, setCheckupSuccessMsg] = useState(null);

  // Sync state with logged in user details
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setBloodGroup(user.bloodGroup || 'O+');
      setLocation(user.location || '');
      setGender(user.gender || 'Male');
      setWeight(user.weight ? String(user.weight) : '65');
      setHemoglobin(user.hemoglobin ? String(user.hemoglobin) : '');

      if (user.dob) {
        const formattedDob = new Date(user.dob).toISOString().split('T')[0];
        setDob(formattedDob);
      }

      // Checkup Modal sync
      setCheckupWeight(user.weight ? String(user.weight) : '65');
      setCheckupHb(user.hemoglobin ? String(user.hemoglobin) : '');
      setCheckupHealth(user.currentHealthCondition || 'Healthy');
      setCheckupConditions(user.majorMedicalConditions || ['None']);
      setCheckupMeds(user.currentMedications || 'None');
      setCheckupIllness(Boolean(user.recentIllnessOrSurgery));
      setCheckupTattoo(Boolean(user.recentTattooOrPiercing));
      setCheckupPregnancy(user.pregnancyStatus || 'Not Applicable');
      setCheckupDonationType(user.donationType || 'First-Time Donor');
      if (user.lastDonationDate) {
        setCheckupLastDonationDate(new Date(user.lastDonationDate).toISOString().split('T')[0]);
      }
    }
  }, [user]);

  // Clean error state on unmount
  useEffect(() => {
    return () => setError(null);
  }, [setError]);

  // Calculate days since last health checkup
  const calculateDaysSinceCheckup = () => {
    if (!user || !user.lastHealthCheckupDate) return 999;
    const lastDate = new Date(user.lastHealthCheckupDate);
    const diffMs = Date.now() - lastDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const daysSinceCheckup = calculateDaysSinceCheckup();
  const isCheckupDue = daysSinceCheckup >= 15;

  const handleConditionToggle = (cond) => {
    if (cond === 'None') {
      setCheckupConditions(['None']);
    } else {
      let updated = checkupConditions.filter((c) => c !== 'None');
      if (updated.includes(cond)) {
        updated = updated.filter((c) => c !== cond);
        if (updated.length === 0) updated = ['None'];
      } else {
        updated.push(cond);
      }
      setCheckupConditions(updated);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid 10-digit Indian phone number (starting with 6, 7, 8, or 9)');
      return;
    }

    setLoading(true);
    const res = await updateProfile({
      name,
      phone,
      bloodGroup,
      location,
      dob,
      gender,
      weight: Number(weight),
      hemoglobin: hemoglobin ? Number(hemoglobin) : null
    });
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleHealthCheckupSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCheckupLoading(true);

    const res = await submitHealthCheckup({
      weight: Number(checkupWeight),
      hemoglobin: checkupHb ? Number(checkupHb) : null,
      currentHealthCondition: checkupHealth,
      majorMedicalConditions: checkupConditions,
      currentMedications: checkupMeds,
      recentIllnessOrSurgery: checkupIllness,
      recentTattooOrPiercing: checkupTattoo,
      pregnancyStatus: checkupPregnancy,
      lastDonationDate: checkupLastDonationDate || null,
      donationType: checkupDonationType
    });
    setCheckupLoading(false);

    if (res.success) {
      setCheckupSuccessMsg('Health checkup logged successfully!');
      setTimeout(() => {
        setCheckupSuccessMsg(null);
        setShowCheckupModal(false);
      }, 1500);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      'Eligible': { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.2)', icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Eligible Donor' },
      'Temporarily Deferred': { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)', icon: <Clock className="w-3.5 h-3.5" />, label: 'Temporarily Deferred' },
      'Needs Medical Review': { bg: 'rgba(147,51,234,0.1)', color: '#9333ea', border: 'rgba(147,51,234,0.2)', icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'Needs Medical Review' },
    };
    const c = configs[status] || { bg: 'var(--subtle-bg)', color: 'var(--text-muted)', border: 'var(--card-border)', icon: null, label: 'Pending Screening' };
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
        {c.icon} {c.label}
      </span>
    );
  };

  const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-heading)' };
  const labelStyle = { color: 'var(--text-muted)' };

  if (!authUser || !user) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500"></div>
      </div>
    );
  }

  const medicalConditionOptions = [
    'None',
    'Diabetes',
    'Hypertension',
    'Heart Disease',
    'Hepatitis',
    'Asthma',
    'Thyroid Disorder',
    'Other'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* 15-20 DAY HEALTH CHECKUP PROMPT BANNER */}
      {isCheckupDue && (
        <div className="bg-gradient-to-r from-brand-600 to-rose-600 rounded-2xl p-5 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="bg-white/20 p-2.5 rounded-xl shrink-0">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-snug">
                Bi-Weekly Donor Health Checkup Due!
              </h3>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                {daysSinceCheckup >= 999
                  ? "You haven't completed your initial health checkup yet."
                  : `Your last health checkup update was ${daysSinceCheckup} days ago. Please keep your eligibility status active.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCheckupModal(true)}
            className="w-full md:w-auto px-5 py-2.5 bg-white text-brand-700 hover:bg-slate-50 rounded-xl font-bold text-xs transition-all shadow-sm shrink-0 cursor-pointer text-center"
          >
            Update Health Checkup Now &rarr;
          </button>
        </div>
      )}

      {/* TOP SUMMARY & PRELIMINARY DONOR STATUS CARD */}
      <div className="card-panel p-6 shadow-sm space-y-4" style={{ border: '1px solid var(--card-border)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl text-brand-600 flex items-center justify-center font-black text-xl" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}>
              {user.bloodGroup}
            </div>
            <div>
              <h1 className="text-xl font-black" style={{ color: 'var(--text-heading)' }}>{user.name}</h1>
              <p className="text-xs font-semibold" style={labelStyle}>{user.email} &bull; {user.phone}</p>
              <p className="text-[11px] font-medium mt-0.5 flex items-center gap-1" style={labelStyle}>
                <MapPin className="w-3 h-3 inline" style={labelStyle} /> {user.location}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide" style={labelStyle}>
              Preliminary Donor Status
            </span>
            {getStatusBadge(user.preliminaryStatus)}
            <button
              onClick={() => setShowCheckupModal(true)}
              className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5" /> Perform Health Checkup
            </button>
          </div>
        </div>

        {/* STATUS REASONS & DISCLAIMER */}
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wide" style={labelStyle}>
              Eligibility Assessment Details
            </span>
            <ul className="space-y-1 text-xs font-medium" style={{ color: 'var(--text-heading)' }}>
              {user.preliminaryReasons && user.preliminaryReasons.length > 0 ? (
                user.preliminaryReasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-500 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))
              ) : (
                <li className="font-medium" style={labelStyle}>Screening parameters pending</li>
              )}
            </ul>
          </div>

          {/* OFFICIAL MANDATORY DISCLAIMER */}
          <div className="p-3 rounded-lg flex items-start gap-2.5 text-[11px] leading-relaxed font-semibold" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', color: '#b45309' }}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
            <div>
              <strong>Disclaimer:</strong> Preliminary Donor Status only. Do not present this as a final medical eligibility decision; final screening is performed by the authorized blood bank.
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: PROFILE EDIT + CHECKUP HISTORY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EDIT PROFILE FORM */}
        <div className="card-panel p-6 shadow-sm space-y-5" style={{ border: '1px solid var(--card-border)' }}>
          <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <User className="w-5 h-5 text-brand-600" />
            <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>
              Donor Profile & Metrics
            </h2>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-brand-700 text-xs font-semibold rounded-xl" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}>
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 text-emerald-600 text-xs font-semibold rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>
                  Phone (Indian)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  style={inputStyle}
                >
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((gp) => (
                    <option key={gp} value={gp}>
                      {gp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>
                Living Location
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="30"
                  max="200"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>
                  Hemoglobin (g/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="5"
                  max="20"
                  placeholder="e.g. 13.5"
                  value={hemoglobin}
                  onChange={(e) => setHemoglobin(e.target.value)}
                  className="w-full rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all text-xs cursor-pointer shadow-md shadow-brand-600/20"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                ) : (
                  <span>Save Profile Updates</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* DONOR CHECKUP & DONATION HISTORY TIMELINE */}
        <div className="card-panel p-6 shadow-sm space-y-5" style={{ border: '1px solid var(--card-border)' }}>
          <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-brand-600" />
              <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>
                Health & Donation History
              </h2>
            </div>
            <button
              onClick={() => setShowCheckupModal(true)}
              className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
            >
              + New Checkup
            </button>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {user.healthCheckupHistory && user.healthCheckupHistory.length > 0 ? (
              user.healthCheckupHistory.map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl space-y-2 text-xs"
                  style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text-heading)' }}>
                      <Calendar className="w-3.5 h-3.5" style={labelStyle} />
                      {new Date(item.checkupDate || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    {getStatusBadge(item.computedStatus || 'Eligible')}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-medium pt-1" style={{ color: 'var(--text-heading)' }}>
                    <div>
                      <span style={labelStyle}>Weight:</span> {item.weight || '--'} kg
                    </div>
                    <div>
                      <span style={labelStyle}>Hb Level:</span> {item.hemoglobin ? `${item.hemoglobin} g/dL` : 'Not tested'}
                    </div>
                    <div>
                      <span style={labelStyle}>Health:</span> {item.currentHealthCondition || 'Healthy'}
                    </div>
                    <div>
                      <span style={labelStyle}>Donation:</span> {item.donationType || 'None'}
                    </div>
                  </div>

                  {item.lastDonationDate && (
                    <div className="text-[10px] text-brand-600 font-semibold px-2 py-1 rounded-md" style={{ background: 'rgba(220,38,38,0.08)' }}>
                      Last Donation Date: {new Date(item.lastDonationDate).toLocaleDateString('en-IN')}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs font-semibold" style={labelStyle}>
                No health checkups recorded yet. Click above to log your first checkup.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BI-WEEKLY DONOR HEALTH CHECKUP MODAL */}
      {showCheckupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="rounded-2xl w-full max-w-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <button
              onClick={() => setShowCheckupModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full cursor-pointer"
              style={labelStyle}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl" style={{ background: 'rgba(220,38,38,0.08)' }}>
                <Stethoscope className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h3 className="text-base font-black" style={{ color: 'var(--text-heading)' }}>Donor Health Checkup</h3>
                <p className="text-xs font-medium" style={labelStyle}>
                  Update bi-weekly eligibility parameters to keep your preliminary status active
                </p>
              </div>
            </div>

            {checkupSuccessMsg && (
              <div className="mb-4 p-3 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{checkupSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleHealthCheckupSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="30"
                    max="200"
                    value={checkupWeight}
                    onChange={(e) => setCheckupWeight(e.target.value)}
                    className="w-full rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>
                    Hemoglobin (g/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="20"
                    placeholder="e.g. 13.5"
                    value={checkupHb}
                    onChange={(e) => setCheckupHb(e.target.value)}
                    className="w-full rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={labelStyle}>
                  Current Health Condition
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Healthy', value: 'Healthy' },
                    { label: 'Mild Unwell', value: 'Mild Unwellness' },
                    { label: 'Unwell', value: 'Unwell' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCheckupHealth(item.value)}
                      className={`p-2 rounded-xl text-xs font-bold text-center cursor-pointer transition-all ${
                        checkupHealth === item.value
                          ? 'bg-brand-600 text-white shadow-sm'
                          : ''
                      }`}
                      style={checkupHealth === item.value ? {} : { background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)' }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={labelStyle}>
                  Major Medical Conditions
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {medicalConditionOptions.map((cond) => {
                    const isSelected = checkupConditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => handleConditionToggle(cond)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-brand-600 text-white font-bold'
                            : ''
                        }`}
                        style={isSelected ? {} : { background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)' }}
                      >
                        {cond}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>
                  Current Medications
                </label>
                <input
                  type="text"
                  placeholder="e.g. None"
                  value={checkupMeds}
                  onChange={(e) => setCheckupMeds(e.target.value)}
                  className="w-full rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-semibold">
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
                  <input
                    type="checkbox"
                    checked={checkupIllness}
                    onChange={(e) => setCheckupIllness(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span style={{ color: 'var(--text-heading)' }}>Recent major illness/surgery</span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
                  <input
                    type="checkbox"
                    checked={checkupTattoo}
                    onChange={(e) => setCheckupTattoo(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span style={{ color: 'var(--text-heading)' }}>Tattoo/Piercing in last 6 months</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>
                    Recent Donation Type
                  </label>
                  <select
                    value={checkupDonationType}
                    onChange={(e) => setCheckupDonationType(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                    style={inputStyle}
                  >
                    <option value="First-Time Donor">First-Time Donor</option>
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="Platelets">Platelets (SDP)</option>
                    <option value="Plasma">Plasma</option>
                  </select>
                </div>

                {checkupDonationType !== 'First-Time Donor' && (
                  <div>
                    <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>
                      Last Donation Date
                    </label>
                    <input
                      type="date"
                      value={checkupLastDonationDate}
                      onChange={(e) => setCheckupLastDonationDate(e.target.value)}
                      className="w-full rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                      style={inputStyle}
                    />
                  </div>
                )}
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={checkupLoading}
                  className="w-full flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-brand-600/20 cursor-pointer text-xs"
                >
                  {checkupLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  ) : (
                    <span>Submit & Update Status</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
