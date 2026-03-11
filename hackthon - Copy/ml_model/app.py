from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from resume_parser import parse_resume
from model import predict_placement_probability

app = Flask(__name__)
CORS(app) # Allow cross-origin requests from Node.js

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/predict', methods=['POST'])
def predict():
    # 1. Get student metrics
    try:
        cgpa = float(request.form.get('cgpa', 0))
        internships = int(request.form.get('internships', 0))
        dsa_score = float(request.form.get('dsa_score', 0))
    except ValueError:
        return jsonify({"error": "Invalid student metrics provided."}), 400

    # 2. Get and save the resume file
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided."}), 400
        
    file = request.files['resume']
    if file.filename == '':
        return jsonify({"error": "No selected file."}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # 3. Parse resume
            parsed_data = parse_resume(filepath)
            if "error" in parsed_data:
                return jsonify(parsed_data), 400
                
            ats_score = parsed_data['ats_score']
            skills = parsed_data['skills']
            improvements = parsed_data['improvements']
            
            # 4. Predict probability
            probability = predict_placement_probability(
                cgpa=cgpa,
                internships=internships,
                dsa_score=dsa_score,
                ats_score=ats_score
            )
            
            # 5. Return aggregated results
            return jsonify({
                "probability": probability,
                "ats_score": ats_score,
                "skills": skills,
                "improvements": improvements,
                "strengths": [
                    f"Strong academic record (CGPA: {cgpa})" if cgpa >= 8.0 else "",
                    f"Practical experience ({internships} internships)" if internships > 0 else "",
                    f"Solid fundamentals (DSA: {dsa_score})" if dsa_score > 75 else ""
                ],
                "roles": ["Software Engineer"] + (["Backend Engineer"] if dsa_score >= 85 else [])
            })
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            # Clean up the uploaded file after processing
            if os.path.exists(filepath):
                os.remove(filepath)
    else:
        return jsonify({"error": "Invalid file format. Allowed: pdf, doc, docx"}), 400

if __name__ == '__main__':
    # Initialize the model on startup
    import model
    model.load_model()
    # Run server
    app.run(debug=True, port=8000)
