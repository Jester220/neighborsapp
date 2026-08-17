import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  name: '', student_id: '', email: '', password: '', department: '', batch: ''
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
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
          
          <h1 className="font-display text-2xl font-bold text-white">Join NeighborSOS</h1>
          <p className="text-white/50 text-sm mt-1">Create your DIU student account</p>
        </div>

        <form onSubmit={handleSubmit} className="liquid-glass rounded-xl2 p-6 space-y-3.5">
          {error && (
            <div className="bg-red-500/15 text-red-200 text-sm rounded-lg px-3 py-2">{error}</div>
          )}

          <Field label="Full Name">
            <input required value={form.name} onChange={(e) => update('name', e.target.value)}
              className={inputClass} />
          </Field>

          <Field label="DIU Student ID">
            <input required value={form.student_id} onChange={(e) => update('student_id', e.target.value)}
              placeholder="241-35-087" className={inputClass} />
          </Field>

          <Field label="DIU Email">
            <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
              placeholder="....@diu.edu.bd" className={inputClass} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Department">
              <input required value={form.department} onChange={(e) => update('department', e.target.value)}
                placeholder="SWE" className={inputClass} />
            </Field>
            <Field label="Batch">
              <input required value={form.batch} onChange={(e) => update('batch', e.target.value)}
                placeholder="Batch 42" className={inputClass} />
            </Field>
          </div>

          <Field label="Password">
            <input required type="password" minLength={6} value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="At least 6 characters" className={inputClass} />
          </Field>

          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-white/50 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-coral font-semibold">Log in</Link>
        </p>
      </div>
    </div>
  );
}

const inputClass = 'input-glass';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/60 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
