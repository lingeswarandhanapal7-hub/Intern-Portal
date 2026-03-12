const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

const logoHtml = `<div style="font-family:'Space Grotesk',Arial,sans-serif;font-size:22px;font-weight:800;background:linear-gradient(135deg,#5227FF,#7df9ff);-webkit-background-clip:text;color:#5227FF;margin-bottom:8px;">InternLink</div>`;

const sendOTP = async (email, otp, name = '') => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#060018;padding:36px;border-radius:16px;border:1px solid rgba(125,249,255,0.2);">
      ${logoHtml}
      <p style="color:rgba(255,255,255,0.5);font-size:12px;margin-bottom:28px;">INTERNSHIP & INDUSTRIAL TRAINING PORTAL</p>
      <h2 style="color:#fff;font-size:22px;margin-bottom:8px;">Verify Your Email Address 🔐</h2>
      <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin-bottom:28px;">
        Hi ${name || 'there'},<br/>Use the OTP below to verify your email. It is valid for <strong style="color:#7df9ff;">10 minutes</strong>.
      </p>
      <div style="background:rgba(125,249,255,0.08);border:2px solid rgba(125,249,255,0.3);border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
        <div style="font-size:42px;font-weight:900;letter-spacing:14px;color:#7df9ff;font-family:monospace;">${otp}</div>
      </div>
      <p style="color:rgba(255,255,255,0.4);font-size:12px;text-align:center;">If you did not request this, please ignore this email.</p>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0"/>
      <p style="color:rgba(255,255,255,0.3);font-size:11px;text-align:center;">© 2026 InternLink. All rights reserved.</p>
    </div>`;

  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_gmail@gmail.com') {
    console.log(`\n📧 [DEV MODE] OTP for ${email}: ${otp}\n`);
    return otp; // Return OTP so API can include it in response for browser display
  }
  await transporter.sendMail({ from: `"InternLink" <${process.env.EMAIL_USER}>`, to: email, subject: `${otp} — Your InternLink Verification Code`, html });
};

const sendStatusEmail = async (email, status, internshipTitle, companyName, applicantName) => {
  const isAccepted = status === 'accepted';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#060018;padding:36px;border-radius:16px;border:1px solid rgba(125,249,255,0.2);">
      ${logoHtml}
      <p style="color:rgba(255,255,255,0.5);font-size:12px;margin-bottom:28px;">APPLICATION UPDATE</p>
      <div style="font-size:48px;text-align:center;margin-bottom:16px;">${isAccepted ? '🎉' : '📋'}</div>
      <h2 style="color:#fff;font-size:22px;margin-bottom:8px;text-align:center;">
        ${isAccepted ? 'Congratulations! You\'ve been Accepted' : 'Application Status Update'}
      </h2>
      <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin-bottom:20px;text-align:center;">
        Hi ${applicantName},<br/>
        Your application for <strong style="color:#7df9ff;">${internshipTitle}</strong><br/>at <strong style="color:#7df9ff;">${companyName}</strong> has been
        <strong style="color:${isAccepted ? '#00e676' : '#ff5252'}"> ${isAccepted ? 'ACCEPTED' : 'REVIEWED'}</strong>.
      </p>
      ${isAccepted
        ? `<div style="background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.3);border-radius:12px;padding:20px;margin-bottom:20px;">
            <p style="color:#00e676;font-size:14px;margin:0;">✅ The company will contact you soon with the next steps. Please keep your email and phone accessible.</p>
           </div>`
        : `<div style="background:rgba(255,82,82,0.06);border:1px solid rgba(255,82,82,0.2);border-radius:12px;padding:20px;margin-bottom:20px;">
            <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0;">Don't be discouraged! Keep applying to more opportunities on InternLink. Every rejection is a step closer to the right fit. 💪</p>
           </div>`}
      <div style="text-align:center;">
        <a href="http://localhost:5173/student/applications" style="display:inline-block;background:linear-gradient(135deg,#5227FF,#7df9ff);color:#fff;text-decoration:none;padding:12px 28px;border-radius:50px;font-weight:600;font-size:15px;">View My Applications</a>
      </div>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0"/>
      <p style="color:rgba(255,255,255,0.3);font-size:11px;text-align:center;">© 2026 InternLink. All rights reserved.</p>
    </div>`;

  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_gmail@gmail.com') {
    console.log(`\n📧 [DEV MODE] Status email to ${email}: ${status.toUpperCase()} for "${internshipTitle}"\n`);
    return;
  }
  await transporter.sendMail({ from: `"InternLink" <${process.env.EMAIL_USER}>`, to: email, subject: isAccepted ? `🎉 Congratulations! Your application was accepted — ${internshipTitle}` : `Application update: ${internshipTitle} — ${companyName}`, html });
};

module.exports = { sendOTP, sendStatusEmail };
