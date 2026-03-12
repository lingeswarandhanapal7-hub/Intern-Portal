import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useRef } from 'react';
import Hyperspeed from '../components/Hyperspeed/Hyperspeed';
import MagicBento from '../components/MagicBento/MagicBento';
import Dock from '../components/Dock/Dock';
import { FiHome, FiSearch, FiBriefcase, FiLink, FiLogIn, FiUserPlus } from 'react-icons/fi';

const features = [
  { label: 'Students', icon: '🎓', title: 'Find Your Dream Internship', description: 'Browse hundreds of verified internship listings from top companies across all domains.' },
  { label: 'Companies', icon: '🏢', title: 'Hire Top Talent', description: 'Post internship opportunities and discover pre-screened candidates ready to contribute.' },
  { label: 'Verified', icon: '✅', title: 'OTP-Verified Accounts', description: 'Every account is email-verified ensuring a safe and trusted platform for all.' },
  { label: 'Tracking', icon: '📊', title: 'Track Applications', description: 'Students get real-time updates on their application status directly via email.' },
  { label: 'Resume', icon: '📄', title: 'Resume Upload', description: 'Attach your resume to applications for a complete professional profile.' },
  { label: 'Resources', icon: '🔗', title: 'External Links', description: 'Explore other top internship platforms to maximize your opportunities.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);

  const dockItems = [
    { icon: <FiHome size={18} />, label: 'Home', onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { icon: <FiSearch size={18} />, label: 'Features', onClick: () => featuresRef.current?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: <FiBriefcase size={18} />, label: 'Internships', onClick: () => navigate('/login') },
    { icon: <FiLink size={18} />, label: 'Resources', onClick: () => navigate('/resources') },
    { icon: <FiLogIn size={18} />, label: 'Login', onClick: () => navigate('/login') },
    { icon: <FiUserPlus size={18} />, label: 'Register', onClick: () => navigate('/register/student') },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <Hyperspeed effectOptions={{ distortion:'turbulentDistortion', length:400, roadWidth:10, islandWidth:2, lanesPerRoad:3, fov:90, fovSpeedUp:150, speedUp:2, carLightsFade:0.4, totalSideLightSticks:20, lightPairsPerRoadWay:40, shoulderLinesWidthPercentage:0.05, brokenLinesWidthPercentage:0.1, brokenLinesLengthPercentage:0.5, lightStickWidth:[0.12,0.5], lightStickHeight:[1.3,1.7], movingAwaySpeed:[60,80], movingCloserSpeed:[-120,-160], carLightsLength:[12,80], carLightsRadius:[0.05,0.14], carWidthPercentage:[0.3,0.5], carShiftX:[-0.8,0.8], carFloorSeparation:[0,5], colors:{ roadColor:0x080808, islandColor:0x0a0a0a, background:0x000000, shoulderLines:0x131318, brokenLines:0x131318, leftCars:[0x7df9ff,0x5227FF,0x00b4d8], rightCars:[0x5227FF,0x7c3aed,0x3b0764], sticks:0x7df9ff } }} />
        </div>
        <div className="hero-overlay" />
        <div className="hero-content container">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span>India's Fastest Growing Internship Portal</span>
            </div>
            <h1 className="hero-title">
              Launch Your Career with<br />
              <span className="gradient-text">InternLink</span>
            </h1>
            <p className="hero-subtitle">Connect students with companies for meaningful internships and industrial training. Built for India's next generation of professionals.</p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/register/student')}>
                <FiSearch size={18} /> Find Internships
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/register/company')}>
                <FiBriefcase size={18} /> Post Internship
              </button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><strong className="gradient-text">500+</strong><span>Internships</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong className="gradient-text">200+</strong><span>Companies</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong className="gradient-text">1000+</strong><span>Students</span></div>
            </div>
          </motion.div>
        </div>
        <div className="hero-scroll-indicator">
          <motion.div className="scroll-dot" animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section section" ref={featuresRef}>
        <div className="container">
          <motion.div style={{ textAlign: 'center', marginBottom: 48 }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="section-label">PLATFORM FEATURES</div>
            <h2 className="section-title">Everything You Need to <span className="gradient-text">Succeed</span></h2>
            <p className="section-subtitle">A complete ecosystem connecting students and companies for internship success.</p>
          </motion.div>
          <MagicBento cards={features} enableStars enableSpotlight enableBorderGlow clickEffect spotlightRadius={400} particleCount={10} glowColor="125, 249, 255" />
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section section">
        <div className="container">
          <motion.div style={{ textAlign: 'center', marginBottom: 56 }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="section-label">HOW IT WORKS</div>
            <h2 className="section-title">Simple. <span className="gradient-text">Fast. Effective.</span></h2>
          </motion.div>
          <div className="how-grid">
            {[
              { num: '01', title: 'Create Account', desc: 'Register as a student or company with email OTP verification', icon: '🔐' },
              { num: '02', title: 'Post or Browse', desc: 'Companies post internships with full details. Students browse and filter.', icon: '🔍' },
              { num: '03', title: 'Apply & Connect', desc: 'Students apply with resume. Companies review and respond via email.', icon: '🤝' },
            ].map((step, i) => (
              <motion.div key={i} className="how-step card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <div className="how-num">{step.num}</div>
                <div className="how-icon">{step.icon}</div>
                <h3 className="how-title">{step.title}</h3>
                <p className="how-desc">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section section">
        <div className="container">
          <motion.div className="cta-banner" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="cta-title">Ready to Start Your Journey?</h2>
            <p className="cta-desc">Join thousands of students and companies on InternLink today.</p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/register/student')}>I'm a Student</button>
              <button className="btn btn-ghost btn-lg" onClick={() => navigate('/register/company')}>I'm a Company</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-logo"><span className="gradient-text" style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 22 }}>InternLink</span></div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 8 }}>© 2026 InternLink. Connecting students with opportunities.</p>
        </div>
      </footer>

      {/* Dock Navigation */}
      <Dock items={dockItems} panelHeight={64} baseItemSize={44} magnification={62} />

      <style>{`
        .landing-page { min-height: 100vh; background: var(--bg-primary); padding-bottom: 100px; }
        .hero-section { position: relative; min-height: 100vh; display: flex; align-items: center; overflow: hidden; }
        .hero-bg { position: absolute; inset: 0; z-index: 0; }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(6,0,24,0.3) 0%, rgba(6,0,24,0.7) 60%, rgba(6,0,24,1) 100%); z-index: 1; }
        .hero-content { position: relative; z-index: 2; padding-top: 80px; padding-bottom: 80px; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(125,249,255,0.08); border: 1px solid rgba(125,249,255,0.2); padding: 8px 16px; border-radius: 50px; font-size: 13px; color: var(--accent-cyan); margin-bottom: 28px; font-weight: 500; }
        .hero-badge-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-cyan); animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
        .hero-title { font-size: clamp(36px, 6vw, 72px); font-weight: 900; line-height: 1.1; margin-bottom: 20px; }
        .hero-subtitle { font-size: clamp(16px, 2.5vw, 20px); color: var(--text-secondary); max-width: 580px; line-height: 1.7; margin-bottom: 36px; }
        .hero-cta { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 48px; }
        .hero-stats { display: flex; align-items: center; gap: 24px; }
        .hero-stat { display: flex; flex-direction: column; }
        .hero-stat strong { font-size: 28px; font-weight: 800; font-family: var(--font-display); }
        .hero-stat span { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
        .hero-stat-divider { width: 1px; height: 32px; background: var(--border-color); }
        .hero-scroll-indicator { position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); z-index: 2; width: 24px; height: 40px; border: 2px solid rgba(125,249,255,0.3); border-radius: 12px; display: flex; align-items: flex-start; padding: 6px; justify-content: center; }
        .scroll-dot { width: 4px; height: 8px; background: var(--accent-cyan); border-radius: 4px; }
        .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: var(--accent-cyan); margin-bottom: 12px; }
        .features-section { background: var(--bg-secondary); }
        .how-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
        .how-step { text-align: center; padding: 36px 28px; }
        .how-num { font-size: 48px; font-weight: 900; font-family: var(--font-display); color: rgba(125,249,255,0.15); margin-bottom: 12px; }
        .how-icon { font-size: 36px; margin-bottom: 16px; }
        .how-title { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
        .how-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
        .cta-section { background: var(--bg-secondary); }
        .cta-banner { background: linear-gradient(135deg, rgba(82,39,255,0.15), rgba(125,249,255,0.08)); border: 1px solid rgba(125,249,255,0.2); border-radius: var(--radius-xl); padding: 64px 48px; text-align: center; }
        .cta-title { font-size: clamp(24px,4vw,42px); margin-bottom: 14px; }
        .cta-desc { font-size: 17px; color: var(--text-secondary); margin-bottom: 36px; }
        .landing-footer { padding: 40px 0; border-top: 1px solid var(--border-color); text-align: center; }
      `}</style>
    </div>
  );
}
