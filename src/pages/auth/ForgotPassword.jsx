import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../api';
import ElectricBorder from '../../components/ElectricBorder/ElectricBorder';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPass, setNewPass] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.devOtp) setDevOtp(res.data.devOtp);
      setStep(2); // auto-advance immediately after OTP is sent
    } catch (err) {
      setError(err.response?.data?.message || 'Email not found. Please check and try again.');
    } finally { setLoading(false); }
  };

  const handleReset = async () => {
    setError(''); setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword: newPass });
      setStep(3); // auto-advance to success
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Please check your OTP and try again.');
    } finally { setLoading(false); }
  };

  const StepDots = () => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
      {[1, 2, 3].map(n => (
        <div key={n} style={{
          width: n === step ? 24 : 8, height: 8, borderRadius: 4,
          background: n <= step ? 'linear-gradient(135deg,#5227FF,#7df9ff)' : 'rgba(255,255,255,0.1)',
          transition: 'all 0.3s'
        }} />
      ))}
    </div>
  );

  return (
    <div className="auth-page" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(82,39,255,0.12) 0%, transparent 60%)', zIndex: 0 }} />
      <motion.div className="auth-card-wrapper" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <ElectricBorder color="#7df9ff" speed={0.7} chaos={0.09} borderRadius={20}>
          <div style={{ padding: 32, background: 'rgba(6,0,24,0.92)', borderRadius: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg,#5227FF,#7df9ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>InternLink</div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>Reset Password</h1>
            </div>

            <StepDots />

            <AnimatePresence mode="wait">
              {/* ── Step 1: Enter Email ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h2 style={{ fontSize: 16, marginBottom: 12, color: 'var(--text-secondary)' }}>Enter your registered email</h2>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="email" className="form-input" style={{ paddingLeft: 42 }} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>
                  {error && <p className="form-error" style={{ marginBottom: 8 }}>{error}</p>}
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSendOTP} disabled={loading || !email.trim()}>
                    {loading ? <div className="spinner" /> : <><span>Send OTP</span><FiArrowRight /></>}
                  </button>
                </motion.div>
              )}

              {/* ── Step 2: OTP + New Password ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h2 style={{ fontSize: 16, marginBottom: 6 }}>Enter OTP & New Password</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
                    OTP sent to <strong style={{ color: 'var(--accent-cyan)' }}>{email}</strong>
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
                    <label className="form-label">6-Digit OTP</label>
                    <input className="form-input" style={{ fontSize: 22, letterSpacing: 10, textAlign: 'center' }} placeholder="••••••" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <div style={{ position: 'relative' }}>
                      <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="password" className="form-input" style={{ paddingLeft: 42 }} placeholder="Min 6 characters" value={newPass} onChange={e => setNewPass(e.target.value)} />
                    </div>
                  </div>
                  {error && <p className="form-error" style={{ marginBottom: 8 }}>{error}</p>}
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleReset} disabled={loading || otp.length < 6 || newPass.length < 6}>
                    {loading ? <div className="spinner" /> : <><span>Reset Password</span><FiArrowRight /></>}
                  </button>
                </motion.div>
              )}

              {/* ── Step 3: Success ── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{ textAlign: 'center', padding: '16px 0' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }} style={{ fontSize: 56, marginBottom: 12 }}>✅</motion.div>
                  <h2 style={{ fontSize: 20, marginBottom: 8 }}>Password Reset!</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                    Your password has been updated. You can now login with your new password.
                  </p>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>Go to Login</button>
                </motion.div>
              )}
            </AnimatePresence>

            {step < 3 && (
              <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
                <Link to="/login" style={{ color: 'var(--accent-cyan)' }}>← Back to Login</Link>
              </div>
            )}
          </div>
        </ElectricBorder>
      </motion.div>
    </div>
  );
}
