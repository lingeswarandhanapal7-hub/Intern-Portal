import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ElectricBorder from '../../components/ElectricBorder/ElectricBorder';
import { FiArrowLeft } from 'react-icons/fi';

export default function PostInternship() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', course: '', durationHours: '', durationDays: '',
    isPaid: false, stipend: '', hasIncentive: false, incentiveAmount: '', description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await axios.post('/api/internships', form, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/company/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post internship');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '40px 24px' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 60% 30%, rgba(82,39,255,0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Link to="/company/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28, textDecoration: 'none' }}>
          <FiArrowLeft /> Back to Dashboard
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Post an Internship</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Fill in the details below to attract the best student talent.</p>
          <ElectricBorder color="#5227FF" speed={0.7} chaos={0.09} borderRadius={20}>
            <div style={{ padding: 32, background: 'rgba(6,0,24,0.92)', borderRadius: 20 }}>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Internship Title *</label>
                  <input className="form-input" required placeholder="e.g. Frontend Developer Intern" value={form.title} onChange={e => set('title', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Internship Course / Domain *</label>
                  <input className="form-input" required placeholder="e.g. Web Development, Data Science, Marketing" value={form.course} onChange={e => set('course', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Duration (Hours) *</label>
                    <input className="form-input" type="number" min="1" required placeholder="e.g. 120" value={form.durationHours} onChange={e => set('durationHours', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (Days) *</label>
                    <input className="form-input" type="number" min="1" required placeholder="e.g. 30" value={form.durationDays} onChange={e => set('durationDays', e.target.value)} />
                  </div>
                </div>

                {/* Paid / Unpaid */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: form.isPaid ? 16 : 0 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>
                      <div className="toggle-switch" onClick={() => set('isPaid', !form.isPaid)} style={{ width: 44, height: 24, background: form.isPaid ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)', borderRadius: 12, position: 'relative', transition: 'background 0.25s', cursor: 'pointer' }}>
                        <div style={{ position: 'absolute', top: 3, left: form.isPaid ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.25s' }} />
                      </div>
                      This internship is <strong style={{ color: form.isPaid ? 'var(--success)' : 'var(--text-muted)' }}>{form.isPaid ? 'Paid' : 'Unpaid'}</strong>
                    </label>
                  </div>
                  {form.isPaid && (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Stipend Amount (₹/month) *</label>
                      <input className="form-input" type="number" min="0" required={form.isPaid} placeholder="e.g. 5000" value={form.stipend} onChange={e => set('stipend', e.target.value)} />
                    </div>
                  )}
                </div>

                {/* Incentive */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: form.hasIncentive ? 16 : 0 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>
                      <div onClick={() => set('hasIncentive', !form.hasIncentive)} style={{ width: 44, height: 24, background: form.hasIncentive ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)', borderRadius: 12, position: 'relative', transition: 'background 0.25s', cursor: 'pointer' }}>
                        <div style={{ position: 'absolute', top: 3, left: form.hasIncentive ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.25s' }} />
                      </div>
                      Includes <strong style={{ color: form.hasIncentive ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>{form.hasIncentive ? 'Incentive' : 'No Incentive'}</strong>
                    </label>
                  </div>
                  {form.hasIncentive && (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Incentive Amount (₹) *</label>
                      <input className="form-input" type="number" min="0" required={form.hasIncentive} placeholder="e.g. 2000" value={form.incentiveAmount} onChange={e => set('incentiveAmount', e.target.value)} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Requirements</label>
                  <textarea className="form-textarea" rows={4} placeholder="Describe the role, required skills, and what students will learn…" value={form.description} onChange={e => set('description', e.target.value)} />
                </div>

                {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? <div className="spinner" /> : '🚀 Post Internship'}
                </button>
              </form>
            </div>
          </ElectricBorder>
        </motion.div>
      </div>
    </div>
  );
}
