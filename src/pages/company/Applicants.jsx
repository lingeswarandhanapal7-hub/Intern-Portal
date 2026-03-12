import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { FiArrowLeft, FiCheck, FiX, FiDownload, FiGrid, FiPlusCircle, FiLogOut } from 'react-icons/fi';

const Sidebar = ({ onLogout }) => (
  <div className="sidebar">
    <div className="sidebar-logo">
      <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 20, background: 'linear-gradient(135deg,#5227FF,#7df9ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>InternLink</span>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }}>Company Portal</div>
    </div>
    <nav className="sidebar-nav">
      <Link to="/company/dashboard"><FiGrid size={16} /> Dashboard</Link>
      <Link to="/company/post"><FiPlusCircle size={16} /> Post Internship</Link>
    </nav>
    <div style={{ marginTop: 'auto', padding: '0 16px 16px' }}>
      <button onClick={onLogout} className="btn btn-ghost btn-sm" style={{ width: '100%', color: 'var(--error)', borderColor: 'rgba(255,82,82,0.3)' }}>
        <FiLogOut size={14} /> Logout
      </button>
    </div>
  </div>
);

const statusColor = { pending: 'badge-warning', accepted: 'badge-success', rejected: 'badge-error' };

export default function Applicants() {
  const { id } = useParams();
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/internships/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
      api.get(`/internships/${id}/applications`, { headers: { Authorization: `Bearer ${token}` } })
    ]).then(([iRes, aRes]) => { setInternship(iRes.data); setApplicants(aRes.data); })
      .catch(console.error).finally(() => setLoading(false));
  }, [id, token]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAction = async (appId, status) => {
    setActionLoading(appId + status);
    try {
      await api.put(`/applications/${appId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setApplicants(p => p.map(a => a.id === appId ? { ...a, status } : a));
      showToast(`Applicant ${status === 'accepted' ? 'accepted' : 'rejected'} and email sent!`, status === 'accepted' ? 'success' : 'info');
    } catch {
      showToast('Action failed. Please try again.', 'error');
    } finally { setActionLoading(''); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="dashboard-layout">
      <Sidebar onLogout={handleLogout} />
      <div className="main-content">
        <Link to="/company/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20, textDecoration: 'none' }}>
          <FiArrowLeft /> Back to Dashboard
        </Link>
        {internship && (
          <div className="page-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 20, marginBottom: 28 }}>
            <h1>{internship.title}</h1>
            <p>{internship.course} • {internship.durationDays} Days • {internship.isPaid ? `₹${internship.stipend}/mo` : 'Unpaid'}</p>
          </div>
        )}

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className={`toast toast-${toast.type}`} style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999 }}>
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
        ) : applicants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <p>No applications received yet. Share this internship to attract students!</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Applications</h2>
              <span className="badge badge-info">{applicants.length} Total</span>
            </div>
            <div style={{ background: 'var(--gradient-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <table className="applicant-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>College</th>
                    <th>Branch</th>
                    <th>Year</th>
                    <th>CGPA</th>
                    <th>Resume</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((app, i) => (
                    <motion.tr key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{app.fullName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{app.studentEmail}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>{app.college}</td>
                      <td style={{ fontSize: 13 }}>{app.branch}</td>
                      <td style={{ fontSize: 13 }}>{app.yearOfStudy}</td>
                      <td style={{ fontSize: 13 }}>{app.cgpa || '—'}</td>
                      <td>
                        {app.resumeUrl ? (
                          <a href={`/api/files/${app.resumeUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ padding: '4px 10px' }}>
                            <FiDownload size={12} /> View
                          </a>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>None</span>}
                      </td>
                      <td><span className={`badge ${statusColor[app.status] || 'badge-info'}`} style={{ textTransform: 'capitalize' }}>{app.status}</span></td>
                      <td>
                        {app.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => handleAction(app.id, 'accepted')}
                              disabled={actionLoading === app.id + 'accepted'}
                              style={{ background: 'rgba(0,230,118,0.15)', border: '1px solid rgba(0,230,118,0.4)', color: 'var(--success)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                              {actionLoading === app.id + 'accepted' ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <><FiCheck size={13} /> Accept</>}
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => handleAction(app.id, 'rejected')}
                              disabled={actionLoading === app.id + 'rejected'}
                              style={{ background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.3)', color: 'var(--error)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                              {actionLoading === app.id + 'rejected' ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <><FiX size={13} /> Reject</>}
                            </motion.button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Email sent</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
