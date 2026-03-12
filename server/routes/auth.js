const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { sendOTP } = require('../utils/mailer');

const router = express.Router();

// ── JSON file-based storage ──
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const readUsers = () => {
  const f = path.join(DATA_DIR, 'users.json');
  if (!fs.existsSync(f)) return [];
  return JSON.parse(fs.readFileSync(f, 'utf8'));
};
const writeUsers = (users) => fs.writeFileSync(path.join(DATA_DIR, 'users.json'), JSON.stringify(users, null, 2));

// Temporary OTP store (in real production use Redis)
const otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── POST /api/auth/register ──
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, username, companyName } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: 'Email, password and role are required' });
    if (role === 'student' && !username) return res.status(400).json({ message: 'Username is required for students' });
    if (role === 'company' && !companyName) return res.status(400).json({ message: 'Company name is required' });

    const users = readUsers();
    if (users.find(u => u.email === email && u.role === role)) return res.status(409).json({ message: 'An account with this email already exists for this role' });

    const hashed = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    const newUser = { id: uuidv4(), email, password: hashed, role, username: username || null, companyName: companyName || null, verified: false, createdAt: new Date().toISOString() };
    users.push(newUser);
    writeUsers(users);

    let devOtp = null;
    try {
      devOtp = await sendOTP(email, otp, username || companyName);
    } catch (mailErr) {
      console.error('Email send error:', mailErr.message);
      // Remove user if email fails completely in production (so they can retry)
      if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_gmail@gmail.com') {
        const idx = users.findIndex(u => u.email === email);
        if (idx !== -1) { users.splice(idx, 1); writeUsers(users); }
        delete otpStore[email];
        return res.status(500).json({ message: 'Failed to send OTP email. Check your email address and try again.' });
      }
    }
    res.json({ message: 'Registration successful. OTP sent to your email.', ...(devOtp ? { devOtp } : {}) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ── POST /api/auth/verify-otp ──
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record) return res.status(400).json({ message: 'No OTP found for this email. Please register again.' });
  if (Date.now() > record.expiresAt) { delete otpStore[email]; return res.status(400).json({ message: 'OTP expired. Please request a new one.' }); }
  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
  
  const users = readUsers();
  const idx = users.findIndex(u => u.email === email);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  users[idx].verified = true;
  writeUsers(users);
  delete otpStore[email];
  res.json({ message: 'Email verified successfully!' });
});

// ── POST /api/auth/resend-otp ──
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const users = readUsers();
    const user = users.find(u => u.email === email);
    if (!user) return res.status(404).json({ message: 'Email not registered' });
    const otp = generateOTP();
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
    const devOtp = await sendOTP(email, otp, user.username || user.companyName);
    res.json({ message: 'OTP resent successfully', ...(devOtp ? { devOtp } : {}) });
  } catch {
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
});

// ── POST /api/auth/login ──
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: 'All fields are required' });

    const users = readUsers();
    const user = users.find(u => u.email === email && u.role === role);
    if (!user) return res.status(401).json({ message: 'Invalid credentials or wrong role selected' });
    if (!user.verified) return res.status(403).json({ message: 'Please verify your email before logging in' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'internlink_secret', { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ── POST /api/auth/forgot-password ──
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const users = readUsers();
    const user = users.find(u => u.email === email);
    if (!user) return res.status(404).json({ message: 'No account found with this email' });
    const otp = generateOTP();
    otpStore[`reset_${email}`] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
    const devOtp = await sendOTP(email, otp, user.username || user.companyName);
    res.json({ message: 'Password reset OTP sent to your email', ...(devOtp ? { devOtp } : {}) });
  } catch {
    res.status(500).json({ message: 'Failed to send reset OTP' });
  }
});

// ── POST /api/auth/reset-password ──
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = otpStore[`reset_${email}`];
    if (!record || Date.now() > record.expiresAt) return res.status(400).json({ message: 'OTP expired or not found' });
    if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    const users = readUsers();
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1) return res.status(404).json({ message: 'User not found' });
    users[idx].password = await bcrypt.hash(newPassword, 12);
    writeUsers(users);
    delete otpStore[`reset_${email}`];
    res.json({ message: 'Password reset successfully' });
  } catch {
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

module.exports = router;
