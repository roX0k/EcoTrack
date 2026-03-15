const express = require('express');
const { z } = require('zod');
const { HfInference } = require('@huggingface/inference');
const Report = require('../models/Report');

const router = express.Router();
const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

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

// POST /report - Create a new pollution report
router.post('/report', async (req, res) => {
  try {
    // Validate request body
    const validatedData = reportSchema.parse(req.body);

    try {
      // Decode Base64 image
      const base64Data = validatedData.imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const blob = new Blob([imageBuffer], { type: 'image/jpeg' });

      // Run AI Object Detection
      const labels = await hf.imageClassification({
        data: blob,
        model: 'google/vit-base-patch16-224' 
      });

      console.log("AI Detected labels:", labels);

      // Check if the AI strongly thinks this is just a person/face
      const personLikelihood = labels.find(l => 
        l.label.toLowerCase().includes('person') || 
        l.label.toLowerCase().includes('face') || 
        l.label.toLowerCase().includes('man') || 
        l.label.toLowerCase().includes('woman')
      );

      if (personLikelihood && personLikelihood.score > 0.4) {
         return res.status(400).json({ 
           error: `AI rejected upload: Detected a person (${(personLikelihood.score * 100).toFixed(1)}% confidence). Please only upload pictures of pollution.` 
         });
      }

    } catch (aiError) {
      console.error("AI Verification failed, bypassing for now:", aiError.message);
      // We log the error but let it pass if HF API is down/rate-limited temporarily
    }

    const newReport = new Report(validatedData);
    const savedReport = await newReport.save();

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
