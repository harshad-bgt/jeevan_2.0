import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Droplet, UserPlus, Mail, Lock, Phone, MapPin, ShieldAlert, Heart, X,
  Activity, Calendar, Scale, Stethoscope, AlertCircle, CheckCircle2, FileText,
  Building2, Database
} from 'lucide-react';

const Register = () => {
  const { register, error, setError, user, applicationProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  // Role selection
  const [role, setRole] = useState('donor');

  // Basic Account Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [location, setLocation] = useState('');

  // Hospital fields
  const [hospitalName, setHospitalName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [emergencyContactPerson, setEmergencyContactPerson] = useState('');
  const [department, setDepartment] = useState('');

  // Blood Bank fields
  const [bloodBankName, setBloodBankName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [operatingHours, setOperatingHours] = useState('24/7 Emergency');

  // Donor Eligibility Fields
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [weight, setWeight] = useState('65');
  const [hemoglobin, setHemoglobin] = useState('');
  const [currentHealthCondition, setCurrentHealthCondition] = useState('Healthy');
  const [selectedConditions, setSelectedConditions] = useState(['None']);
  const [currentMedications, setCurrentMedications] = useState('None');
  const [recentIllnessOrSurgery, setRecentIllnessOrSurgery] = useState(false);
  const [recentTattooOrPiercing, setRecentTattooOrPiercing] = useState(false);
  const [pregnancyStatus, setPregnancyStatus] = useState('Not Applicable');
  const [donationType, setDonationType] = useState('First-Time Donor');
  const [lastDonationDate, setLastDonationDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [pendingUserData, setPendingUserData] = useState(null);

  useEffect(() => { if (user && applicationProfile) navigate('/dashboard'); }, [user, applicationProfile, navigate]);
  useEffect(() => { return () => setError(null); }, [setError]);

  const handleConditionToggle = (cond) => {
    if (cond === 'None') { setSelectedConditions(['None']); return; }
    let updated = selectedConditions.filter((c) => c !== 'None');
    if (updated.includes(cond)) { updated = updated.filter((c) => c !== cond); if (updated.length === 0) updated = ['None']; }
    else { updated.push(cond); }
    setSelectedConditions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) { setError('Please enter a valid 10-digit Indian phone number'); return; }

    if (role === 'donor' && !dob) { setError('Please enter your Date of Birth to verify donor eligibility'); return; }
    if (role === 'donor' && (Number(weight) < 30 || Number(weight) > 200)) { setError('Please enter a valid body weight (30-200 kg)'); return; }

    const finalEmail = user ? user.email || email : email;
    
    const data = {
      name: role === 'hospital' ? hospitalName : role === 'bloodbank' ? bloodBankName : name,
      email: finalEmail, phone, role,
      hospitalName, registrationNumber, emergencyContactPerson, department,
      bloodBankName, licenseNumber, operatingHours,
      bloodGroup, location, dob, gender,
      weight: Number(weight), hemoglobin: hemoglobin ? Number(hemoglobin) : null,
      currentHealthCondition, majorMedicalConditions: selectedConditions,
      currentMedications, recentIllnessOrSurgery, recentTattooOrPiercing,
      pregnancyStatus, donationType, lastDonationDate: lastDonationDate || null
    };

    setLoading(true);
    const res = await register(finalEmail, password, data);
    setLoading(false);
    if (res.success) navigate('/dashboard');
  };

  const medicalConditionOptions = ['None', 'Diabetes', 'Hypertension', 'Heart Disease', 'Hepatitis', 'Asthma', 'Thyroid Disorder', 'Other'];

  const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-heading)' };
  const labelStyle = { color: 'var(--text-muted)' };

  const roles = [
    { id: 'donor', label: 'Individual / Donor', icon: <UserPlus className="w-4 h-4" /> },
    { id: 'hospital', label: 'Hospital', icon: <Building2 className="w-4 h-4" /> },
    { id: 'bloodbank', label: 'Blood Bank', icon: <Database className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 relative">
      <div className="card-panel p-6 md:p-8 space-y-6" style={{ border: '1px solid var(--card-border)' }}>
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-2.5 rounded-2xl" style={{ background: 'rgba(220,38,38,0.08)' }}>
            <Droplet className="w-7 h-7 text-brand-600 fill-brand-600" />
          </div>
          <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>
            {user ? 'Complete Your Profile' : 'Join Jeevan 2.0'}
          </h2>
          <p className="text-xs font-semibold max-w-md" style={{ color: 'var(--text-muted)' }}>
            {user ? 'We just need a few more details to set up your account.' : 'Register as a Donor, Hospital, or Blood Bank with verified eligibility'}
          </p>
        </div>

        {/* ROLE SELECTOR TABS */}
        <div className="grid grid-cols-3 gap-2">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === r.id ? 'bg-brand-600 text-white shadow-md' : ''
              }`}
              style={role === r.id ? {} : { background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)' }}
            >
              {r.icon} {r.label}
            </button>
          ))}
        </div>

        {/* Disclaimer */}
        {role === 'donor' && (
          <div className="p-3.5 rounded-xl flex items-start gap-3 text-xs" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', color: '#92400e' }}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
            <div className="space-y-1">
              <span className="font-bold block">Donor Screening Disclaimer</span>
              <p className="text-[11px] leading-relaxed">
                Health information generates a <strong>Preliminary Donor Status</strong>. Final screening by authorized blood banks.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 text-brand-700 text-xs font-semibold rounded-xl" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}>
            <ShieldAlert className="w-4 h-4 shrink-0" /><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: CONTACT */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <UserPlus className="w-4 h-4 text-brand-600" />
              <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>
                {role === 'hospital' ? 'Hospital Details' : role === 'bloodbank' ? 'Blood Bank Details' : 'Account & Contact'}
              </h3>
            </div>

            {role === 'hospital' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Hospital Name</label>
                  <input type="text" required value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} placeholder="Hospital Name"
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Registration Number</label>
                  <input type="text" required value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="Registration Number"
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Emergency Contact Person</label>
                  <input type="text" value={emergencyContactPerson} onChange={(e) => setEmergencyContactPerson(e.target.value)} placeholder="Emergency Contact Person"
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Department</label>
                  <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department"
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
              </div>
            )}

            {role === 'bloodbank' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Blood Bank Name</label>
                  <input type="text" required value={bloodBankName} onChange={(e) => setBloodBankName(e.target.value)} placeholder="Blood Bank Name"
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>License Number</label>
                  <input type="text" required value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="License Number"
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Operating Hours</label>
                  <input type="text" value={operatingHours} onChange={(e) => setOperatingHours(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
              </div>
            )}

            {role === 'donor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Full Name</label>
                  <input type="text" required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Blood Group</label>
                  <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle}>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((gp) => <option key={gp} value={gp}>{gp}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Common fields for all roles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Email Address</label>
                <input type="email" required placeholder="Email Address" value={user ? user.email || email : email} onChange={(e) => setEmail(e.target.value)}
                  disabled={!!user}
                  className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-50" style={inputStyle} />
              </div>
              {!user && (
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Password (min 6)</label>
                  <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Phone (Indian)</label>
                <input type="tel" required placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Location / Address</label>
                <input type="text" required placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* SECTION 2: DONOR-ONLY - Physical Profile */}
          {role === 'donor' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid var(--card-border)' }}>
                <Activity className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>Donor Physical Profile</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Date of Birth</label>
                  <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Gender</label>
                  <select value={gender} onChange={(e) => { setGender(e.target.value); if (e.target.value === 'Male') setPregnancyStatus('Not Applicable'); }}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle}>
                    <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Weight (kg)</label>
                  <input type="number" required min="30" max="200" value={weight} onChange={(e) => setWeight(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Hemoglobin (g/dL, Optional)</label>
                <input type="number" step="0.1" min="5" max="20" placeholder="Hemoglobin" value={hemoglobin} onChange={(e) => setHemoglobin(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
              </div>
            </div>
          )}

          {/* SECTION 3: DONOR-ONLY - Medical Screening */}
          {role === 'donor' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid var(--card-border)' }}>
                <Stethoscope className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>Medical & Health Screening</h3>
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={labelStyle}>Health Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Healthy & Well', value: 'Healthy', c: '#10b981' },
                    { label: 'Mild Unwellness', value: 'Mild Unwellness', c: '#f59e0b' },
                    { label: 'Unwell / Sick', value: 'Unwell', c: '#ef4444' }
                  ].map((item) => (
                    <button key={item.value} type="button" onClick={() => setCurrentHealthCondition(item.value)}
                      className="p-2.5 rounded-xl text-xs font-bold text-center cursor-pointer transition-all"
                      style={currentHealthCondition === item.value
                        ? { background: `${item.c}15`, border: `2px solid ${item.c}`, color: item.c }
                        : { background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)' }
                      }
                    >{item.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wide" style={labelStyle}>Major Medical Conditions</label>
                <div className="flex flex-wrap gap-2">
                  {medicalConditionOptions.map((cond) => (
                    <button key={cond} type="button" onClick={() => handleConditionToggle(cond)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        selectedConditions.includes(cond) ? 'bg-brand-600 text-white font-bold' : ''
                      }`}
                      style={selectedConditions.includes(cond) ? {} : { background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)' }}
                    >{cond}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Medications</label>
                  <input type="text" value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                </div>
                {gender !== 'Male' && (
                  <div>
                    <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Pregnancy Status</label>
                    <select value={pregnancyStatus} onChange={(e) => setPregnancyStatus(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle}>
                      <option value="No">No</option><option value="Currently Pregnant / Breastfeeding">Currently Pregnant / Breastfeeding</option><option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
                  <input type="checkbox" checked={recentIllnessOrSurgery} onChange={(e) => setRecentIllnessOrSurgery(e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-heading)' }}>Major illness/surgery in last 6 months</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
                  <input type="checkbox" checked={recentTattooOrPiercing} onChange={(e) => setRecentTattooOrPiercing(e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-heading)' }}>Tattoo/piercing in last 6 months</span>
                </label>
              </div>
            </div>
          )}

          {/* SECTION 4: DONOR-ONLY - Donation History */}
          {role === 'donor' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid var(--card-border)' }}>
                <FileText className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>Donation History</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Donation Type</label>
                  <select value={donationType} onChange={(e) => setDonationType(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle}>
                    <option value="First-Time Donor">First-Time Donor</option><option value="Whole Blood">Whole Blood</option>
                    <option value="Platelets">Platelets (SDP)</option><option value="Plasma">Plasma</option>
                  </select>
                </div>
                {donationType !== 'First-Time Donor' && (
                  <div>
                    <label className="block text-[10px] font-bold mb-1 uppercase tracking-wide" style={labelStyle}>Last Donation Date</label>
                    <input type="date" value={lastDonationDate} onChange={(e) => setLastDonationDate(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30" style={inputStyle} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-4">
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-600/20 cursor-pointer">
              {loading ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div> : (
                <><Heart className="w-4 h-4 fill-current" /><span>Register & Verify Identity</span></>
              )}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center text-xs pt-2" style={{ borderTop: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
          Already registered?{' '}<Link to="/login" className="text-brand-600 hover:underline font-bold">Log In here</Link>
        </div>
      </div>

    </div>
  );
};

export default Register;
