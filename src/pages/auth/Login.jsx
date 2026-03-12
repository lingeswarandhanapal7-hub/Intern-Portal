import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ElectricBorder from '../../components/ElectricBorder/ElectricBorder';
import Hyperspeed from '../../components/Hyperspeed/Hyperspeed';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { ...form, role });
      login(res.data.user, res.data.token);
      navigate(role === 'company' ? '/company/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-hyperspeed-bg">
        <Hyperspeed effectOptions={{ distortion:'turbulentDistortion', length:400, roadWidth:10, islandWidth:2, lanesPerRoad:3, fov:90, fovSpeedUp:150, speedUp:1.5, carLightsFade:0.4, totalSideLightSticks:20, lightPairsPerRoadWay:40, shoulderLinesWidthPercentage:0.05, brokenLinesWidthPercentage:0.1, brokenLinesLengthPercentage:0.5, lightStickWidth:[0.12,0.5], lightStickHeight:[1.3,1.7], movingAwaySpeed:[60,80], movingCloserSpeed:[-120,-160], carLightsLength:[12,80], carLightsRadius:[0.05,0.14], carWidthPercentage:[0.3,0.5], carShiftX:[-0.8,0.8], carFloorSeparation:[0,5], colors:{ roadColor:0x080808, islandColor:0x0a0a0a, background:0x000000, shoulderLines:0x131318, brokenLines:0x131318, leftCars:[0x7df9ff,0x5227FF,0x00b4d8], rightCars:[0x5227FF,0x7c3aed,0x3b0764], sticks:0x7df9ff } }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,0,24,0.6), rgba(6,0,24,0.8))', zIndex: 1 }} />

      <motion.div className="auth-card-wrapper" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <ElectricBorder color="#7df9ff" speed={0.8} chaos={0.1} borderRadius={20}>
          <div className="auth-card">
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div className="logo-text gradient-text">InternLink</div>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 8, marginBottom: 4 }}>Welcome Back</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Sign in to your account</p>
            </div>

            {/* Role Selector */}
            <div className="role-selector">
              {['student', 'company'].map(r => (
                <button key={r} onClick={() => setRole(r)} className={`role-btn ${role === r ? 'active' : ''}`}>
                  {r === 'student' ? '🎓 Student' : '🏢 Company'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-icon-wrap">
                  <FiMail className="input-icon" />
                  <input type="email" className="form-input with-icon" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-icon-wrap">
                  <FiLock className="input-icon" />
                  <input type={showPass ? 'text' : 'password'} className="form-input with-icon with-right" placeholder="Your password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                  <button type="button" className="input-eye" onClick={() => setShowPass(p => !p)}>{showPass ? <FiEyeOff /> : <FiEye />}</button>
                </div>
              </div>
              <div style={{ textAlign: 'right', marginBottom: 20 }}>
                <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--accent-cyan)' }}>Forgot password?</Link>
              </div>
              {error && <div className="form-error" style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(255,82,82,0.1)', borderRadius: 8, border: '1px solid rgba(255,82,82,0.3)' }}>{error}</div>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? <div className="spinner" /> : <><span>Sign In</span><FiArrowRight /></>}
              </button>
            </form>

            <div className="divider"><span className="divider-text">New to InternLink?</span></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/register/student" className="btn btn-ghost btn-sm" style={{ flex: 1, textAlign: 'center' }}>Student Register</Link>
              <Link to="/register/company" className="btn btn-ghost btn-sm" style={{ flex: 1, textAlign: 'center' }}>Company Register</Link>
            </div>
          </div>
        </ElectricBorder>
      </motion.div>

      <style>{`
        .auth-card { padding: 36px; background: rgba(6,0,24,0.92); border-radius: 20px; }
        .logo-text { font-family: 'Space Grotesk', sans-serif; font-size: 26px; font-weight: 800; }
        .role-selector { display: flex; gap: 10px; margin-bottom: 24px; background: rgba(255,255,255,0.04); border-radius: 50px; padding: 4px; }
        .role-btn { flex: 1; padding: 10px; border: none; background: transparent; color: var(--text-secondary); border-radius: 50px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s; }
        .role-btn.active { background: linear-gradient(135deg, #5227FF, #7df9ff); color: #fff; box-shadow: 0 4px 15px rgba(82,39,255,0.4); }
        .input-icon-wrap { position: relative; }
        .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 16px; pointer-events: none; }
        .with-icon { padding-left: 42px; }
        .with-right { padding-right: 42px; }
        .input-eye { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; font-size: 16px; }
        .input-eye:hover { color: var(--text-primary); }
      `}</style>
    </div>
  );
}
