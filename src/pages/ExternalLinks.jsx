import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiArrowLeft } from 'react-icons/fi';

const platforms = [
  { name: 'Internshala', url: 'https://internshala.com', logo: '🎓', desc: "India's #1 internship platform with 40,000+ listings across all fields.", tags: ['All Domains', 'Certificate', 'WFH'], color: '#00b4d8' },
  { name: 'LinkedIn', url: 'https://linkedin.com/jobs', logo: '💼', desc: 'Professional network with internship postings from global companies.', tags: ['Professional', 'Global', 'Networking'], color: '#0077b5' },
  { name: 'Naukri.com', url: 'https://naukri.com', logo: '🏢', desc: 'Top Indian job portal with fresh internship and trainee openings.', tags: ['India', 'IT', 'Core Industries'], color: '#e84393' },
  { name: 'Indeed', url: 'https://indeed.com', logo: '🌐', desc: 'World\'s largest job site with millions of internship opportunities worldwide.', tags: ['Worldwide', 'All Sectors'], color: '#003a9b' },
  { name: 'Unstop', url: 'https://unstop.com', logo: '🚀', desc: 'Competitions, hackathons, and internships by leading companies.', tags: ['Competitions', 'Hackathons'], color: '#7c3aed' },
  { name: 'Wellfound', url: 'https://wellfound.com', logo: '⭐', desc: 'Top platform for startup internships — build with the best teams.', tags: ['Startups', 'Tech', 'Equity'], color: '#f97316' },
  { name: 'TopHire', url: 'https://tophire.co', logo: '🔝', desc: 'Premium internship platform that places students in top companies.', tags: ['Premium', 'High Stipend'], color: '#10b981' },
  { name: 'Forage', url: 'https://theforage.com', logo: '📚', desc: 'Free virtual work experience programs from Fortune 500 companies.', tags: ['Free', 'Virtual', 'Fortune 500'], color: '#f59e0b' },
  { name: 'AICTE Internship Portal', url: 'https://internship.aicte-india.org', logo: '🇮🇳', desc: 'Government-backed internship portal for engineering and technical students.', tags: ['Government', 'AICTE', 'India'], color: '#5227FF' },
  { name: 'Amazon Jobs', url: 'https://amazon.jobs/students/', logo: '📦', desc: 'Amazon student and intern programs including SDE internships.', tags: ['Amazon', 'Tech', 'FAANG'], color: '#ff9900' },
  { name: 'Google Careers', url: 'https://careers.google.com/students/', logo: '🔵', desc: 'Google\'s student program with internships across engineering and business.', tags: ['Google', 'SWE', 'FAANG'], color: '#4285f4' },
  { name: 'Microsoft Careers', url: 'https://careers.microsoft.com/students/', logo: '🪟', desc: 'Internship roles at Microsoft across software, data, and research.', tags: ['Microsoft', 'SWE', 'FAANG'], color: '#00a4ef' },
];

export default function ExternalLinks() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '0 0 120px' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(82,39,255,0.15), rgba(125,249,255,0.05))', borderBottom: '1px solid var(--border-color)', padding: '40px 0 36px' }}>
        <div className="container">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, textDecoration: 'none' }}>
            <FiArrowLeft /> Back to Home
          </Link>
          <div style={{ display: 'inline-block', background: 'rgba(125,249,255,0.08)', border: '1px solid rgba(125,249,255,0.2)', padding: '6px 16px', borderRadius: 50, fontSize: 12, color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: 16, letterSpacing: 1 }}>RESOURCES</div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, marginBottom: 12 }}>
            Top Internship <span className="gradient-text">Platforms</span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 560 }}>
            Maximize your chances by exploring these leading internship portals alongside InternLink.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 48 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: 20 }}>
          {platforms.map((p, i) => (
            <motion.a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              style={{ textDecoration: 'none', display: 'block' }}
              whileHover={{ y: -4 }}>
              <div style={{ background: 'var(--gradient-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 24, height: '100%', position: 'relative', overflow: 'hidden', transition: 'border-color 0.25s, box-shadow 0.25s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = p.color + '60'; e.currentTarget.style.boxShadow = `0 8px 30px ${p.color}20`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(125,249,255,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}>
                {/* Top accent bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${p.color}, transparent)`, borderRadius: '20px 20px 0 0' }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                  <div style={{ fontSize: 36, flexShrink: 0, lineHeight: 1 }}>{p.logo}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>{p.name}</h3>
                      <FiExternalLink size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{p.desc}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {p.tags.map(t => (
                    <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 50, background: p.color + '15', color: p.color, border: `1px solid ${p.color}30`, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
