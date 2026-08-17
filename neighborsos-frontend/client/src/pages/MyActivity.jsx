import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import RatingStars from '../components/RatingStars';
import { getCategoryIcon, timeAgo } from '../utils/format';
import { api } from '../services/api';

export default function MyActivity() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('created');
  const [created, setCreated] = useState([]);
  const [helped, setHelped] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/requests'), api.get('/offers/mine')])
      .then(([createdData, helpedData]) => {
        setCreated(createdData);
        setHelped(helpedData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <h1 className="font-display text-xl font-bold text-white mb-4">My Activity</h1>

      <div className="flex gap-2 mb-5">
        <TabButton active={tab === 'created'} onClick={() => setTab('created')}>Requests I've Created</TabButton>
        <TabButton active={tab === 'helped'} onClick={() => setTab('helped')}>Requests I've Helped With</TabButton>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : tab === 'created' ? (
        created.length === 0 ? (
          <EmptyState
           
            title="Nothing here yet"
            subtitle="Your help journey starts with your first request."
            actionLabel="Ask for Help"
            onAction={() => navigate('/create')}
          />
        ) : (
          <div className="space-y-3">
            {created.map((r) => (
              <ActivityCard key={r.id} request={r} onClick={() => navigate(`/requests/${r.id}`)} />
            ))}
          </div>
        )
      ) : helped.length === 0 ? (
        <EmptyState
          icon="🤝"
          title="No help given yet"
          subtitle="When you offer to help someone, it'll show up here."
          actionLabel="Browse Nearby Requests"
          onAction={() => navigate('/nearby')}
        />
      ) : (
        <div className="space-y-3">
          {helped.map((h) => (
            <ActivityCard
              key={h.offer_id}
              request={h}
              offerStatus={h.offer_status}
              onClick={() => navigate(`/requests/${h.id}`)}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
        active ? 'bg-blue-accent text-white border-blue-accent' : 'bg-white text-navy/60 border-line'
      }`}
    >
      {children}
    </button>
  );
}

function ActivityCard({ request, offerStatus, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-line rounded-xl2 p-4 shadow-card hover:shadow-cardHover transition-all flex items-center gap-3"
    >
      <span className="text-2xl shrink-0">{getCategoryIcon(request.help_type)}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-navy text-sm truncate">{request.title}</p>
        <p className="text-xs text-navy/40">
          {timeAgo(request.created_at)}
          {offerStatus && offerStatus !== 'ACCEPTED' && (
            <span className="ml-2 text-navy/30">· offer {offerStatus.toLowerCase()}</span>
          )}
        </p>
      </div>
      <StatusBadge status={request.status} />
    </button>
  );
}
