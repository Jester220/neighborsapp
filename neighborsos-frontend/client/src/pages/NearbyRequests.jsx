import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import RequestCard from '../components/RequestCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const CATEGORIES = ['Charger', 'Calculator', 'Technical help', 'Academic help', 'Physical help', 'Printing/scanning', 'Other'];
const RADIUS_OPTIONS = [
  { label: '500 m', value: 500 },
  { label: '1 km', value: 1000 },
  { label: '2 km', value: 2000 },
  { label: '5 km', value: 5000 }
];

export default function NearbyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [radius, setRadius] = useState(1000);
  const [urgency, setUrgency] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ radius: String(radius) });
      if (category) params.set('help_type', category);
      if (urgency) params.set('urgency', urgency);
      if (search) params.set('search', search);
      const data = await api.get(`/requests/nearby?${params.toString()}`);
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(load, 300); 
    return () => clearTimeout(timeout);
    


  }, [search, category, radius, urgency]);

  return (
    <AppLayout>
      <h1 className="font-display text-xl font-bold text-white mb-4">Nearby Requests</h1>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search nearby help..."
          className="w-full px-4 py-3 rounded-xl border border-line bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent/40"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-3">
        <Chip active={category === ''} onClick={() => setCategory('')}>All</Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? '' : c)}>{c}</Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="px-3 py-2 rounded-lg border border-line bg-white text-xs font-medium text-navy/70"
        >
          {RADIUS_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label} radius</option>
          ))}
        </select>
        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          className="px-3 py-2 rounded-lg border border-line bg-white text-xs font-medium text-navy/70"
        >
          <option value="">Any urgency</option>
          <option value="high">Urgent</option>
          <option value="medium">Moderate</option>
          <option value="low">Flexible</option>
        </select>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : error ? (
        <EmptyState icon="📍" title="Location needed" subtitle={error} actionLabel="Try again" onAction={load} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon="📍"
          title="Looks quiet around here"
          subtitle="No one nearby needs help right now. Try widening your radius."
          actionLabel="Ask for Help"
          onAction={() => navigate('/create')}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {requests.map((r) => <RequestCard key={r.id} request={r} />)}
        </div>
      )}
    </AppLayout>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
        active ? 'bg-blue-accent text-white border-blue-accent' : 'bg-white text-navy/60 border-line hover:border-navy/30'
      }`}
    >
      {children}
    </button>
  );
}
