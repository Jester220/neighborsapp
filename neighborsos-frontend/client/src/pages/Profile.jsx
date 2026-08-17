import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import RatingStars from '../components/RatingStars';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <AppLayout>
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-line rounded-xl2 shadow-card p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-navy/10 flex items-center justify-center text-2xl font-bold text-navy mx-auto mb-4">
            
          </div>
          <h1 className="font-display text-xl font-bold text-navy">{user.name}</h1>
          <p className="text-navy/50 text-sm mt-0.5">{user.department} · {user.batch}</p>
          <p className="text-navy/30 text-xs mt-1">{user.student_id}</p>

          <div className="flex items-center justify-center gap-1.5 mt-3">
            <RatingStars value={Math.round(user.rating || 0)} size="text-sm" />
            <span className="text-sm font-semibold text-navy">{Number(user.rating || 0).toFixed(1)}</span>
            <span className="text-xs text-navy/40">({user.total_ratings || 0} ratings)</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-line">
            <div>
              <p className="font-display text-2xl font-extrabold text-navy">{user.people_helped || 0}</p>
              <p className="text-xs text-navy/50">Students helped</p>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-navy">{user.total_ratings || 0}</p>
              <p className="text-xs text-navy/50">Ratings received</p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <button
            onClick={() => navigate('/settings')}
            className="w-full text-left bg-white border border-line rounded-xl2 p-4 text-sm font-medium text-navy hover:bg-surface transition-colors flex items-center justify-between"
          >
            Edit profile & settings
            <span className="text-navy/30">→</span>
          </button>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full text-left bg-white border border-line rounded-xl2 p-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
