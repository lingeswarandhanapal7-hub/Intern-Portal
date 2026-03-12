import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiFileText, FiLink, FiLogOut, FiClock, FiCalendar } from 'react-icons/fi';

const Sidebar = ({ onLogout }) => (
  <div className="sidebar">
    <div className="sidebar-logo">
      <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 20, background: 'linear-gradient(135deg,#5227FF,#7df9ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>InternLink</span>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }}>Student Portal</div>
    </div>
    <nav className="sidebar-nav">
      <Link to="/student/dashboard"><FiGrid size={16} /> Dashboard</Link>
      <Link to="/student/applications" className="active"><FiFileText size={16} /> My Applications</Link>
      <Link to="/resources"><FiLink size={16} /> Resources</Link>
    </nav>
    <div style={{ marginTop: 'auto', padding: '0 16px 16px' }}>
      <button onClick={onLogout} className="btn btn-ghost btn-sm" style={{ width: '100%', color: 'var(--error)', borderColor: 'rgba(255,82,82,0.3)' }}>
        <FiLogOut size={14} /> Logout
      </button>
    </div>
  </div>
);

const statusMap = { pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected' };
const statusBadge = { pending: 'badge-warning', accepted: 'badge-success', rejected: 'badge-error' };

export default function MyApplications() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/applications/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setApplications(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="dashboard-layout">
      <Sidebar onLogout={handleLogout} />
      <div className="main-content">
        <div className="page-header">
          <h1>My Applications</h1>
          <p>Track the status of all your internship applications</p>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', maxWidth: 520, marginBottom: 32 }}>
          <div className="stat-card"><div className="stat-value">{applications.length}</div><div className="stat-label">Total Applied</div></div>
          <div className="stat-card"><div className="stat-value">{applications.filter(a => a.status === 'accepted').length}</div><div className="stat-label">Accepted</div></div>
          <div className="stat-card"><div className="stat-value">{applications.filter(a => a.status === 'pending').length}</div><div className="stat-label">Pending</div></div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ marginBottom: 20 }}>You haven't applied to any internship yet.</p>
            <Link to="/student/dashboard" className="btn btn-primary">Browse Internships</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {applications.map((app, i) => (
              <motion.div key={app.id} className="card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{app.companyName}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{app.internshipTitle}</div>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiCalendar size={12} /> Applied: {new Date(app.appliedAt).toLocaleDateString('en-IN')}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={12} /> {app.durationDays} Days</span>
                  </div>
                </div>
                <div>
                  <span className={`badge ${statusBadge[app.status] || 'badge-info'}`} style={{ fontSize: 13, padding: '6px 16px' }}>
                    {statusMap[app.status] || app.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
