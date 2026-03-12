const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const { sendStatusEmail } = require('../utils/mailer');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '../data');
const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx'];
  if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
  else cb(new Error('Only PDF/DOC/DOCX files allowed'));
}});

const readApplications = () => { const f = path.join(DATA_DIR, 'applications.json'); if (!fs.existsSync(f)) return []; return JSON.parse(fs.readFileSync(f, 'utf8')); };
const writeApplications = d => fs.writeFileSync(path.join(DATA_DIR, 'applications.json'), JSON.stringify(d, null, 2));
const readInternships = () => { const f = path.join(DATA_DIR, 'internships.json'); if (!fs.existsSync(f)) return []; return JSON.parse(fs.readFileSync(f, 'utf8')); };
const readUsers = () => { const f = path.join(DATA_DIR, 'users.json'); if (!fs.existsSync(f)) return []; return JSON.parse(fs.readFileSync(f, 'utf8')); };

// ── POST /api/applications — Student applies ──
router.post('/', authMiddleware, upload.single('resume'), (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students can apply' });
  const { internshipId, fullName, phone, cgpa, branch, college, yearOfStudy, coverNote } = req.body;
  if (!internshipId || !fullName || !phone || !branch || !college || !yearOfStudy) return res.status(400).json({ message: 'Required fields missing' });

  const internships = readInternships();
  const intern = internships.find(i => i.id === internshipId);
  if (!intern) return res.status(404).json({ message: 'Internship not found' });

  const apps = readApplications();
  if (apps.find(a => a.internshipId === internshipId && a.studentId === req.user.id)) {
    return res.status(409).json({ message: 'You have already applied for this internship' });
  }

  const users = readUsers();
  const student = users.find(u => u.id === req.user.id);

  const application = {
    id: uuidv4(),
    internshipId, internshipTitle: intern.title, companyName: intern.companyName, durationDays: intern.durationDays,
    studentId: req.user.id, studentEmail: req.user.email,
    fullName, phone, cgpa: cgpa || '', branch, college, yearOfStudy, coverNote: coverNote || '',
    resumeUrl: req.file ? req.file.filename : null,
    status: 'pending',
    appliedAt: new Date().toISOString()
  };

  apps.push(application);
  writeApplications(apps);
  res.status(201).json({ message: 'Application submitted successfully!', application });
});

// ── GET /api/applications/my — Student's own ──
router.get('/my', authMiddleware, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Student access only' });
  const apps = readApplications();
  const mine = apps.filter(a => a.studentId === req.user.id);
  res.json(mine);
});

// ── PUT /api/applications/:id/status — Company accepts/rejects ──
router.put('/:id/status', authMiddleware, async (req, res) => {
  if (req.user.role !== 'company') return res.status(403).json({ message: 'Company access only' });
  const { status } = req.body;
  if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ message: 'Status must be accepted or rejected' });

  const apps = readApplications();
  const idx = apps.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Application not found' });

  const app = apps[idx];
  // Verify this company owns the internship
  const internships = readInternships();
  const intern = internships.find(i => i.id === app.internshipId && i.companyId === req.user.id);
  if (!intern) return res.status(403).json({ message: 'Not authorized to update this application' });

  apps[idx].status = status;
  writeApplications(apps);

  // Send email notification
  try {
    await sendStatusEmail(app.studentEmail, status, app.internshipTitle, app.companyName, app.fullName);
  } catch (e) { console.error('Email send failed:', e.message); }

  res.json({ message: `Application ${status} and student notified via email`, application: apps[idx] });
});

module.exports = router;
