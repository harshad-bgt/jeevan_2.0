import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  Users, Building2, Activity, ActivitySquare, Loader2, 
  MapPin, Phone, Mail, Calendar, ShieldCheck
} from 'lucide-react';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('donors');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'requests') {
        const res = await api.get('/admin/requests');
        if (res.data.success) {
          setData(res.data.data);
        }
      } else {
        const roleQuery = tab === 'donors' ? 'donor' : tab;
        const res = await api.get(`/admin/entities?role=${roleQuery}`);
        if (res.data.success) {
          setData(res.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'donors', label: 'Donors', icon: <Users className="w-4 h-4" /> },
    { id: 'hospital', label: 'Hospitals', icon: <Building2 className="w-4 h-4" /> },
    { id: 'bloodbank', label: 'Blood Banks', icon: <ActivitySquare className="w-4 h-4" /> },
    { id: 'requests', label: 'Blood Requests', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3" style={{ color: 'var(--text-heading)' }}>
            <ShieldCheck className="w-8 h-8 text-brand-600" />
            System Administration
          </h1>
          <p className="mt-1 font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>
            Read-only overview of all registered entities and emergency cases.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pb-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            style={activeTab !== tab.id ? { color: 'var(--text-muted)' } : {}}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data Table Area */}
      <div className="card-panel p-6 shadow-sm overflow-x-auto" style={{ border: '1px solid var(--card-border)', minHeight: '400px' }}>
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Loading records...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>No records found for this category.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--card-border)' }}>
                {activeTab === 'donors' && (
                  <>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Name</th>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Contact</th>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Location</th>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Blood Group</th>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                  </>
                )}
                {(activeTab === 'hospital' || activeTab === 'bloodbank') && (
                  <>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Institution Name</th>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Contact Person</th>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Details</th>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Location</th>
                  </>
                )}
                {activeTab === 'requests' && (
                  <>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Patient Name</th>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Requirement</th>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Hospital</th>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Date</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={item._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" style={{ borderBottom: '1px solid var(--card-border)' }}>
                  
                  {activeTab === 'donors' && (
                    <>
                      <td className="py-4">
                        <div className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>{item.name}</div>
                        <div className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>Registered: {new Date(item.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                          <Mail className="w-3.5 h-3.5" /> {item.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>
                          <Phone className="w-3.5 h-3.5" /> {item.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 text-xs font-semibold" style={{ color: 'var(--text-heading)' }}>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /> {item.location || 'Unknown'}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black text-brand-700 bg-brand-50" style={{ border: '1px solid var(--brand-200)' }}>
                          {item.bloodGroup || 'Unspecified'}
                        </span>
                      </td>
                      <td className="py-4">
                        {item.isAvailable ? (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Available</span>
                        ) : (
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Busy</span>
                        )}
                      </td>
                    </>
                  )}

                  {(activeTab === 'hospital' || activeTab === 'bloodbank') && (
                    <>
                      <td className="py-4">
                        <div className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>
                          {activeTab === 'hospital' ? item.hospitalName : item.bloodBankName}
                        </div>
                        <div className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>
                          {activeTab === 'hospital' ? item.registrationNumber : item.licenseNumber}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="font-bold text-xs" style={{ color: 'var(--text-heading)' }}>{item.name}</div>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>
                          <Mail className="w-3 h-3" /> {item.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          <Phone className="w-3 h-3" /> {item.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4">
                        {activeTab === 'hospital' ? (
                          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md">Dept: {item.department || 'General'}</span>
                        ) : (
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">24/7 Service</span>
                        )}
                      </td>
                      <td className="py-4 text-xs font-semibold" style={{ color: 'var(--text-heading)' }}>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /> {item.location || 'Unknown'}
                        </div>
                      </td>
                    </>
                  )}

                  {activeTab === 'requests' && (
                    <>
                      <td className="py-4">
                        <div className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>{item.patientName}</div>
                        <div className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>
                          ID: {item._id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-xs font-black text-brand-700 bg-brand-50">{item.bloodGroup}</span>
                          <span className="text-xs font-bold" style={{ color: 'var(--text-heading)' }}>{item.unitsRequired} Units</span>
                        </div>
                        <div className={`text-[10px] uppercase font-black mt-1 ${item.urgency === 'Critical' ? 'text-red-600' : 'text-amber-600'}`}>
                          {item.urgency || 'Normal'} Priority
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-xs font-semibold" style={{ color: 'var(--text-heading)' }}>
                          <MapPin className="w-3 h-3 inline mr-1" /> {item.hospitalAddress}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                          item.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                          item.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' : 
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                    </>
                  )}
                  
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
