import PyPDF2
import pdfplumber
import spacy
import re
from docx import Document

# Attempt to load spacy model, but we should handle if it is not downloaded yet
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

def extract_text_from_pdf(file_path):
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error reading with pdfplumber: {e}")
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            print(f"Error reading with PyPDF2: {e}")
    return text

def extract_text_from_docx(file_path):
    doc = Document(file_path)
    text = []
    for paragraph in doc.paragraphs:
        text.append(paragraph.text)
    return "\n".join(text)

def parse_resume(file_path):
    if file_path.lower().endswith(".pdf"):
        text = extract_text_from_pdf(file_path)
    elif file_path.lower().endswith((".doc", ".docx")):
        text = extract_text_from_docx(file_path)
    else:
        text = ""
        
    if not text.strip():
        # Fallback for empty/image-based documents for the hackathon demo
        print("Warning: Failed to extract text. Using fallback mock text.")
        text = "Experienced software engineer with strong background in Python, Javascript, React, Node.js, and MongoDB. Proven track record in solving complex data structures and algorithms."

    # Process text with spacy
    doc = nlp(text)
    
    # Simple extraction logic (mocking for hackathon context)
    
    # 1. Extract Skills (Keyword matching)
    common_skills = ["python", "java", "c++", "javascript", "react", "node", "html", "css", 
                     "machine learning", "mongodb", "sql", "aws", "docker", "git", "linux", 
                     "data structures", "algorithms", "express", "django", "flask"]
                     
    found_skills = []
    text_lower = text.lower()
    for skill in common_skills:
        # Check for skill as a standalone word
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            found_skills.append(skill.title())
            
    # Calculate a simplified ATS score based on keyword hits and formatting
    # A real ATS parser would compare against a job description
    ats_score = min((len(found_skills) / max(len(common_skills), 1)) * 100 + 40, 95) # base 40, max 95
    
    # Generate mock improvements
    improvements = []
    if len(found_skills) < 5:
        improvements.append("Include more technical keywords relevant to the job description.")
    if len(text) < 500:
        improvements.append("Your resume content is quite short. Detail your experiences using the STAR method.")
        
    return {
        "text": text[:500] + "...", # return snippet for debugging
        "skills": found_skills,
        "ats_score": round(ats_score, 2),
        "improvements": improvements
    }
