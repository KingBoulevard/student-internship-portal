import re
import os
import json
from pdfminer.high_level import extract_text, extract_pages
import phonenumbers
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

# Handle CORS import
try:
    from flask_cors import CORS
    cors_available = True
    print("CORS support enabled")
except ImportError:
    cors_available = False
    print("flask-cors not installed. CORS support disabled.")

# Initialize Flask app
app = Flask(__name__)

# Enable CORS if available
if cors_available:
    CORS(app)

# Configuration
UPLOAD_FOLDER = 'temp_uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Skills definitions
ALL_SWE_SKILLS = {
    "python","java","c","c++","c#","go","golang","rust","php","ruby","swift","kotlin",
    "javascript","typescript","sql","r","html","css","sass","less","bootstrap","tailwind",
    "jquery","react","react js","reactjs","next.js","nextjs","angular","angular js",
    "vue","vue.js","svelte","node","node js","node.js","express","nestjs","django",
    "flask","spring","spring boot","laravel","rails","asp.net","asp.net core",
    "android","kotlin","java","xml","flutter","dart","ios","swift","xcode","objective-c",
    "machine learning","deep learning","pytorch","tensorflow","keras","scikit-learn","nlp",
    "pandas","numpy","matplotlib","tableau","powerbi","excel","statistics","data visualization",
    "git","github","gitlab","bitbucket","docker","kubernetes","helm","terraform",
    "aws","azure","gcp","linux","ci/cd","cicd","jenkins","github actions","gitlab ci",
    "nginx","apache","redis","rabbitmq","mysql","postgres","postgresql","sqlite","mongodb",
    "dynamodb","cassandra","elasticsearch","graphql","rest","microservices","testing",
    "unit testing","pytest","junit","selenium","figma","adobe xd","ui","ux","wireframes","prototyping",
}

SKILL_VARIATIONS = {
    "nodejs": "node.js",
    "reactjs": "react",
    "nextjs": "next.js",
    "angularjs": "angular",
    "vuejs": "vue.js",
    "springboot": "spring boot",
    "objective c": "objective-c",
    "scikit learn": "scikit-learn",
}

SOFT_SKILLS = {
    "teamwork","communication","problem solving","critical thinking","leadership",
    "time management","adaptability","creativity","collaboration","software engineering"
}

SECTION_HINTS_GOOD = [
    "education", "experience", "projects", "skills", "certifications", "work experience"
]

CORE_SKILLS_PER_JOB = {
    "Software Engineer": {"python","java","c++","git","testing"},
    "Data Scientist": {"python","r","machine learning","deep learning","pandas","numpy","statistics"},
    "Web Developer": {"html","css","javascript","react","node","django","flask"},
    "Android Developer": {"android","kotlin","java","xml"},
    "iOS Developer": {"ios","swift","xcode","objective-c"},
    "UI/UX Designer": {"figma","adobe xd","ui","ux","prototyping"}
}

def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()

def _extract_lines(text: str):
    return [ln.strip() for ln in text.splitlines() if ln.strip()]

def parse_resume(file_path):
    """Extract basic info from resume file"""
    try:
        text = extract_text(file_path) or ""
    except Exception as e:
        print(f"PDF parsing error: {e}")
        return {
            "name": "Unknown",
            "email": "Unknown",
            "mobile": "Unknown",
            "skills": [],
            "pages": 0,
            "text": ""
        }
    
    lines = _extract_lines(text)

    # Email extraction
    email_m = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    email = email_m.group().lower() if email_m else "Unknown"

    # Phone extraction
    mobile = "Unknown"
    try:
        for match in phonenumbers.PhoneNumberMatcher(text, "US"):
            mobile = phonenumbers.format_number(match.number, phonenumbers.PhoneNumberFormat.E164)
            break
    except Exception:
        pass

    # Name extraction
    name = "Unknown"
    for line in lines[:5]:
        if 1 <= len(line.split()) <= 4 and re.match(r"^[A-Za-z ,.'-]+$", line):
            name = line.title()
            break

    # Skills extraction
    lower_text = " " + _normalize(text) + " "
    skills_found = set()
    for sk in ALL_SWE_SKILLS | SOFT_SKILLS:
        pattern = r"(?<![A-Za-z0-9])" + re.escape(sk) + r"(?![A-Za-z0-9])"
        if re.search(pattern, lower_text, re.IGNORECASE):
            skills_found.add(sk)
    # Handle variations
    for var, canonical in SKILL_VARIATIONS.items():
        pattern = r"(?<![A-Za-z0-9])" + re.escape(var) + r"(?![A-Za-z0-9])"
        if re.search(pattern, lower_text, re.IGNORECASE):
            skills_found.add(canonical)

    try:
        no_of_pages = len(list(extract_pages(file_path)))
    except:
        no_of_pages = 1

    return {
        "name": name,
        "email": email,
        "mobile": mobile,
        "skills": sorted(skills_found),
        "pages": no_of_pages,
        "text": text
    }

def _skills_from_text(text: str):
    """Extract skills from text"""
    text_l = " " + _normalize(text) + " "
    found = set()
    for sk in ALL_SWE_SKILLS | SOFT_SKILLS:
        pattern = r"(?<![A-Za-z0-9])" + re.escape(sk) + r"(?![A-Za-z0-9])"
        if re.search(pattern, text_l, re.IGNORECASE):
            found.add(sk)
    for var, canonical in SKILL_VARIATIONS.items():
        pattern = r"(?<![A-Za-z0-9])" + re.escape(var) + r"(?![A-Za-z0-9])"
        if re.search(pattern, text_l, re.IGNORECASE):
            found.add(canonical)
    return found

def calculate_score(resume_skills, job_skills, resume_text: str = "") -> int:
    """Calculate match score between resume skills and job requirements"""
    resume_skills = set(map(str.lower, resume_skills or []))
    job_skills = set(map(str.lower, job_skills or []))
    
    if not job_skills:
        return min(100, len(resume_skills) * 3)
    
    # Calculate match percentage
    matched_skills = resume_skills & job_skills
    match_percentage = (len(matched_skills) / len(job_skills)) * 70 if job_skills else 0
    
    # Bonus for resume structure
    struct_points = 0
    if resume_text:
        lower_resume = _normalize(resume_text)
        struct_hits = sum(1 for s in SECTION_HINTS_GOOD if s in lower_resume)
        struct_points = min(20, struct_hits * 5)
    
    # Bonus for skill breadth
    skill_breadth = min(10, len(resume_skills) * 0.5)
    
    return int(min(100, match_percentage + struct_points + skill_breadth))

def analyze_application_match(student_data, job_data):
    """
    Main analysis function that compares student data with job requirements
    Receives data from your React/Node.js components
    """
    # Extract resume skills (could come from parsed resume or student profile)
    resume_skills = set()
    resume_text = ""
    
    # Handle resume file if provided
    if 'resume_file' in student_data and student_data['resume_file']:
        try:
            file_path = student_data['resume_file']
            resume_parsed = parse_resume(file_path)
            resume_skills = set(resume_parsed['skills'])
            resume_text = resume_parsed['text']
        except Exception as e:
            print(f"Resume parsing failed: {e}")
    
    # Also use skills from student profile if available
    if 'skills' in student_data:
        profile_skills = set(map(str.lower, student_data['skills']))
        resume_skills.update(profile_skills)
    
    # Extract job requirements
    job_skills = set()
    if 'required_skills' in job_data:
        job_skills = set(map(str.lower, job_data['required_skills']))
    else:
        # Auto-extract skills from job description
        job_description = job_data.get('description', '') + ' ' + job_data.get('requirements', '')
        job_skills = _skills_from_text(job_description)
    
    # Calculate match score
    score = calculate_score(resume_skills, job_skills, resume_text)
    
    # Skill analysis
    matched_skills = resume_skills & job_skills
    missing_skills = job_skills - resume_skills
    
    match_percentage = round((len(matched_skills) / len(job_skills)) * 100) if job_skills else 0
    
    # Skills breakdown by category
    skills_breakdown = {}
    for category, skills in {
        'programming': ['python', 'java', 'c++', 'c#', 'javascript', 'typescript', 'php', 'ruby', 'swift', 'kotlin', 'go', 'rust'],
        'web_development': ['html', 'css', 'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'express', 'spring', 'laravel'],
        'databases': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch'],
        'cloud_devops': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'git'],
        'data_science': ['python', 'r', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'pandas', 'numpy'],
        'mobile': ['android', 'ios', 'flutter', 'react native'],
        'design': ['figma', 'adobe xd', 'ui', 'ux', 'wireframes']
    }.items():
        found = [skill for skill in skills if skill in resume_skills]
        if found:
            skills_breakdown[category] = found
    
    # Generate recommendations
    recommendations = []
    if score < 50:
        recommendations.append("Candidate lacks core required skills for this position")
    elif score < 70:
        recommendations.append("Moderate match - consider for interview if other qualifications are strong")
    else:
        recommendations.append("Strong match - recommend for interview")
    
    if missing_skills:
        recommendations.append(f"Suggested skill development: {', '.join(list(missing_skills)[:3])}")
    
    if len(resume_skills) < 5:
        recommendations.append("Limited technical skills demonstrated")
    
    return {
        'overall_score': score,
        'match_percentage': match_percentage,
        'skills_found': len(resume_skills),
        'matched_skills_count': len(matched_skills),
        'missing_skills_count': len(missing_skills),
        'skills_breakdown': skills_breakdown,
        'matched_skills': list(matched_skills),
        'missing_skills': list(missing_skills),
        'recommendations': recommendations
    }

# API ENDPOINTS - Designed to work with your React/Node.js components

@app.route('/api/analyze-resume', methods=['POST'])
def analyze_resume():
    """
    Analyze a single resume against job requirements
    Expected data from your React frontend/Node backend:
    - resume_file: File object
    - job_data: {description, requirements, required_skills, etc.}
    - student_data: {skills, profile_info, etc.}
    """
    try:
        # Get resume file
        resume_file = request.files.get('resume')
        
        # Get JSON data from your React/Node components
        job_data = request.form.get('job_data', '{}')
        student_data = request.form.get('student_data', '{}')
        
        # Parse JSON data
        try:
            job_data = json.loads(job_data)
            student_data = json.loads(student_data)
        except json.JSONDecodeError:
            return jsonify({'error': 'Invalid JSON data in job_data or student_data'}), 400
        
        if not resume_file:
            return jsonify({'error': 'No resume file provided'}), 400
        
        if not allowed_file(resume_file.filename):
            return jsonify({'error': 'File type not allowed. Use PDF, DOCX, or TXT'}), 400
        
        # Save and process resume
        filename = secure_filename(resume_file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        resume_file.save(file_path)
        
        # Add file path to student data for processing
        student_data['resume_file'] = file_path
        
        # Perform analysis
        analysis_result = analyze_application_match(student_data, job_data)
        
        # Clean up
        try:
            os.remove(file_path)
        except:
            pass
        
        return jsonify({
            'success': True,
            'analysis': analysis_result,
            'score': analysis_result['overall_score'],
            'match_percentage': analysis_result['match_percentage']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-bulk-applications', methods=['POST'])
def analyze_bulk_applications():
    """
    Analyze multiple applications for a job
    Expected data structure from your Node.js backend:
    {
        "job_data": {...},
        "applications": [
            {
                "student_id": "123",
                "student_data": {...},
                "resume_file": file_object
            }
        ]
    }
    """
    try:
        job_data = request.form.get('job_data', '{}')
        applications_data = request.form.get('applications_data', '[]')
        
        try:
            job_data = json.loads(job_data)
            applications_data = json.loads(applications_data)
        except json.JSONDecodeError:
            return jsonify({'error': 'Invalid JSON data in job_data or applications_data'}), 400
        
        results = []
        
        for app_data in applications_data:
            try:
                # Handle resume file - could be file object or base64 encoded
                resume_file = None
                if 'resume_file' in app_data:
                    # Implementation depends on how files are sent from your frontend
                    pass
                
                # Analyze this application
                analysis = analyze_application_match(
                    app_data.get('student_data', {}), 
                    job_data
                )
                
                results.append({
                    'student_id': app_data.get('student_id', 'unknown'),
                    'analysis': analysis,
                    'score': analysis['overall_score'],
                    'match_percentage': analysis['match_percentage']
                })
                
            except Exception as e:
                results.append({
                    'student_id': app_data.get('student_id', 'unknown'),
                    'error': str(e),
                    'score': 0,
                    'match_percentage': 0
                })
        
        # Sort by score (highest first)
        valid_results = [r for r in results if 'error' not in r]
        valid_results.sort(key=lambda x: x['score'], reverse=True)
        
        return jsonify({
            'success': True,
            'job_title': job_data.get('title', 'Unknown Job'),
            'results': valid_results,
            'total_analyzed': len(valid_results),
            'top_candidate': valid_results[0] if valid_results else None
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/extract-job-skills', methods=['POST'])
def extract_job_skills():
    """
    Extract skills from job description
    Used by your Node.js backend when employers create job postings
    """
    try:
        data = request.get_json()
        job_description = data.get('description', '')
        job_requirements = data.get('requirements', '')
        
        combined_text = f"{job_description} {job_requirements}"
        extracted_skills = _skills_from_text(combined_text)
        
        return jsonify({
            'success': True,
            'extracted_skills': list(extracted_skills),
            'total_skills': len(extracted_skills)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/parse-resume-only', methods=['POST'])
def parse_resume_only():
    """
    Just parse resume and return extracted data
    Used when students upload resumes to their profiles
    """
    try:
        resume_file = request.files.get('resume')
        
        if not resume_file:
            return jsonify({'error': 'No resume file provided'}), 400
        
        if not allowed_file(resume_file.filename):
            return jsonify({'error': 'File type not allowed. Use PDF, DOCX, or TXT'}), 400
        
        filename = secure_filename(resume_file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        resume_file.save(file_path)
        
        parsed_data = parse_resume(file_path)
        
        # Clean up
        try:
            os.remove(file_path)
        except:
            pass
        
        return jsonify({
            'success': True,
            'parsed_data': parsed_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/compare-skills', methods=['POST'])
def compare_skills():
    """
    Direct skills comparison without file parsing
    Used when you already have skills data from your database
    """
    try:
        data = request.get_json()
        student_skills = data.get('student_skills', [])
        job_skills = data.get('job_skills', [])
        
        student_skills_set = set(map(str.lower, student_skills))
        job_skills_set = set(map(str.lower, job_skills))
        
        matched_skills = student_skills_set & job_skills_set
        missing_skills = job_skills_set - student_skills_set
        
        match_percentage = (len(matched_skills) / len(job_skills_set)) * 100 if job_skills_set else 0
        
        return jsonify({
            'success': True,
            'match_percentage': round(match_percentage, 2),
            'matched_skills': list(matched_skills),
            'missing_skills': list(missing_skills),
            'matched_count': len(matched_skills),
            'missing_count': len(missing_skills)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy', 
        'service': 'Resume Parser API', 
        'cors_enabled': cors_available
    })

if __name__ == '__main__':
    print("Starting Resume Parser Service...")
    print(f"CORS Support: {'Enabled' if cors_available else 'Disabled'}")
    print("Available endpoints:")
    print("  POST /api/analyze-resume - Analyze single resume against job")
    print("  POST /api/analyze-bulk-applications - Analyze multiple applications") 
    print("  POST /api/extract-job-skills - Extract skills from job description")
    print("  POST /api/parse-resume-only - Just parse resume data")
    print("  POST /api/compare-skills - Direct skills comparison")
    app.run(debug=True, port=5000)