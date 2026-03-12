import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import ElectricBorder from '../../components/ElectricBorder/ElectricBorder';
import { FiBriefcase, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiRefreshCw } from 'react-icons/fi';

export default function CompanyRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ companyName: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleRegister = async () => {
    setError('');
    if (!form.companyName.trim()) { setError('Company name is required'); return; }
    if (!form.email.trim()) { setError('Email is required'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { ...form, role: 'company' });
      if (res.data.devOtp) setDevOtp(res.data.devOtp);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleOTP = async () => {
    setError(''); setLoading(true);
    try {
      await axios.post('/api/auth/verify-otp', { email: form.email, otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please check and try again.');
    } finally { setLoading(false); }
  };

  const resendOTP = async () => {
    setResendMsg(''); setError('');
    try {
      const res = await axios.post('/api/auth/resend-otp', { email: form.email });
      if (res.data.devOtp) setDevOtp(res.data.devOtp);
      setResendMsg('A new OTP has been sent!');
      setOtp('');
    } catch { setError('Failed to resend OTP. Please try again.'); }
  };

  const StepDots = () => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
      {[1, 2, 3].map(n => (
        <div key={n} style={{
          width: n === step ? 24 : 8, height: 8, borderRadius: 4,
          background: n <= step ? 'linear-gradient(135deg,#5227FF,#7c5cff)' : 'rgba(255,255,255,0.1)',
          transition: 'all 0.3s'
        }} />
      ))}
    </div>
  );

  return (
    <div className="auth-page" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 30%, rgba(82,39,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(125,249,255,0.08) 0%, transparent 50%)', zIndex: 0 }} />
      <motion.div className="auth-card-wrapper" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <ElectricBorder color="#5227FF" speed={0.8} chaos={0.1} borderRadius={20}>
          <div className="cr-card">
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg,#5227FF,#7df9ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>InternLink</div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>Company Registration</h1>
            </div>

            <StepDots />

            <AnimatePresence mode="wait">
              {/* ── Step 1: Company Details ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h2 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-secondary)' }}>Register Your Company</h2>
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <div className="cr-input-wrap">
                      <FiBriefcase className="cr-input-icon" />
                      <input className="form-input cr-with-icon" placeholder="Acme Technologies Pvt Ltd" value={form.companyName} onChange={e => set('companyName', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Official Email</label>
                    <div className="cr-input-wrap">
                      <FiMail className="cr-input-icon" />
                      <input type="email" className="form-input cr-with-icon" placeholder="hr@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="cr-input-wrap">
                      <FiLock className="cr-input-icon" />
                      <input type={showPass ? 'text' : 'password'} className="form-input cr-with-icon cr-with-right" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
                      <button type="button" className="cr-eye-btn" onClick={() => setShowPass(p => !p)}>{showPass ? <FiEyeOff /> : <FiEye />}</button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div className="cr-input-wrap">
                      <FiLock className="cr-input-icon" />
                      <input type="password" className="form-input cr-with-icon" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                    </div>
                  </div>
                  {error && <p className="form-error" style={{ marginBottom: 10 }}>{error}</p>}
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: 4, background: 'linear-gradient(135deg,#5227FF,#7c5cff)' }} onClick={handleRegister} disabled={loading}>
                    {loading ? <div className="spinner" /> : <><span>Continue</span><FiArrowRight /></>}
                  </button>
                </motion.div>
              )}

              {/* ── Step 2: OTP Verification ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h2 style={{ fontSize: 16, marginBottom: 6 }}>Verify Company Email</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                    OTP sent to <strong style={{ color: '#7df9ff' }}>{form.email}</strong>
                  </p>

                  {/* DEV MODE OTP Banner */}
                  {devOtp && (
                    <div style={{ background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.35)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16 }}>🔧</span>
                      <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,200,0,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Dev Mode — Your OTP</div>
                        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 10, color: '#ffd600', fontFamily: 'monospace' }}>{devOtp}</div>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Enter OTP</label>
                    <input
                      className="form-input"
                      style={{ fontSize: 24, letterSpacing: 12, textAlign: 'center' }}
                      placeholder="••••••" maxLength={6}
                      value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  {error && <p className="form-error" style={{ marginBottom: 8 }}>{error}</p>}
                  {resendMsg && <p style={{ color: 'var(--success)', fontSize: 13, marginBottom: 8 }}>{resendMsg}</p>}
                  <button className="btn btn-primary" style={{ width: '100%', marginBottom: 10, background: 'linear-gradient(135deg,#5227FF,#7c5cff)' }} onClick={handleOTP} disabled={loading || otp.length < 6}>
                    {loading ? <div className="spinner" /> : 'Verify OTP'}
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={resendOTP}>
                    <FiRefreshCw size={13} /> Resend OTP
                  </button>
                </motion.div>
              )}

              {/* ── Step 3: Success ── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }} style={{ fontSize: 56, marginBottom: 12 }}>🏢</motion.div>
                  <h2 style={{ fontSize: 20, marginBottom: 8 }}>Company Registered!</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                    Your company account is active. Start posting internship opportunities right away.
                  </p>
                  <button className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg,#5227FF,#7c5cff)' }} onClick={() => navigate('/login')}>Go to Login</button>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
              Already registered? <Link to="/login" style={{ color: 'var(--accent-cyan)' }}>Sign in</Link>
            </div>
          </div>
        </ElectricBorder>
      </motion.div>

      <style>{`
        .cr-card { padding: 32px; background: rgba(6,0,24,0.92); border-radius: 20px; }
        .cr-input-wrap { position: relative; }
        .cr-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 16px; pointer-events: none; }
        .cr-with-icon { padding-left: 42px !important; }
        .cr-with-right { padding-right: 42px !important; }
        .cr-eye-btn { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; font-size: 16px; }
        .cr-eye-btn:hover { color: var(--text-primary); }
      `}</style>
    </div>
  );
}
