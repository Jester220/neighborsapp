import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { timeAgo } from '../utils/format';
import { api } from '../services/api';

const TYPE_ICONS = {
  OFFER_RECEIVED: '🔔',
  OFFER_ACCEPTED: '✅',
  OFFER_DECLINED: '❌',
  CONTACT_READY: '📞',
  NEW_RATING: '⭐',
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications')
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, []);

  async function handleClick(n) {
    if (!n.is_read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: 1 } : x)));
      api.put(`/notifications/${n.id}/read`).catch(() => {});
    }
    if (n.related_request_id) {
      navigate(`/requests/${n.related_request_id}`);
    }
  }

  return (
    <AppLayout>
      <h1 className="font-display text-xl font-bold text-white mb-4">Notifications</h1>

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="You're all caught up"
          subtitle="Notifications about your requests and offers will show up here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-left flex items-start gap-3 rounded-xl2 border p-4 transition-colors ${
                n.is_read ? 'bg-white border-line' : 'bg-white border-blue-accent/40 shadow-card'
              }`}
            >
              <span className="text-xl shrink-0">{TYPE_ICONS[n.type] || '🔔'}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${n.is_read ? 'text-navy/70' : 'text-navy font-medium'}`}>
                  {n.message}
                </p>
                <p className="text-xs text-navy/40 mt-0.5">{timeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && <span className="w-2 h-2 rounded-full bg-coral shrink-0 mt-1.5" />}
            </button>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
