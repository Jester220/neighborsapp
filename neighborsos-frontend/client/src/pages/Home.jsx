import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import RequestCard from '../components/RequestCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { api } from '../services/api';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { requestLocation, status } = useGeolocation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);

  async function loadNearby() {
    setLoading(true);
    try {
      const data = await api.get('/requests/nearby?radius=2000');
      setRequests(data.slice(0, 4));
      setLocationEnabled(true);
    } catch {
      setLocationEnabled(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNearby();
  }, []);

  async function handleEnableLocation() {
    try {
      const point = await requestLocation();
      await api.put('/users/location', point);
      await loadNearby();
    } catch {
      // permission denied — status already reflects this
    }
  }

  return (
    <AppLayout>
      <div className="bg-navy rounded-xl2 px-6 py-8 md:px-10 md:py-12 mb-8 relative overflow-hidden animate-fadeUp">
        <div className="absolute -right-10 -top-10 w-56 h-56 bg-coral/20 blur-3xl rounded-full" />
        <div className="relative">
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-2">
            Hi {user?.name?.split(' ')[0]}, need a little help? 
          </h1>
          <p className="text-white/60 text-sm md:text-base mb-6 max-w-md">
            There might be a DIU student nearby who can help right now.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/create')}
              className="px-5 py-2.5 rounded-full bg-coral text-white font-semibold text-sm hover:bg-coral-light transition-colors"
            >
              Ask for Help
            </button>
            <button
              onClick={() => navigate('/nearby')}
              className="px-5 py-2.5 rounded-full border border-white/25 text-white font-semibold text-sm hover:bg-white/5 transition-colors"
            >
              See Nearby Requests
            </button>
          </div>
        </div>
      </div>

      {!locationEnabled && !loading && (
        <div className="bg-white border border-line rounded-xl2 p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-semibold text-navy text-sm">Turn on location to see nearby requests</p>
            <p className="text-navy/50 text-xs mt-0.5">We only show approximate distance, never your exact address.</p>
          </div>
          <button
            onClick={handleEnableLocation}
            className="px-4 py-2 rounded-full bg-blue-accent text-white text-xs font-semibold shrink-0"
          >
            {status === 'loading' ? 'Requesting...' : 'Enable Location'}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg text-white">Nearby right now</h2>
        <button onClick={() => navigate('/nearby')} className="text-xs font-semibold text-blue-accent">
          See all →
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon="🌤️"
          title="Looks quiet around here"
          subtitle="No one nearby needs help right now."
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
