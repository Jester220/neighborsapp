import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          
          <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-white/50 text-sm mt-1">Log in with your DIU email</p>
        </div>

        <form onSubmit={handleSubmit} className="liquid-glass rounded-xl2 p-6 space-y-4">
          {error && (
            <div className="bg-red-500/15 text-red-200 text-sm rounded-lg px-3 py-2">{error}</div>
          )}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1.5">DIU Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@diu.edu.bd"
              className="input-glass"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="input-glass"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-white/50 mt-5">
          New to NeighborSOS?{' '}
          <Link to="/register" className="text-coral font-semibold">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
