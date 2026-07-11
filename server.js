const express = require('express');
const path = require('path');
const compression = require('compression');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable gzip compression for all responses
app.use(compression());

// Set cache headers for static assets
app.use((req, res, next) => {
  // Cache images and fonts for 30 days
  if(/\.(jpg|jpeg|png|gif|webp|woff|woff2|ttf|otf)$/i.test(req.path)) {
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
  }
  // Cache CSS and JS for 7 days
  else if(/\.(css|js)$/i.test(req.path)) {
    res.setHeader('Cache-Control', 'public, max-age=604800');
  }
  // HTML: cache for 1 hour, revalidate frequently
  else if(/\.html$/i.test(req.path)) {
    res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
  }
  next();
});

app.use(express.static(path.join(__dirname, '.')));

// Core Web Vitals optimization headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Preload critical resources
  res.setHeader('Link', '</style.css>; rel=preload; as=style, </js/main.js>; rel=preload; as=script');
  next();
});

app.get('/analytics.js', (req, res) => {
  const gaId = process.env.GA_MEASUREMENT_ID;
  res.type('application/javascript');

  if (!gaId) {
    return res.send('// Analytics not configured. Set GA_MEASUREMENT_ID in .env.');
  }

  res.send(`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}', { send_page_view: true });
  `);
});

const verificationFile = process.env.GOOGLE_SITE_VERIFICATION_FILE;
const verificationContent = process.env.GOOGLE_SITE_VERIFICATION_CONTENT;
if (verificationFile && verificationContent) {
  app.get(`/${verificationFile}`, (req, res) => {
    res.type('text/plain');
    res.send(verificationContent);
  });
}

// Email sending endpoint
app.post('/send-email', async (req, res) => {
  try {
    const { name, email, whatsapp, plan, services } = req.body;

    // Validate required fields
    if (!name || !email || !whatsapp) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'mahfuzislam6243@gmail.com',
        pass: process.env.GMAIL_PASSWORD
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.GMAIL_USER || 'mahfuzislam6243@gmail.com',
      to: 'mahfuzislam6243@gmail.com',
      subject: `New Portfolio Inquiry from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>Selected Plan:</strong> ${plan || 'Not selected'}</p>
        <p><strong>Services:</strong> ${services && services.length > 0 ? services.join(', ') : 'None selected'}</p>
        <hr/>
        <p><em>This is an automated email from your portfolio website.</em></p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Also send confirmation to the user
    const confirmationMail = {
      from: process.env.GMAIL_USER || 'mahfuzislam6243@gmail.com',
      to: email,
      subject: 'Thank you for your inquiry',
      html: `
        <h2>Thank you for reaching out!</h2>
        <p>Hi ${name},</p>
        <p>We have received your inquiry and will get back to you soon.</p>
        <p><strong>Your Details:</strong></p>
        <p>WhatsApp: ${whatsapp}</p>
        <p>Selected Plan: ${plan || 'Not selected'}</p>
        <hr/>
        <p>Best regards,<br>Mahfuz Islam</p>
      `
    };

    await transporter.sendMail(confirmationMail);

    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ success: false, error: 'Failed to send email', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
