import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const REPORT_REASONS = ['Spam', 'Inappropriate content', 'Harassment', 'Suspicious activity', 'Other'];

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    department: user?.department || '',
    batch: user?.batch || '',
    phone: user?.phone || ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSent, setReportSent] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await api.put('/users/profile', form);
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleReport(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/reports', { reason: reportReason, description: reportDescription });
      setReportSent(true);
      setReportOpen(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AppLayout>
      <button onClick={() => navigate('/profile')} className="text-sm text-white/50 mb-4 hover:text-white">← Back to profile</button>

      <div className="max-w-md mx-auto space-y-5">
        <h1 className="font-display text-xl font-bold text-white">Settings</h1>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3.5 py-2.5">{error}</div>}
        {saved && <div className="bg-emerald-50 text-emerald-700 text-sm rounded-lg px-3.5 py-2.5">Profile updated.</div>}
        {reportSent && <div className="bg-emerald-50 text-emerald-700 text-sm rounded-lg px-3.5 py-2.5">Report submitted. Our team will review it.</div>}

        <form onSubmit={handleSave} className="bg-white border border-line rounded-xl2 shadow-card p-5 space-y-4">
          <h2 className="font-display font-bold text-navy text-sm">Edit profile</h2>

          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">Full name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent/40"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy/60 mb-1.5">Department</label>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy/60 mb-1.5">Batch</label>
              <input
                value={form.batch}
                onChange={(e) => setForm({ ...form, batch: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent/40"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">Phone number</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Used for contact exchange"
              className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent/40"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-full bg-navy text-white text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        <div className="bg-white border border-line rounded-xl2 shadow-card p-5">
          <h2 className="font-display font-bold text-navy text-sm mb-1">Safety</h2>
          <p className="text-xs text-navy/50 mb-4">Report spam, harassment, or suspicious activity to the admin team.</p>

          {!reportOpen ? (
            <button
              onClick={() => setReportOpen(true)}
              className="w-full py-2.5 rounded-full border border-line text-navy/70 text-sm font-semibold hover:bg-surface transition-colors"
            >
              Report an issue
            </button>
          ) : (
            <form onSubmit={handleReport} className="space-y-3">
              <select
                required
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm"
              >
                <option value="">Select a reason</option>
                {REPORT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={3}
                placeholder="Describe what happened (optional)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm resize-none"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2.5 rounded-full bg-coral text-white text-sm font-semibold">
                  Submit report
                </button>
                <button type="button" onClick={() => setReportOpen(false)} className="px-4 py-2.5 rounded-full border border-line text-navy/60 text-sm font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
