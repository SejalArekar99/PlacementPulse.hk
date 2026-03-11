# Setup Guide

Follow these steps to run the Smart Resume Analyzer on your local machine.

## Prerequisites

- **Node.js** (v16 or higher recommended)
- **Python** (v3.9 or higher recommended)
- **MongoDB** (Local instance installed or MongoDB Atlas URI)

---

## 1. Machine Learning API (Python) Setup

1. Open your terminal and navigate to the `ml_model` directory:
   ```bash
   cd ml_model
   ```
2. (Optional but recommended) Create and activate a Virtual Environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Download the `spaCy` NLP model used for keyword extraction:
   ```bash
   python -m spacy download en_core_web_sm
   ```
5. Run the Flask server. This step will automatically train the mock ML model locally the first time you run it.
   ```bash
   python app.py
   ```
   > The API should now be running at `http://127.0.0.1:8000`. Keep this terminal window open.

---

## 2. Backend (Node.js) Setup

1. Open a **new** terminal window and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the necessary NPM dependencies:
   ```bash
   npm install
   ```
3. (Optional) Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/resume-analyzer-db
   JWT_SECRET=super_secret_key_123
   ML_API_URL=http://127.0.0.1:8000/api/predict
   ```
   *If you don't create this file, the app will use default local fallback values.*

4. Ensure that your MongoDB server is running locally (usually handled automatically by MongoDB Service).

5. Start the backend Node server using:
   ```bash
   npm run dev
   # OR
   node server.js
   ```
   > The backend should now be running at `http://localhost:5000`. Keep this terminal window open.

---

## 3. Frontend Setup

Since the frontend consists of native HTML, CSS, and JS (Vanilla), you can just serve the root folder.

1. Using **VSCode Live Server** extension (Recommended):
   - Open `index.html` in VSCode.
   - Click "Go Live" in the bottom right corner.
2. OR, using a basic Python HTTP Server:
   - Navigate to the root folder (`hackthon`) in a terminal.
   - Run: `python -m http.server 3000`
   - Open your browser to `http://localhost:3000`.

## Testing the Application
1. Click **Login** / **Register** in the top right to create an account.
2. Enter your mock academic profile details (CGPA, etc).
3. Drag and Drop a PDF/DOCX Resume when prompted.
4. Watch the application talk to the Node backend -> Python ML API -> and update the UI with real predictions!
