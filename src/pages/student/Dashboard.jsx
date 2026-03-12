import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiSearch, FiFileText, FiLink, FiLogOut, FiClock, FiDollarSign, FiCalendar, FiFilter } from 'react-icons/fi';

const Sidebar = ({ onLogout }) => (
  <div className="sidebar">
    <div className="sidebar-logo">
      <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 20, background: 'linear-gradient(135deg,#5227FF,#7df9ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>InternLink</span>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }}>Student Portal</div>
    </div>
    <nav className="sidebar-nav">
      <Link to="/student/dashboard"><FiGrid size={16} /> Dashboard</Link>
      <Link to="/student/applications"><FiFileText size={16} /> My Applications</Link>
      <Link to="/resources"><FiLink size={16} /> Resources</Link>
    </nav>
    <div style={{ marginTop: 'auto', padding: '0 16px 16px' }}>
      <button onClick={onLogout} className="btn btn-ghost btn-sm" style={{ width: '100%', color: 'var(--error)', borderColor: 'rgba(255,82,82,0.3)' }}>
        <FiLogOut size={14} /> Logout
      </button>
    </div>
  </div>
);

export default function StudentDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get('/api/internships', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { setInternships(r.data); setFiltered(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    let res = internships;
    if (search) res = res.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.companyName.toLowerCase().includes(search.toLowerCase()) || i.course.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'paid') res = res.filter(i => i.isPaid);
    if (filter === 'free') res = res.filter(i => !i.isPaid);
    setFiltered(res);
  }, [search, filter, internships]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="dashboard-layout">
      <Sidebar onLogout={handleLogout} />
      <div className="main-content">
        <div className="page-header">
          <h1>Welcome, {user?.username || user?.companyName}! 👋</h1>
          <p>Browse internship opportunities tailored for you</p>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: 600 }}>
          <div className="stat-card"><div className="stat-value">{internships.length}</div><div className="stat-label">Available Internships</div></div>
          <div className="stat-card"><div className="stat-value">{internships.filter(i => i.isPaid).length}</div><div className="stat-label">Paid Positions</div></div>
          <div className="stat-card"><div className="stat-value">{[...new Set(internships.map(i => i.companyName))].length}</div><div className="stat-label">Companies Hiring</div></div>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" style={{ paddingLeft: 42 }} placeholder="Search by title, company, or course…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'paid', 'free'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} style={{ textTransform: 'capitalize' }}>
                <FiFilter size={12} /> {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p>No internships found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="internship-grid">
            {filtered.map((intern, i) => (
              <motion.div key={intern.id} className="internship-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div>
                  <div className="intern-company">{intern.companyName}</div>
                  <div className="intern-title">{intern.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>{intern.course}</div>
                  <div className="intern-meta">
                    <span className="intern-meta-item"><FiClock size={12} /> {intern.durationHours}h total</span>
                    <span className="intern-meta-item"><FiCalendar size={12} /> {intern.durationDays} days</span>
                    {intern.isPaid && <span className="intern-meta-item"><FiDollarSign size={12} /> ₹{intern.stipend}/mo</span>}
                    {intern.hasIncentive && <span className="intern-meta-item">🎯 ₹{intern.incentiveAmount} incentive</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
                  <span className={`badge ${intern.isPaid ? 'badge-success' : 'badge-info'}`}>{intern.isPaid ? 'Paid' : 'Voluntary'}</span>
                  <Link to={`/student/apply/${intern.id}`} className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>Apply Now →</Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
