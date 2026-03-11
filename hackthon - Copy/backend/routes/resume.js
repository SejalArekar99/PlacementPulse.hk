const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');

// Setup multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: function (req, file, cb) {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Files of type pdf, doc, docx only!');
        }
    }
});

// @route   POST api/resume/analyze
// @desc    Upload resume, send to ML API, save results
// @access  Private
router.post('/analyze', auth, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const { cgpa, internships, dsaScore } = req.body;

        // 1. Prepare data to send to Python API
        const form = new FormData();
        form.append('resume', fs.createReadStream(req.file.path));
        form.append('cgpa', cgpa || 0);
        form.append('internships', internships || 0);
        form.append('dsa_score', dsaScore || 0);

        // 2. Call Python ML API
        const ML_API_URL = process.env.ML_API_URL || 'http://127.0.0.1:8000/api/predict';
        
        const response = await axios.post(ML_API_URL, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        const mlData = response.data;

        // 3. Save to MongoDB
        const newResume = new Resume({
            userId: req.user.id,
            metrics: {
                cgpa: Number(cgpa),
                internships: Number(internships),
                dsaScore: Number(dsaScore)
            },
            analysis: {
                probability: mlData.probability,
                atsScore: mlData.atsScore,
                skills: mlData.skills,
                improvements: mlData.improvements,
                strengths: mlData.strengths,
                roles: mlData.roles
            },
            fileName: req.file.filename
        });

        const savedResume = await newResume.save();

        // 4. Return results to frontend
        res.json({
            resume: savedResume,
            analysis: mlData
        });

    } catch (err) {
        console.error('Error analyzing resume:', err.message);
        if (err.response) {
             console.error('ML API Error:', err.response.data);
             return res.status(500).json({ msg: 'ML API Error', details: err.response.data });
        }
        res.status(500).json({ msg: 'Server Error' });
    } finally {
        // Clean up uploaded file from Node.js server to save space
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    }
});

// @route   GET api/resume/history
// @desc    Get user's past resume analyses
// @access  Private
router.get('/history', auth, async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(resumes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
