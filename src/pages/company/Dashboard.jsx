import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiPlusCircle, FiUsers, FiLogOut, FiEdit, FiTrash2, FiClock, FiCalendar } from 'react-icons/fi';

const Sidebar = ({ onLogout }) => (
  <div className="sidebar">
    <div className="sidebar-logo">
      <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 20, background: 'linear-gradient(135deg,#5227FF,#7df9ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>InternLink</span>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }}>Company Portal</div>
    </div>
    <nav className="sidebar-nav">
      <Link to="/company/dashboard" className="active"><FiGrid size={16} /> Dashboard</Link>
      <Link to="/company/post"><FiPlusCircle size={16} /> Post Internship</Link>
    </nav>
    <div style={{ marginTop: 'auto', padding: '0 16px 16px' }}>
      <button onClick={onLogout} className="btn btn-ghost btn-sm" style={{ width: '100%', color: 'var(--error)', borderColor: 'rgba(255,82,82,0.3)' }}>
        <FiLogOut size={14} /> Logout
      </button>
    </div>
  </div>
);

export default function CompanyDashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/internships/mine', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setInternships(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async id => {
    if (!window.confirm('Delete this internship? All applications will also be removed.')) return;
    await axios.delete(`/api/internships/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setInternships(p => p.filter(i => i.id !== id));
  };

  const handleLogout = () => { logout(); navigate('/'); };
  const totalApps = internships.reduce((sum, i) => sum + (i.applicationCount || 0), 0);

  return (
    <div className="dashboard-layout">
      <Sidebar onLogout={handleLogout} />
      <div className="main-content">
        <div className="page-header">
          <h1>Welcome, {user?.companyName}! 🏢</h1>
          <p>Manage your internship postings and review applications</p>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', maxWidth: 520, marginBottom: 32 }}>
          <div className="stat-card"><div className="stat-value">{internships.length}</div><div className="stat-label">Active Internships</div></div>
          <div className="stat-card"><div className="stat-value">{totalApps}</div><div className="stat-label">Total Applicants</div></div>
          <div className="stat-card"><div className="stat-value">{internships.filter(i => i.isPaid).length}</div><div className="stat-label">Paid Positions</div></div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Your Internship Postings</h2>
          <Link to="/company/post" className="btn btn-primary btn-sm"><FiPlusCircle size={14} /> Post New</Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
        ) : internships.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p style={{ marginBottom: 20 }}>No internships posted yet.</p>
            <Link to="/company/post" className="btn btn-primary">Post Your First Internship</Link>
          </div>
        ) : (
          <div className="internship-grid">
            {internships.map((intern, i) => (
              <motion.div key={intern.id} className="internship-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div className="intern-title" style={{ margin: 0 }}>{intern.title}</div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 8 }}>
                      <button onClick={() => handleDelete(intern.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><FiTrash2 size={14} /></button>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{intern.course}</div>
                  <div className="intern-meta">
                    <span className="intern-meta-item"><FiClock size={12} /> {intern.durationHours}h</span>
                    <span className="intern-meta-item"><FiCalendar size={12} /> {intern.durationDays} days</span>
                    {intern.isPaid && <span className="intern-meta-item">₹{intern.stipend}/mo</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
                  <span className={`badge ${intern.isPaid ? 'badge-success' : 'badge-info'}`}>{intern.isPaid ? 'Paid' : 'Voluntary'}</span>
                  <Link to={`/company/applicants/${intern.id}`} className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiUsers size={13} /> Applicants ({intern.applicationCount || 0})
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
