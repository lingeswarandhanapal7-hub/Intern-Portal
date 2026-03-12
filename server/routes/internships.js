const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const readInternships = () => {
  const f = path.join(DATA_DIR, 'internships.json');
  if (!fs.existsSync(f)) return [];
  return JSON.parse(fs.readFileSync(f, 'utf8'));
};
const writeInternships = d => fs.writeFileSync(path.join(DATA_DIR, 'internships.json'), JSON.stringify(d, null, 2));

const readApplications = () => {
  const f = path.join(DATA_DIR, 'applications.json');
  if (!fs.existsSync(f)) return [];
  return JSON.parse(fs.readFileSync(f, 'utf8'));
};

const readUsers = () => {
  const f = path.join(DATA_DIR, 'users.json');
  if (!fs.existsSync(f)) return [];
  return JSON.parse(fs.readFileSync(f, 'utf8'));
};

// ── GET /api/internships — All active (for students) ──
router.get('/', authMiddleware, (req, res) => {
  const internships = readInternships();
  const applications = readApplications();
  const result = internships.map(i => ({
    ...i,
    applicationCount: applications.filter(a => a.internshipId === i.id).length
  }));
  res.json(result);
});

// ── GET /api/internships/mine — Company's own ──
router.get('/mine', authMiddleware, (req, res) => {
  if (req.user.role !== 'company') return res.status(403).json({ message: 'Company access only' });
  const internships = readInternships();
  const applications = readApplications();
  const mine = internships.filter(i => i.companyId === req.user.id).map(i => ({
    ...i,
    applicationCount: applications.filter(a => a.internshipId === i.id).length
  }));
  res.json(mine);
});

// ── GET /api/internships/:id — Single internship ──
router.get('/:id', authMiddleware, (req, res) => {
  const internships = readInternships();
  const intern = internships.find(i => i.id === req.params.id);
  if (!intern) return res.status(404).json({ message: 'Internship not found' });
  res.json(intern);
});

// ── POST /api/internships — Company posts ──
router.post('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'company') return res.status(403).json({ message: 'Only companies can post internships' });
  const { title, course, durationHours, durationDays, isPaid, stipend, hasIncentive, incentiveAmount, description } = req.body;
  if (!title || !course || !durationHours || !durationDays) return res.status(400).json({ message: 'Title, course, duration hours and days are required' });

  const users = readUsers();
  const company = users.find(u => u.id === req.user.id);
  const internship = {
    id: uuidv4(),
    companyId: req.user.id,
    companyName: company?.companyName || 'Unknown Company',
    title, course,
    durationHours: Number(durationHours),
    durationDays: Number(durationDays),
    isPaid: Boolean(isPaid),
    stipend: isPaid ? Number(stipend) : 0,
    hasIncentive: Boolean(hasIncentive),
    incentiveAmount: hasIncentive ? Number(incentiveAmount) : 0,
    description: description || '',
    postedAt: new Date().toISOString()
  };

  const internships = readInternships();
  internships.push(internship);
  writeInternships(internships);
  res.status(201).json(internship);
});

// ── DELETE /api/internships/:id ──
router.delete('/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'company') return res.status(403).json({ message: 'Only companies can delete internships' });
  const internships = readInternships();
  const idx = internships.findIndex(i => i.id === req.params.id && i.companyId === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'Internship not found or not authorized' });
  internships.splice(idx, 1);
  writeInternships(internships);
  res.json({ message: 'Internship deleted' });
});

// ── GET /api/internships/:id/applications — Company views applicants ──
router.get('/:id/applications', authMiddleware, (req, res) => {
  if (req.user.role !== 'company') return res.status(403).json({ message: 'Company access only' });
  const internships = readInternships();
  const intern = internships.find(i => i.id === req.params.id && i.companyId === req.user.id);
  if (!intern) return res.status(403).json({ message: 'Not your internship' });
  const applications = readApplications();
  const result = applications.filter(a => a.internshipId === req.params.id);
  res.json(result);
});

module.exports = router;
