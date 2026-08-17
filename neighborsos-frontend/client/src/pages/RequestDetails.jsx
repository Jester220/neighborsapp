import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import RatingStars from '../components/RatingStars';
import { getCategoryIcon, getUrgencyStyle, timeAgo } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const [offerSentLocally, setOfferSentLocally] = useState(false);
  const [contactState, setContactState] = useState('idle'); 
  const [otherContact, setOtherContact] = useState(null);
  const [myContactForm, setMyContactForm] = useState({ phone: '', whatsapp: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const [ratingValue, setRatingValue] = useState(5);
  const [review, setReview] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const isOwner = request && user && request.user_id === user.id;

  const load = useCallback(async () => {
    try {
      const data = await api.get(`/requests/${id}`);
      setRequest(data);

      if (data.user_id === user.id) {
        const offerData = await api.get(`/requests/${id}/offers`);
        setOffers(offerData);
      }

      if (['ACCEPTED', 'IN_PROGRESS'].includes(data.status)) {
        try {
          const contactData = await api.get(`/requests/${id}/contact`);
          if (contactData && contactData.phone !== undefined) {
            setOtherContact(contactData);
            setContactState('ready');
          } else {
            // 202: I've already shared mine, waiting on the other student
            setContactSubmitted(true);
            setContactState('waiting');
          }
        } catch (err) {
          
          setContactState('idle');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  
  }, [id, user.id]);

  useEffect(() => { load(); }, [load]);

  
  useEffect(() => {
    if (!request) return;
    const FINAL_STATES = ['COMPLETED', 'CANCELLED', 'DECLINED', 'EXPIRED'];
    if (FINAL_STATES.includes(request.status)) return;

    const interval = setInterval(() => { load(); }, 8000);
    return () => clearInterval(interval);
  }, [request, load]);

  async function handleOffer() {
    setBusy(true);
    setError('');
    try {
      await api.post(`/requests/${id}/offer`);
      setOfferSentLocally(true);
      setNotice('Your offer to help has been sent!');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAccept(offerId) {
    setBusy(true);
    setError('');
    try {
      await api.put(`/offers/${offerId}/accept`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDecline(offerId) {
    setBusy(true);
    setError('');
    try {
      await api.put(`/offers/${offerId}/decline`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleContactSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post(`/requests/${id}/contact`, myContactForm);
      setContactSubmitted(true);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleComplete() {
    setBusy(true);
    setError('');
    try {
      await api.put(`/requests/${id}/complete`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRatingSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/ratings', { request_id: Number(id), rating: ratingValue, review });
      setRatingSubmitted(true);
    } catch (err) {
      if (err.status === 409) {
        setRatingSubmitted(true);
      } else {
        setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto animate-pulse space-y-4">
          <div className="h-6 w-2/3 bg-line rounded" />
          <div className="h-32 bg-line rounded-xl2" />
        </div>
      </AppLayout>
    );
  }

  if (!request) {
    return (
      <AppLayout>
        <p className="text-navy/50 text-sm">Request not found.</p>
      </AppLayout>
    );
  }

  const urgency = getUrgencyStyle(request.urgency);

  return (
    <AppLayout>
      <button onClick={() => navigate(-1)} className="text-sm text-white/50 mb-4 hover:text-white">← Back</button>

      <div className="max-w-2xl mx-auto space-y-5">
        {notice && <div className="bg-emerald-50 text-emerald-700 text-sm rounded-lg px-3.5 py-2.5">{notice}</div>}
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3.5 py-2.5">{error}</div>}

        <div className="bg-white border border-line rounded-xl2 shadow-card p-5 md:p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getCategoryIcon(request.help_type)}</span>
              <div>
                <h1 className="font-display text-lg font-bold text-navy leading-tight">{request.title}</h1>
                <p className="text-xs text-navy/40 mt-0.5">{request.category} · {request.help_type}</p>
              </div>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <p className="text-navy/70 text-sm leading-relaxed mb-4">{request.description}</p>

          <div className="flex flex-wrap gap-3 text-xs text-navy/50 mb-4">
            <span className={`px-2.5 py-1 rounded-full font-semibold ${urgency.className}`}>{urgency.label}</span>
            {request.distanceLabel && <span>📍 {request.distanceLabel}</span>}
            {request.duration && <span>⏱ {request.duration}</span>}
            <span>🕐 {timeAgo(request.created_at)}</span>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-line">
            <div className="w-9 h-9 rounded-full bg-navy/10 flex items-center justify-center text-sm font-bold text-navy">
              {request.requester_name?.[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-navy">{request.requester_name}</p>
              <div className="flex items-center gap-1 text-xs text-navy/50">
                <RatingStars value={Math.round(request.requester_rating || 0)} size="text-[10px]" />
                {Number(request.requester_rating || 0).toFixed(1)}
                {request.department && <span className="ml-1">· {request.department}, {request.batch}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Non-owner: offer to help */}
        {!isOwner && request.status === 'OPEN' && (
          <button
            onClick={handleOffer}
            disabled={busy || offerSentLocally}
            className="w-full py-3.5 rounded-full bg-coral text-white font-semibold text-sm hover:bg-coral-light transition-colors disabled:opacity-50"
          >
            {offerSentLocally ? 'Offer Sent ✓' : busy ? 'Sending...' : 'I Can Help'}
          </button>
        )}

        {!isOwner && ['HELP_OFFERED'].includes(request.status) && !offerSentLocally && (
          <div className="bg-surface rounded-xl2 p-4 text-sm text-navy/60 text-center">
            Someone has already offered to help with this request.
          </div>
        )}

        {!isOwner && request.status === 'HELP_OFFERED' && offerSentLocally && (
          <div className="bg-blue-accent/10 text-blue-accent rounded-xl2 p-4 text-sm text-center">
            You're offering to help with this request. Once the requester accepts, you'll be able to exchange contact information here.
          </div>
        )}

        {/* Owner: view and respond to offers */}
        {isOwner && offers.length > 0 && request.status !== 'COMPLETED' && (
          <div className="bg-white border border-line rounded-xl2 shadow-card p-5">
            <h2 className="font-display font-bold text-navy text-sm mb-3">Offers to help</h2>
            <div className="space-y-3">
              {offers.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-xs font-bold text-navy">
                      {o.name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy">{o.name}</p>
                      <p className="text-xs text-navy/40">{o.department}, {o.batch} · ⭐ {Number(o.rating).toFixed(1)}</p>
                    </div>
                  </div>
                  {o.status === 'PENDING' ? (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleAccept(o.id)} disabled={busy}
                        className="px-3 py-1.5 rounded-full bg-navy text-white text-xs font-semibold">Accept</button>
                      <button onClick={() => handleDecline(o.id)} disabled={busy}
                        className="px-3 py-1.5 rounded-full border border-line text-navy/60 text-xs font-semibold">Decline</button>
                    </div>
                  ) : (
                    <span className={`text-xs font-semibold shrink-0 ${o.status === 'ACCEPTED' ? 'text-emerald-600' : 'text-navy/30'}`}>
                      {o.status === 'ACCEPTED' ? 'Accepted' : 'Declined'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact exchange - shown to both parties once accepted */}
        {['ACCEPTED', 'IN_PROGRESS'].includes(request.status) && (
          <div className="bg-white border border-line rounded-xl2 shadow-card p-5 md:p-6">
            <h2 className="font-display font-bold text-navy text-sm mb-1.5">Exchange contact information</h2>
            <p className="text-xs text-navy/50 mb-4">Contact information is shared only after both students agree to connect.</p>

            {contactState === 'ready' && otherContact ? (
              <div className="bg-emerald-50 rounded-lg p-4 space-y-1">
                {otherContact.phone && <p className="text-sm text-navy"><strong>Phone:</strong> {otherContact.phone}</p>}
                {otherContact.whatsapp && <p className="text-sm text-navy"><strong>WhatsApp:</strong> {otherContact.whatsapp}</p>}
                {otherContact.message && <p className="text-sm text-navy/70 mt-1">"{otherContact.message}"</p>}
              </div>
            ) : contactSubmitted ? (
              <div className="bg-surface rounded-lg p-4 text-sm text-navy/60">
                Your contact info has been shared. Waiting for the other student to share theirs.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <input
                  value={myContactForm.phone}
                  onChange={(e) => setMyContactForm({ ...myContactForm, phone: e.target.value })}
                  placeholder="Phone number"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm"
                />
                <input
                  value={myContactForm.whatsapp}
                  onChange={(e) => setMyContactForm({ ...myContactForm, whatsapp: e.target.value })}
                  placeholder="WhatsApp number (optional)"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm"
                />
                <input
                  value={myContactForm.message}
                  onChange={(e) => setMyContactForm({ ...myContactForm, message: e.target.value })}
                  placeholder="Short message (optional)"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm"
                />
                <button type="submit" disabled={busy}
                  className="w-full py-2.5 rounded-full bg-blue-accent text-white text-sm font-semibold disabled:opacity-50">
                  Share My Contact Info
                </button>
              </form>
            )}
          </div>
        )}

        {/* Owner: mark completed */}
        {isOwner && ['ACCEPTED', 'IN_PROGRESS'].includes(request.status) && (
          <button
            onClick={handleComplete}
            disabled={busy}
            className="w-full py-3 rounded-full bg-navy text-white font-semibold text-sm hover:bg-navy-light transition-colors disabled:opacity-50"
          >
            Mark as Completed
          </button>
        )}

        {/* Owner: rate the helper */}
        {isOwner && request.status === 'COMPLETED' && !ratingSubmitted && (
          <form onSubmit={handleRatingSubmit} className="bg-white border border-line rounded-xl2 shadow-card p-5 md:p-6 space-y-4">
            <h2 className="font-display font-bold text-navy text-sm">How was your experience?</h2>
            <RatingStars value={ratingValue} onChange={setRatingValue} interactive size="text-2xl" />
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={2}
              placeholder='"Very helpful and friendly."'
              className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm resize-none"
            />
            <button type="submit" disabled={busy}
              className="w-full py-2.5 rounded-full bg-coral text-white text-sm font-semibold disabled:opacity-50">
              Submit Rating
            </button>
          </form>
        )}

        {isOwner && request.status === 'COMPLETED' && ratingSubmitted && (
          <div className="bg-emerald-50 text-emerald-700 text-sm rounded-xl2 p-4 text-center">
            Thanks for your rating! 
          </div>
        )}
      </div>
    </AppLayout>
  );
}
