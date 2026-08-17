import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useGeolocation } from '../hooks/useGeolocation';
import { api } from '../services/api';

const BORROW_TYPES = ['Charger', 'Calculator', 'Power bank', 'Cable', 'Book', 'Tool', 'Stationery', 'Other'];
const PERSONAL_TYPES = ['Technical help', 'Academic help', 'Physical help', 'Printing/scanning', 'Finding something', 'Campus-related help', 'Other'];

const RADIUS_OPTIONS = [
  { label: '500 m', value: 500 },
  { label: '1 km', value: 1000 },
  { label: '2 km', value: 2000 },
  { label: '5 km', value: 5000 }
];

export default function CreateRequest() {
  const navigate = useNavigate();
  const { requestLocation, status } = useGeolocation();

  const [category, setCategory] = useState('Borrow');
  const [helpType, setHelpType] = useState('Charger');
  const [customType, setCustomType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [radius, setRadius] = useState(1000);
  const [urgency, setUrgency] = useState('medium');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const helpTypes = category === 'Borrow' ? BORROW_TYPES : PERSONAL_TYPES;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (title.trim().length < 3) return setError('Title must be at least 3 characters.');
    if (description.trim().length < 10) return setError('Please add a bit more detail (10+ characters).');

    setSubmitting(true);
    try {
      const point = await requestLocation();
      const finalType = helpType === 'Other' && customType ? customType : helpType;

      await api.post('/requests', {
        title,
        description,
        category,
        help_type: finalType,
        latitude: point.latitude,
        longitude: point.longitude,
        radius,
        urgency,
        duration: duration || null
      });

      navigate('/activity');
    } catch (err) {
      setError(err.message === 'User denied Geolocation'
        ? 'Please allow location access so nearby students can find your request.'
        : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <h1 className="font-display text-xl font-bold text-white mb-1">Ask for Help</h1>
      <p className="text-white/50 text-sm mb-6">Describe what you need — nearby DIU students will see it.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-line rounded-xl2 shadow-card p-5 md:p-6 space-y-5 max-w-xl">
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>}

        <div>
          <label className="block text-xs font-semibold text-navy/60 mb-2">Category</label>
          <div className="flex gap-2">
            {['Borrow', 'Personal Help'].map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => { setCategory(c); setHelpType(c === 'Borrow' ? BORROW_TYPES[0] : PERSONAL_TYPES[0]); }}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                  category === c ? 'bg-navy text-white border-navy' : 'bg-white text-navy/60 border-line'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy/60 mb-2">Type of help</label>
          <div className="flex flex-wrap gap-2">
            {helpTypes.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setHelpType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  helpType === t ? 'bg-blue-accent text-white border-blue-accent' : 'bg-white text-navy/60 border-line'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {helpType === 'Other' && (
            <input
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              placeholder="Describe what you need..."
              className="w-full mt-2 px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent/40"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy/60 mb-1.5">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Need a Type-C charger"
            className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent/40"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy/60 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="A little more detail helps nearby students understand what you need."
            className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent/40 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">Urgency</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm"
            >
              <option value="high">Urgent</option>
              <option value="medium">Moderate</option>
              <option value="low">Flexible</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">Duration (optional)</label>
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 20 minutes"
              className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy/60 mb-2">Search radius</label>
          <div className="flex gap-2">
            {RADIUS_OPTIONS.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setRadius(r.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  radius === r.value ? 'bg-navy text-white border-navy' : 'bg-white text-navy/60 border-line'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-lg px-3.5 py-3 text-xs text-navy/50 leading-relaxed">
          📍 We'll ask for your location when you submit. Only your approximate distance is shown to others — never your exact coordinates.
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-full bg-coral text-white font-semibold text-sm hover:bg-coral-light transition-colors disabled:opacity-50"
        >
          {submitting ? (status === 'loading' ? 'Getting your location...' : 'Posting...') : 'Post Request'}
        </button>
      </form>
    </AppLayout>
  );
}
