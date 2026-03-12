import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import ElectricBorder from '../../components/ElectricBorder/ElectricBorder';
import { FiArrowLeft, FiUpload, FiUser, FiPhone, FiBook } from 'react-icons/fi';

export default function ApplyForm() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [form, setForm] = useState({ fullName: '', phone: '', cgpa: '', branch: '', college: '', yearOfStudy: '', coverNote: '' });
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/internships/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setInternship(r.data)).catch(console.error);
  }, [id, token]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append('internshipId', id);
    if (resume) data.append('resume', resume);
    try {
      await api.post('/applications', data, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed');
    } finally { setLoading(false); }
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (success) return (
    <div className="auth-page" style={{ background: 'var(--bg-primary)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', zIndex: 2 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🚀</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Application Sent!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Your application has been submitted. The company will review and respond via email.</p>
        <Link to="/student/dashboard" className="btn btn-primary btn-lg">← Back to Dashboard</Link>
      </motion.div>
    </div>
  );

  return (
    <div className="auth-page" style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '40px 24px', alignItems: 'flex-start' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 30%, rgba(82,39,255,0.1) 0%, transparent 50%)', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 600, margin: '0 auto' }}>
        <Link to="/student/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, textDecoration: 'none' }}>
          <FiArrowLeft /> Back to Dashboard
        </Link>
        {internship && (
          <div className="card" style={{ marginBottom: 20, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{internship.companyName}</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{internship.title}</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span className="badge badge-info">{internship.course}</span>
              <span className="badge badge-info">{internship.durationDays} Days</span>
              <span className={`badge ${internship.isPaid ? 'badge-success' : 'badge-warning'}`}>{internship.isPaid ? `₹${internship.stipend}/mo` : 'Unpaid'}</span>
            </div>
          </div>
        )}
        <ElectricBorder color="#7df9ff" speed={0.7} chaos={0.09} borderRadius={20}>
          <div style={{ padding: '28px', background: 'rgba(6,0,24,0.92)', borderRadius: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Application Details</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <FiUser style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: 38 }} required placeholder="Arjun Kumar" value={form.fullName} onChange={e => set('fullName', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <div style={{ position: 'relative' }}>
                    <FiPhone style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: 38 }} required placeholder="9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">College / University *</label>
                  <input className="form-input" required placeholder="Anna University" value={form.college} onChange={e => set('college', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Branch / Department *</label>
                  <div style={{ position: 'relative' }}>
                    <FiBook style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: 38 }} required placeholder="Computer Science" value={form.branch} onChange={e => set('branch', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Year of Study *</label>
                  <select className="form-select" value={form.yearOfStudy} onChange={e => set('yearOfStudy', e.target.value)} required>
                    <option value="">Select Year</option>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year'].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">CGPA / Percentage</label>
                  <input className="form-input" placeholder="8.5 or 85%" value={form.cgpa} onChange={e => set('cgpa', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Cover Note (Why should we select you?)</label>
                <textarea className="form-textarea" rows={4} placeholder="Briefly describe your motivation and relevant skills…" value={form.coverNote} onChange={e => set('coverNote', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Resume (PDF/DOC, optional)</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1.5px dashed rgba(125,249,255,0.3)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}>
                  <FiUpload size={18} style={{ color: 'var(--accent-cyan)' }} />
                  {resume ? resume.name : 'Click to upload your resume'}
                  <input type="file" style={{ display: 'none' }} accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files[0])} />
                </label>
              </div>
              {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? <div className="spinner" /> : '🚀 Submit Application'}
              </button>
            </form>
          </div>
        </ElectricBorder>
      </div>
    </div>
  );
}
