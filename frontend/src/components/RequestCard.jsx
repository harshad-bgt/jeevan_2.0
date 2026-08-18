import React from 'react';
import { MapPin, User, Calendar, MessageSquare, AlertCircle } from 'lucide-react';

const RequestCard = ({ request, onContact }) => {
  const { patientName, bloodGroup, hospitalAddress, unitsRequired, createdAt, requesterId, urgency } = request;

  const getRemainingHoursStr = () => {
    if (!createdAt) return 'Active';
    const createdDate = new Date(createdAt);
    const expiresDate = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = expiresDate - now;
    if (diffMs <= 0) return 'Expired';
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return diffHrs > 0 ? `${diffHrs}h ${diffMins}m left` : `${diffMins}m left`;
  };

  const remainingText = getRemainingHoursStr();
  const requesterName = requesterId?.name || 'Requester';
  const requesterPhone = requesterId?.phone || '';

  const requesterWhatsAppLink = requesterPhone
    ? `https://wa.me/91${requesterPhone}?text=${encodeURIComponent(
        `Hi, I saw your request on Jeevan 2.0 for ${bloodGroup} blood for patient ${patientName} at ${hospitalAddress}. I am willing to help.`
      )}`
    : '#';

  return (
    <div className="card-panel border-l-4 border-l-brand-500 transition-all duration-300 p-5 urgent-pulse" style={{ border: '1px solid var(--card-border)', borderLeftColor: '#dc2626' }}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-600 px-2 py-0.5 rounded-md" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}>
          <AlertCircle className="w-3 h-3" /> {urgency || 'Urgent Need'}
        </span>
        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md" style={{ background: 'rgba(245,158,11,0.08)', color: '#d97706', border: '1px solid rgba(245,158,11,0.15)' }}>
          {remainingText}
        </span>
      </div>

      {/* PATIENT & BLOOD GROUP */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold leading-snug" style={{ color: 'var(--text-heading)' }}>{patientName}</h3>
          <div className="flex items-center gap-1.5 text-xs mt-1 font-semibold" style={{ color: 'var(--text-muted)' }}>
            <User className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <span>Posted by: {requesterName}</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12 flex items-center justify-center mb-1">
            <div className="absolute inset-0 blood-drop bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-500/40 animate-heartbeat"></div>
            <span className="relative z-10 text-white font-black text-sm drop-shadow-md">
              {bloodGroup}
            </span>
          </div>
          <span className="text-[10px] font-bold text-center" style={{ color: 'var(--text-muted)' }}>
            {unitsRequired} {unitsRequired === 1 ? 'Unit' : 'Units'}
          </span>
        </div>
      </div>

      {/* HOSPITAL */}
      <div className="flex items-start gap-1.5 text-xs mb-5 p-2.5 rounded-xl" style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-heading)' }}>
        <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
        <span className="leading-relaxed font-semibold truncate max-w-[210px]" title={hospitalAddress}>{hospitalAddress}</span>
      </div>

      {/* ACTION */}
      {requesterPhone ? (
        <a href={requesterWhatsAppLink} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl transition-all"
          style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-heading)' }}>
          <MessageSquare className="w-3.5 h-3.5 text-brand-600 fill-current" /><span>Contact Requester</span>
        </a>
      ) : (
        <button onClick={onContact}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
          style={{ background: 'var(--subtle-bg)', border: '1px solid var(--card-border)', color: 'var(--text-heading)' }}>
          <MessageSquare className="w-3.5 h-3.5 text-brand-600 fill-current" /><span>View Contact Details</span>
        </button>
      )}
    </div>
  );
};

export default RequestCard;
