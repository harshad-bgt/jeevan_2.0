import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import LiveDonorMap from '../components/LiveDonorMap';
import {
  Droplet, Activity, MapPin, Phone, Mail, Terminal, Send,
  CheckCircle2, History, ChevronRight, ChevronDown, Stethoscope,
  Clock, AlertTriangle, AlertCircle, Bell, Building2, Database,
  Package, Edit3, X, Check, Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const { user: authUser, applicationProfile: user, toggleAvailability } = useContext(AuthContext);
  const [myRequests, setMyRequests] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [showSMSLogs, setShowSMSLogs] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);

  // Blood Bank Inventory State
  const [editingInventory, setEditingInventory] = useState(false);
  const [inventoryValues, setInventoryValues] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reqRes = await api.get('/requests/my-requests');
        if (reqRes.data && reqRes.data.success) setMyRequests(reqRes.data.requests);

        const smsRes = await api.get('/requests/sms-simulation');
        if (smsRes.data && smsRes.data.success) setSmsLogs(smsRes.data.logs);

        // Get donor notifications
        const notifRes = await api.get('/requests/donor-notifications');
        if (notifRes.data && notifRes.data.success) setNotifications(notifRes.data.notifications);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchData();

    const interval = setInterval(async () => {
      try {
        const smsRes = await api.get('/requests/sms-simulation');
        if (smsRes.data && smsRes.data.success) setSmsLogs(smsRes.data.logs);
        const notifRes = await api.get('/requests/donor-notifications');
        if (notifRes.data && notifRes.data.success) setNotifications(notifRes.data.notifications);
      } catch (err) { /* silent */ }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user?.availableUnits) {
      setInventoryValues(user.availableUnits);
    }
  }, [user]);

  const handleRefreshSMS = async (e) => {
    e.stopPropagation();
    try {
      const smsRes = await api.get('/requests/sms-simulation');
      if (smsRes.data && smsRes.data.success) setSmsLogs(smsRes.data.logs);
    } catch (err) { console.error('Refresh SMS logs failed:', err); }
  };

  const handleRespondNotification = async (requestId, action) => {
    setRespondingTo(requestId);
    try {
      await api.post('/requests/respond-notification', { requestId, action });
      setNotifications((prev) =>
        prev.map((n) => n._id === requestId ? { ...n, responseStatus: action === 'accept' ? 'accepted' : 'declined' } : n)
      );
    } catch (err) {
      console.error('Respond to notification failed:', err);
    } finally {
      setRespondingTo(null);
    }
  };

  const handleSaveInventory = async () => {
    try {
      await api.put('/users/bloodbank-inventory', { availableUnits: inventoryValues });
      setEditingInventory(false);
    } catch (err) {
      console.error('Save inventory failed:', err);
    }
  };

  const calculateDaysSinceCheckup = () => {
    if (!user || !user.lastHealthCheckupDate) return 999;
    const lastDate = new Date(user.lastHealthCheckupDate);
    return Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysSinceCheckup = calculateDaysSinceCheckup();
  const isCheckupDue = daysSinceCheckup >= 15;

  const getStatusBadge = (status) => {
    const configs = {
      'Eligible': { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.2)', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Eligible Donor' },
      'Temporarily Deferred': { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)', icon: <Clock className="w-3 h-3" />, label: 'Temporarily Deferred' },
      'Needs Medical Review': { bg: 'rgba(147,51,234,0.1)', color: '#9333ea', border: 'rgba(147,51,234,0.2)', icon: <AlertTriangle className="w-3 h-3" />, label: 'Needs Medical Review' },
    };
    const c = configs[status] || { bg: 'var(--subtle-bg)', color: 'var(--text-muted)', border: 'var(--card-border)', icon: null, label: 'Pending' };
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px]" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
        {c.icon} {c.label}
      </span>
    );
  };

  if (!authUser) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500"></div>
      </div>
    );
  }

  // User is authenticated in Firebase but has no MongoDB profile (e.g. first time Google Login)
  if (authUser && !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-12 mt-12 text-center card-panel space-y-4" style={{ border: '1px solid var(--card-border)' }}>
        <div className="w-16 h-16 bg-brand-600/10 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>Profile Incomplete</h2>
        <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          You have successfully authenticated, but we need a few more details to set up your Jeevan account (like your Blood Group and Location).
        </p>
        <Link to="/register" className="inline-block mt-4 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-brand-600/20">
          Complete Profile &rarr;
        </Link>
      </div>
    );
  }

  const role = user.role || 'donor';

  // ──── BLOOD BANK DASHBOARD ────
  if (role === 'bloodbank') {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <header className="pb-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-brand-600" />
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>Blood Bank Dashboard</h1>
          </div>
          <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {user.bloodBankName || user.name} &bull; License: {user.licenseNumber || 'N/A'} &bull; {user.operatingHours || '24/7'}
          </p>
        </header>

        {/* Inventory Grid */}
        <div className="card-panel p-6 space-y-4" style={{ border: '1px solid var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wide" style={{ color: 'var(--text-heading)' }}>
              <Package className="w-4 h-4 inline text-brand-600 mr-1" /> Blood Unit Inventory
            </h3>
            {editingInventory ? (
              <div className="flex gap-2">
                <button onClick={handleSaveInventory} className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"><Check className="w-3 h-3" /> Save</button>
                <button onClick={() => setEditingInventory(false)} className="text-[10px] font-bold flex items-center gap-1 cursor-pointer" style={{ color: 'var(--text-muted)' }}><X className="w-3 h-3" /> Cancel</button>
              </div>
            ) : (
              <button onClick={() => setEditingInventory(true)} className="text-[10px] font-bold text-brand-600 flex items-center gap-1 cursor-pointer"><Edit3 className="w-3 h-3" /> Edit Stock</button>
            )}
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {bloodGroups.map((bg) => (
              <div key={bg} className="text-center p-3 rounded-xl" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
                <span className="text-brand-600 font-black text-sm">{bg}</span>
                {editingInventory ? (
                  <input
                    type="number" min="0" max="999"
                    value={inventoryValues[bg] || 0}
                    onChange={(e) => setInventoryValues({ ...inventoryValues, [bg]: Number(e.target.value) })}
                    className="w-full mt-1 text-center text-lg font-black rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-heading)' }}
                  />
                ) : (
                  <div className="text-2xl font-black mt-1" style={{ color: 'var(--text-heading)' }}>{inventoryValues[bg] || 0}</div>
                )}
                <span className="text-[9px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>units</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Requests Feed */}
        <div className="card-panel p-6 space-y-4" style={{ border: '1px solid var(--card-border)' }}>
          <h3 className="font-bold text-xs uppercase tracking-wide flex items-center gap-1.5" style={{ color: 'var(--text-heading)' }}>
            <Bell className="w-4 h-4 text-brand-600" /> Emergency Request Feed
          </h3>
          {myRequests.length > 0 ? myRequests.map((req) => (
            <div key={req._id} className="p-3 rounded-xl flex items-center justify-between" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
              <div>
                <span className="font-bold text-xs" style={{ color: 'var(--text-heading)' }}>{req.patientName}</span>
                <span className="ml-2 text-brand-600 font-black text-xs">{req.bloodGroup}</span>
                <span className="ml-2 text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{req.unitsRequired} units</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${req.status === 'pending' ? 'bg-emerald-500/15 text-emerald-500' : ''}`}
                style={req.status === 'pending' ? {} : { background: 'var(--subtle-bg)', color: 'var(--text-muted)' }}
              >{req.status === 'pending' ? 'Active' : req.status}</span>
            </div>
          )) : (
            <div className="text-center py-6 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>No requests dispatched from this bank yet.</div>
          )}
        </div>
      </div>
    );
  }

  // ──── HOSPITAL DASHBOARD ────
  if (role === 'hospital') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <header className="pb-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-600" />
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>Hospital Dashboard</h1>
          </div>
          <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {user.hospitalName || user.name} &bull; Reg: {user.registrationNumber || 'N/A'} &bull; Contact: {user.emergencyContactPerson || 'N/A'}
          </p>
        </header>

        {/* Quick Request CTA */}
        <div className="card-panel p-6" style={{ border: '1px solid var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>Create Emergency Blood Request</h3>
              <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>AI will auto-match nearby eligible donors and send notifications.</p>
            </div>
            <Link to="/create-request" className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5" /> New Request
            </Link>
          </div>
        </div>

        {/* Request History */}
        <div className="card-panel p-6 space-y-4" style={{ border: '1px solid var(--card-border)' }}>
          <h3 className="font-bold text-xs uppercase tracking-wide flex items-center gap-1.5" style={{ color: 'var(--text-heading)' }}>
            <History className="w-4 h-4 text-brand-500" /> Patient Request History
          </h3>
          {loadingRequests ? (
            <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-brand-500"></div></div>
          ) : myRequests.length > 0 ? (
            <div className="space-y-2">
              {myRequests.map((req) => (
                <div key={req._id} className="p-3 rounded-xl flex items-center justify-between" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)' }}>
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs" style={{ color: 'var(--text-heading)' }}>{req.patientName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-brand-600 font-black text-[11px]">{req.bloodGroup}</span>
                      <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{req.unitsRequired} units</span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${req.status === 'pending' ? 'bg-emerald-500/15 text-emerald-500' : ''}`}
                    style={req.status === 'pending' ? {} : { background: 'var(--subtle-bg)', color: 'var(--text-muted)' }}
                  >{req.status === 'pending' ? 'Active' : req.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>No patient requests created yet.</div>
          )}
        </div>
      </div>
    );
  }

  // ──── DONOR DASHBOARD (default) ────
  const pendingNotifs = notifications.filter((n) => n.responseStatus === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* HEADER */}
      <header className="pb-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>Donor Dashboard</h1>
        <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Manage availability, track donor eligibility, and respond to AI-matched emergency requests.
        </p>
      </header>

      {/* HEALTH CHECKUP ALERT */}
      {isCheckupDue && (
        <div className="bg-gradient-to-r from-brand-600 to-rose-600 rounded-2xl p-4 text-white shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold text-xs">Donor Health Checkup Reminder</span>
              <p className="text-[11px] text-white/90 font-medium">
                {daysSinceCheckup >= 999 ? 'Complete your initial donor health checkup' : `Your last health checkup was ${daysSinceCheckup} days ago.`}
              </p>
            </div>
          </div>
          <Link to="/profile" className="px-4 py-2 bg-white text-brand-700 hover:bg-gray-50 font-bold text-xs rounded-xl shrink-0">
            Update &rarr;
          </Link>
        </div>
      )}

      {/* INCOMING AI MATCHED NOTIFICATIONS */}
      {pendingNotifs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>
              Incoming Blood Requests ({pendingNotifs.length})
            </h2>
          </div>
          {pendingNotifs.map((notif) => (
            <div key={notif._id} className="card-panel p-4 urgent-pulse" style={{ border: '1px solid rgba(220,38,38,0.2)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-brand-600 text-white font-black text-xs px-2.5 py-0.5 rounded-lg">{notif.bloodGroup}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-heading)' }}>{notif.patientName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-600/10 text-brand-600">{notif.urgency}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {notif.hospitalAddress}</span>
                    <span>{notif.distanceKm} km away</span>
                    <span>{notif.unitsRequired} unit{notif.unitsRequired > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                      <Sparkles className="w-3 h-3" /> AI Match: {notif.aiMatchScore}%
                    </div>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {new Date(notif.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => handleRespondNotification(notif._id, 'accept')}
                    disabled={respondingTo === notif._id}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-2 px-4 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Check className="w-3 h-3" /> Accept
                  </button>
                  <button
                    onClick={() => handleRespondNotification(notif._id, 'decline')}
                    disabled={respondingTo === notif._id}
                    className="font-bold text-[11px] py-2 px-4 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                    style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)' }}
                  >
                    <X className="w-3 h-3" /> Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <div className="card-panel p-6 space-y-5" style={{ border: '1px solid var(--card-border)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-600/10 text-brand-600 flex items-center justify-center rounded-xl font-bold">
                <Droplet className="w-6 h-6 fill-current text-brand-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight" style={{ color: 'var(--text-heading)' }}>{user.name}</h2>
                <span className="inline-flex items-center mt-1 text-[10px] font-bold text-brand-600 px-2 py-0.5 rounded" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}>
                  {user.bloodGroup} Donor
                </span>
              </div>
            </div>
            <div className="h-px" style={{ background: 'var(--card-border)' }} />
            <div className="space-y-3.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 shrink-0" /><span className="truncate">{user.email}</span></div>
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 shrink-0" /><span>+91 {user.phone}</span></div>
              <div className="flex items-center gap-3"><MapPin className="w-4 h-4 shrink-0" /><span className="truncate" title={user.location}>{user.location}</span></div>
            </div>
          </div>

          {/* Preliminary Status */}
          <div className="card-panel p-6 space-y-4" style={{ border: '1px solid var(--card-border)' }}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wide" style={{ color: 'var(--text-heading)' }}>Preliminary Donor Status</h3>
              {getStatusBadge(user.preliminaryStatus)}
            </div>
            <div className="text-xs font-medium space-y-1" style={{ color: 'var(--text-muted)' }}>
              {user.preliminaryReasons && user.preliminaryReasons.length > 0 ? (
                user.preliminaryReasons.slice(0, 2).map((r, idx) => (
                  <p key={idx} className="flex items-start gap-1.5 text-[11px]"><span className="text-brand-500 font-bold">•</span><span>{r}</span></p>
                ))
              ) : (
                <p className="text-[11px]">Donor evaluation ready</p>
              )}
            </div>
            <div className="p-2.5 rounded-xl text-[10px] font-semibold leading-relaxed flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', color: '#b45309' }}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
              <span>Preliminary Status only. Final screening is performed by the authorized blood bank.</span>
            </div>
            <Link
              to="/profile"
              className="w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-heading)' }}
            >
              <Stethoscope className="w-3.5 h-3.5 text-brand-600" />
              <span>Manage Health Checkup</span>
            </Link>
          </div>

          {/* Availability */}
          <div className="card-panel p-6 space-y-4" style={{ border: '1px solid var(--card-border)' }}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs tracking-wide uppercase" style={{ color: 'var(--text-heading)' }}>Emergency Availability</h3>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${user.isAvailable ? 'bg-emerald-500/15 text-emerald-500' : ''}`}
                style={user.isAvailable ? {} : { background: 'var(--subtle-bg)', color: 'var(--text-muted)', border: '1px solid var(--card-border)' }}
              >{user.isAvailable ? 'Available' : 'Unavailable'}</span>
            </div>
            <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Keep 'Available' active so nearby patients can find you during emergencies.
            </p>
            <button
              onClick={toggleAvailability}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                user.isAvailable ? '' : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md'
              }`}
              style={user.isAvailable ? { background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-heading)' } : {}}
            >
              <Activity className="w-4 h-4" />
              <span>Mark as {user.isAvailable ? 'Unavailable' : 'Available'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          {/* SMS LOG */}
          <div className="card-panel overflow-hidden flex flex-col shadow-sm" style={{ border: '1px solid var(--card-border)' }}>
            <div
              onClick={() => setShowSMSLogs(!showSMSLogs)}
              className="px-5 py-3.5 flex items-center justify-between text-left cursor-pointer"
              style={{ background: 'var(--subtle-bg)', borderBottom: '1px solid var(--card-border)' }}
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>
                  SMS Fallback Log ({smsLogs.length} alert{smsLogs.length === 1 ? '' : 's'})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleRefreshSMS} className="text-[10px] text-brand-600 hover:text-brand-700 font-bold uppercase cursor-pointer">Refresh</button>
                {showSMSLogs ? <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> : <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
              </div>
            </div>
            {showSMSLogs && (
              <div className="p-4 font-mono text-[11px] h-44 overflow-y-auto space-y-3" style={{ background: '#0c0c0e', color: '#94a3b8' }}>
                {smsLogs.length > 0 ? smsLogs.map((log) => (
                  <div key={log.id} className="pb-2 last:border-b-0" style={{ borderBottom: '1px solid #1e293b' }}>
                    <div className="flex items-center justify-between text-[9px] mb-1" style={{ color: '#64748b' }}>
                      <span>DISPATCH: sms_queue &rarr; 91{log.to}</span>
                      <span className="text-emerald-400 font-bold">[{log.status}]</span>
                    </div>
                    <div className="text-slate-200 font-medium">{log.body}</div>
                    <div className="text-[9px] mt-1" style={{ color: '#475569' }}>Logged: {new Date(log.timestamp).toLocaleTimeString()}</div>
                  </div>
                )) : (
                  <div className="h-full flex items-center justify-center text-center py-8" style={{ color: '#475569' }}>
                    CONSOLE ONLINE: No emergency SMS alerts triggered yet.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* REQUEST HISTORY */}
          <div className="card-panel p-6 space-y-5 shadow-sm" style={{ border: '1px solid var(--card-border)' }}>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-brand-500" />
              <h3 className="font-bold text-base" style={{ color: 'var(--text-heading)' }}>Your Blood Requests History</h3>
            </div>
            {loadingRequests ? (
              <div className="flex justify-center items-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-brand-500"></div></div>
            ) : myRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[9px] uppercase tracking-widest font-bold" style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
                      <th className="py-3 px-2">Patient</th>
                      <th className="py-3 px-2">Blood Group</th>
                      <th className="py-3 px-2">Units</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRequests.map((req) => (
                      <tr key={req._id} className="transition-all font-semibold" style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
                        <td className="py-3.5 px-2 font-bold" style={{ color: 'var(--text-heading)' }}>{req.patientName}</td>
                        <td className="py-3.5 px-2">
                          <span className="px-2 py-0.5 rounded text-brand-600 font-bold text-[10px]" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}>
                            {req.bloodGroup}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 font-bold" style={{ color: 'var(--text-heading)' }}>{req.unitsRequired}</td>
                        <td className="py-3.5 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${req.status === 'pending' ? 'bg-emerald-500/15 text-emerald-500' : ''}`}
                            style={req.status === 'pending' ? {} : { background: 'var(--subtle-bg)', color: 'var(--text-muted)' }}
                          >{req.status === 'pending' ? 'Active' : req.status}</span>
                        </td>
                        <td className="py-3.5 px-2" style={{ color: 'var(--text-muted)' }}>
                          {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 font-semibold" style={{ color: 'var(--text-muted)' }}>
                You haven't requested any emergency blood units yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LIVE DONOR MAP SECTION */}
      <section className="pt-4">
        <LiveDonorMap />
      </section>
    </div>
  );
};

export default Dashboard;
