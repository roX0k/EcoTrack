const express = require('express');
const { z } = require('zod');
const nodemailer = require('nodemailer');
const Report = require('../models/Report');
const connectDB = require('../config/db');

const router = express.Router();

const reportSchema = z.object({
  imageUrl: z.string().min(10, "Image data is required"),
  description: z.string().min(1, "Description is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const encouragementMessages = [
  "Every small step counts towards a cleaner environment!",
  "Thank you for being an eco-warrior!",
  "Your report helps make the world a better place.",
  "Great job spotting that! We're on it.",
  "Together, we can heal the planet.",
];

const sendEmailNotification = async (report) => {
  // Create transporter inside the function so it only runs when needed
  // and doesn't crash on cold start if env vars are missing
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Email env vars not set, skipping notification.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"EcoTrack System" <${process.env.SMTP_USER}>`,
    to: process.env.OFFICIAL_EMAIL,
    subject: "New Pollution Report Detected",
    text: `A new pollution report has been submitted.\n\nDescription: ${report.description}\nLocation: https://www.google.com/maps?q=${report.latitude},${report.longitude}\nTimestamp: ${report.timestamp}`,
    html: `
      <h2>New Pollution Report</h2>
      <p><strong>Description:</strong> ${report.description}</p>
      <p><strong>Location:</strong> <a href="https://www.google.com/maps?q=${report.latitude},${report.longitude}">View on Google Maps</a> (${report.latitude}, ${report.longitude})</p>
      <p><strong>Timestamp:</strong> ${report.timestamp}</p>
      <p><strong>Image Preview:</strong></p>
      <img src="${report.imageUrl}" alt="Pollution Image" width="400" />
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Notification email sent successfully');
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
};

// POST /report - Create a new pollution report
router.post('/report', async (req, res) => {
  try {
    await connectDB();
    const validatedData = reportSchema.parse(req.body);
    const newReport = new Report(validatedData);
    const savedReport = await newReport.save();
    sendEmailNotification(savedReport); // fire and forget
    res.status(201).json(savedReport);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error saving report:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /reports - Fetch all reports
router.get('/reports', async (req, res) => {
  try {
    await connectDB();
    const reports = await Report.find().sort({ timestamp: -1 });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /encouragement - Fetch a random encouragement message
router.get('/encouragement', (req, res) => {
  const randomIndex = Math.floor(Math.random() * encouragementMessages.length);
  res.json({ message: encouragementMessages[randomIndex] });
});

module.exports = router;
