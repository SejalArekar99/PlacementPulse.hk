# Smart Resume Analyzer and Job Placement Prediction System

An AI-powered web application that allows students to upload their resumes, evaluate their profiles against job requirements, and predict placement probabilities using Machine Learning.

## Features

- **User Authentication:** Secure JWT-based registration and login system.
- **Resume Upload & Parsing:** Support for PDF and DOCX files. Extracts skills and evaluates ATS compatibility using spaCy and PyPDF2.
- **Resume Evaluation:** Suggests missing skills and provides actionable growth recommendations based on the student's profile (CGPA, Internships, DSA score).
- **Placement Prediction:** Utilizes a Scikit-Learn Random Forest model to predict the probability of landing a job.
- **Skill Gap Analysis:** Identifies strengths and areas for improvement.
- **Interactive Dashboard:** Beautiful glassmorphism UI with dynamic charts (Chart.js) and animated progress indicators.

## Tech Stack

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- Chart.js (Radar charts for skill analysis)
- FontAwesome Icons
- Google Fonts (Outfit, Inter)

### Backend (Node.js)
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **File Handling:** Multer (multipart/form-data)

### ML / NLP Service (Python)
- **API Framework:** Flask
- **Machine Learning:** Scikit-Learn, NumPy, Pandas
- **NLP / Document Parsing:** spaCy, PyPDF2, pdfplumber, python-docx

## Setup Instructions

Please see the [Setup Guide](setup-guide.md) for detailed instructions on how to install dependencies and run the project locally.

## Project Architecture

1. **Frontend:** Serves the static `index.html` and logic through `script.js`.
2. **Node.js REST API:** Handles user accounts, JWT security, saves analysis history to MongoDB, and acts as an intermediate reverse-proxy for the ML service.
3. **Python Flask API:** Receives the resume file from the Node.js server, extracts text, runs the ML classification model, and returns the computed scores and suggestions back to the Node backend.

---
*Developed for Hackathon Project 2026*
