import { useNavigate } from 'react-router-dom';
import { getCategoryIcon, getUrgencyStyle, timeAgo } from '../utils/format';
import RatingStars from './RatingStars';

export default function RequestCard({ request }) {
  const navigate = useNavigate();
  const urgency = getUrgencyStyle(request.urgency);

  return (
    <button
      onClick={() => navigate(`/requests/${request.id}`)}
      className="w-full text-left bg-white border border-line rounded-xl2 p-4 shadow-card hover:shadow-cardHover hover:-translate-y-0.5 transition-all duration-200 animate-fadeUp"
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-2xl leading-none shrink-0">{getCategoryIcon(request.help_type)}</span>
          <h3 className="font-display font-bold text-navy text-[15px] leading-tight truncate">
            {request.title}
          </h3>
        </div>
        <span className={`shrink-0 px-2 py-1 rounded-full text-[11px] font-semibold ${urgency.className}`}>
          {urgency.label}
        </span>
      </div>

      <p className="text-navy/55 text-sm leading-snug line-clamp-2 mb-3">{request.description}</p>

      <div className="flex items-center gap-3 text-xs text-navy/50 mb-3">
        {request.distanceLabel && (
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-pulseSoft absolute inline-flex h-full w-full rounded-full bg-coral" />
            </span>
            {request.distanceLabel}
          </span>
        )}
        {request.duration && <span>⏱ {request.duration}</span>}
        <span>🕐 {timeAgo(request.created_at)}</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-line">
        <span className="text-sm font-medium text-navy/80 flex items-center gap-1.5">
          {request.requester_name}
          {request.requester_rating && Number(request.requester_rating) > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-navy/50">
              <RatingStars value={Math.round(request.requester_rating)} size="text-[10px]" />
              {Number(request.requester_rating).toFixed(1)}
            </span>
          )}
        </span>
        <span className="text-xs font-semibold text-blue-accent">I Can Help →</span>
      </div>
    </button>
  );
}
