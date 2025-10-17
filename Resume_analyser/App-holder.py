# App.py (fixed)
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import os
import datetime
import pymysql
from resume_parser import parse_resume, calculate_score, _skills_from_text, analyze_application_match
from dotenv import load_dotenv
import threading
import time
from flask_cors import CORS
import traceback

# Load .env early
load_dotenv()

# DB connection factory (create a new connection when needed)
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "resume_db"),
    "autocommit": False,
    "charset": "utf8mb4",
    "cursorclass": pymysql.cursors.Cursor
}

def get_db_connection():
    return pymysql.connect(**DB_CONFIG)

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET", "dev_secret_key")
CORS(app)  # Enable CORS for all routes

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Background processing queue (in-memory)
analysis_queue = []
processing_lock = threading.Lock()

# -----------------------
# Utility functions (recommendations, scoring helpers)
# -----------------------

def recommend_courses(skills):
    tech_skills = ['python', 'java', 'javascript', 'react', 'node', 'machine learning']
    has_tech = any(skill in [s.lower() for s in skills] for skill in tech_skills)
    if has_tech:
        return "Software Engineering", ["Advanced Programming", "System Design", "Software Architecture"]
    else:
        return "General", ["Programming Fundamentals", "Computer Science Basics", "Career Development"]

def recommend_skills(resume_skills, jd_text=""):
    resume_skills_set = set(map(str.lower, resume_skills))
    jd_skills = _skills_from_text(jd_text) if jd_text else set()
    missing_skills = jd_skills - resume_skills_set
    if not missing_skills:
        common_skills = {'git', 'docker', 'sql', 'testing', 'aws', 'linux'}
        missing_skills = common_skills - resume_skills_set
    return list(missing_skills)[:5]

def fixed_calculate_score(resume_text, jd_text="", resume_skills=None):
    if isinstance(resume_text, list):
        resume_text = " ".join(resume_text)
    elif not isinstance(resume_text, str):
        resume_text = str(resume_text)
    if resume_skills is None:
        resume_skills = []
    resume_skills_set = set(map(str.lower, resume_skills))
    jd_skills = _skills_from_text(jd_text) if jd_text else set()
    if not jd_skills:
        return min(100, int(len(resume_skills_set) * 3))
    matched_skills = resume_skills_set & jd_skills
    match_percentage = (len(matched_skills) / len(jd_skills)) * 70 if jd_skills else 0
    struct_points = 0
    if resume_text:
        lower_resume = resume_text.lower()
        section_hints = ["education", "experience", "projects", "skills", "certifications", "work experience"]
        struct_hits = sum(1 for s in section_hints if s in lower_resume)
        struct_points = min(20, struct_hits * 5)
    skill_breadth = min(10, len(resume_skills_set) * 0.5)
    return int(min(100, match_percentage + struct_points + skill_breadth))

def analyze_resume_with_job_description(file_path, job_description="", job_requirements="", required_skills=""):
    try:
        resume_data = parse_resume(file_path)
        job_data = {
            'description': job_description,
            'requirements': job_requirements,
            'required_skills': required_skills.split(',') if required_skills else []
        }
        student_data = {
            'resume_file': file_path,
            'skills': resume_data.get('skills', [])
        }
        analysis_result = analyze_application_match(student_data, job_data)
        analysis_result['resume_data'] = resume_data
        return analysis_result
    except Exception as e:
        print(f"Error in analyze_resume_with_job_description: {e}")
        traceback.print_exc()
        return {
            'overall_score': 0,
            'match_percentage': 0,
            'skills_found': 0,
            'matched_skills_count': 0,
            'missing_skills_count': 0,
            'skills_breakdown': {},
            'matched_skills': [],
            'missing_skills': [],
            'recommendations': ['Analysis failed'],
            'resume_data': {
                'name': 'Unknown',
                'email': 'Unknown',
                'skills': [],
                'pages': 0,
                'text': ''
            }
        }

# -----------------------
# Background thread
# -----------------------
def process_analysis_queue():
    """Background thread to process resume analysis using its own DB connection"""
    while True:
        try:
            if analysis_queue:
                with processing_lock:
                    item = analysis_queue.pop(0) if analysis_queue else None
                if not item:
                    time.sleep(1)
                    continue

                application_id, resume_path, job_id, student_id = item  # changed internship_id -> job_id

                try:
                    conn = get_db_connection()
                    with conn.cursor() as cursor:
                        # Fetch job info from internships table
                        cursor.execute("""
                            SELECT title, description, requirements, skills_required, location, 
                                   internship_type, salary, application_deadline 
                            FROM internships WHERE id = %s
                        """, (job_id,))
                        job_data = cursor.fetchone()

                        if not job_data:
                            print(f"Job id {job_id} not found while processing application {application_id}")
                            conn.close()
                            continue

                        (title, description, requirements, required_skills,
                         location, internship_type, salary, application_deadline) = job_data

                        # Analyze resume
                        analysis_result = analyze_resume_with_job_description(
                            resume_path,
                            description,
                            requirements,
                            required_skills
                        )

                        # Parse resume to get text and skills
                        resume_data = parse_resume(resume_path)
                        combined_jd_text = f"{description or ''} {requirements or ''} {required_skills or ''}"
                        score = fixed_calculate_score(resume_data.get("text", ""), combined_jd_text, resume_data.get("skills", []))
                        field, courses = recommend_courses(resume_data.get("skills", []))
                        recommended_skills = recommend_skills(resume_data.get("skills", []), combined_jd_text)

                        # Ensure analysis_results table exists
                        cursor.execute("""
                        CREATE TABLE IF NOT EXISTS analysis_results (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            application_id VARCHAR(255) UNIQUE,
                            job_id VARCHAR(255),
                            student_id VARCHAR(255),
                            student_name VARCHAR(255),
                            student_email VARCHAR(255),
                            resume_score INT,
                            match_percentage FLOAT,
                            skills_found INT,
                            matched_skills TEXT,
                            missing_skills TEXT,
                            skills_breakdown TEXT,
                            recommendations TEXT,
                            job_description TEXT,
                            job_requirements TEXT,
                            required_skills TEXT,
                            analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                        """)
                        conn.commit()

                        ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                        cursor.execute("""
                        INSERT INTO analysis_results 
                        (application_id, job_id, student_id, student_name, student_email, 
                         resume_score, match_percentage, skills_found, matched_skills, 
                         missing_skills, skills_breakdown, recommendations,
                         job_description, job_requirements, required_skills)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                        resume_score=%s, match_percentage=%s, skills_found=%s, 
                        matched_skills=%s, missing_skills=%s, skills_breakdown=%s, 
                        recommendations=%s, job_description=%s, job_requirements=%s,
                        required_skills=%s, analyzed_at=%s
                        """, (
                            application_id,
                            job_id,  # <-- fixed here
                            student_id,
                            resume_data.get("name", ""),
                            resume_data.get("email", ""),
                            score,
                            analysis_result.get('match_percentage', 0),
                            analysis_result.get('skills_found', 0),
                            ", ".join(analysis_result.get('matched_skills', [])),
                            ", ".join(analysis_result.get('missing_skills', [])),
                            str(analysis_result.get('skills_breakdown', {})),
                            ", ".join(analysis_result.get('recommendations', [])),
                            description,
                            requirements,
                            required_skills,
                            # Update values
                            score,
                            analysis_result.get('match_percentage', 0),
                            analysis_result.get('skills_found', 0),
                            ", ".join(analysis_result.get('matched_skills', [])),
                            ", ".join(analysis_result.get('missing_skills', [])),
                            str(analysis_result.get('skills_breakdown', {})),
                            ", ".join(analysis_result.get('recommendations', [])),
                            description,
                            requirements,
                            required_skills,
                            ts
                        ))
                        conn.commit()
                        print(f"Successfully analyzed application {application_id} for job {job_id}")
                except Exception as e:
                    print(f"Error processing application {application_id}: {e}")
                    traceback.print_exc()
                finally:
                    try:
                        conn.close()
                    except Exception:
                        pass
        except Exception as outer_e:
            print("Unexpected error in analysis thread:", outer_e)
            traceback.print_exc()
        time.sleep(1)


processing_thread = threading.Thread(target=process_analysis_queue, daemon=True)
processing_thread.start()

# -----------------------
# Request logging (helpful for debugging)
# -----------------------
@app.before_request
def log_request_info():
    try:
        print(f"[REQUEST] {request.method} {request.path} args={dict(request.args)} json={request.get_json(silent=True)}")
    except Exception:
        # don't let logging break the request
        pass

# -----------------------
# API ROUTES for Frontend Integration
# -----------------------

@app.route("/api/employers/job-postings", methods=["GET"])
def get_employer_job_postings():
    """Get job postings - accepts employer_id (fixes earlier typo employers_id)"""
    try:
        # Accept either parameter name to be defensive about client typos
        employer_id = request.args.get('employer_id') or request.args.get('employers_id')

        if not employer_id:
            return jsonify({'success': False, 'error': 'Employer ID required (use employer_id)'}), 400

        query = """
            SELECT 
                id, 
                title, 
                company, 
                location, 
                internship_type as type, 
                deadline,
                description,
                requirements,
                skills_required as required_skills,
                created_at,
                (SELECT COUNT(*) FROM applications WHERE internship_id = internships.id) as applications_count
            FROM internships 
            WHERE employer_id = %s AND is_active = 1
            ORDER BY created_at DESC
        """

        conn = get_db_connection()
        with conn.cursor() as cursor:
            print("Executing query:", query, "with employer_id:", employer_id)
            cursor.execute(query, (employer_id,))
            jobs = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description] if cursor.description else []
            job_dicts = [dict(zip(columns, row)) for row in jobs] if jobs else []

        conn.close()

        return jsonify({'success': True, 'jobPostings': job_dicts})
    except Exception as e:
        print(f"Error fetching job postings: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route("/api/employers/job-postings", methods=["POST"])
def create_job_posting():
    """Create a new job posting"""
    try:
        data = request.get_json()
        print("Received job posting data:", data)

        required_fields = ['title', 'company', 'location', 'deadline', 'description', 'requirements']
        for field in required_fields:
            if not data or field not in data:
                return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400

        employer_id = data.get('employer_id', 'current-employer-id')

        columns = [
            'title', 'company', 'description', 'requirements',
            'location', 'internship_type', 'deadline', 'skills_required',
            'employer_id', 'is_active'
        ]

        job_type = data.get('type', 'Internship')
        type_mapping = {
            'Internship': 'full-time',
            'Full-time': 'full-time',
            'Part-time': 'part-time',
            'Remote': 'remote',
            'Hybrid': 'hybrid'
        }
        internship_type = type_mapping.get(job_type, 'full-time')

        values = [
            data['title'],
            data['company'],
            data['description'],
            data['requirements'],
            data['location'],
            internship_type,
            data['deadline'],
            data.get('required_skills', ''),
            employer_id,
            1
        ]

        placeholders = ', '.join(['%s'] * len(columns))
        column_names = ', '.join(columns)
        query = f"INSERT INTO internships ({column_names}) VALUES ({placeholders})"

        conn = get_db_connection()
        with conn.cursor() as cursor:
            print(f"Executing: {query}")
            print(f"With values: {values}")
            cursor.execute(query, values)
            conn.commit()
            job_id = cursor.lastrowid
            print(f"Job created with ID: {job_id}")

        conn.close()

        return jsonify({'success': True, 'job_id': job_id, 'message': 'Job posted successfully'})
    except Exception as e:
        print(f"Error creating job posting: {e}")
        traceback.print_exc()
        try:
            conn.rollback()
            conn.close()
        except Exception:
            pass
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route("/api/employers/job-postings/<job_id>", methods=["GET"])
def get_job_posting(job_id):
    """Get specific job posting details"""
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, title, description, requirements, skills_required FROM internships WHERE id = %s", (job_id,))
            job = cursor.fetchone()
        conn.close()

        if not job:
            return jsonify({'success': False, 'error': 'Job not found'}), 404

        columns = ['id', 'title', 'description', 'requirements', 'required_skills']
        job_dict = dict(zip(columns, job))

        return jsonify({'success': True, 'job_posting': job_dict})
    except Exception as e:
        print(f"Error in get_job_posting: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route("/api/employers/job-applications/<job_id>", methods=["GET"])
def get_job_applications(job_id):
    """Get all applications for a specific job"""
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT a.id as application_id, a.student_id, a.resume_path, a.applied_at, a.status,
                       u.name as student_name, u.email as student_email,
                       ar.resume_score, ar.match_percentage, ar.skills_found, 
                       ar.matched_skills, ar.missing_skills, ar.recommendations
                FROM applications a
                LEFT JOIN users u ON a.student_id = u.id
                LEFT JOIN analysis_results ar ON a.id = ar.application_id
                WHERE a.job_id = %s
                ORDER BY a.applied_at DESC
            """, (job_id,))
            applications = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description] if cursor.description else []
            app_dicts = [dict(zip(columns, row)) for row in applications] if applications else []
        conn.close()

        return jsonify({'success': True, 'applications': app_dicts})
    except Exception as e:
        print(f"Error in get_job_applications: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route("/api/employers/job-postings/<int:job_id>", methods=["DELETE"])
def delete_job_posting(job_id):
    """Delete a job posting"""
    try:
        print(f"Attempting to delete job posting with ID: {job_id}")
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, title, employer_id FROM internships WHERE id = %s", (job_id,))
            fetched = cursor.fetchone()

            if not fetched:
                print(f"Job posting {job_id} not found")
                conn.close()
                return jsonify({'success': False, 'error': 'Job posting not found'}), 404

            fetched_id, job_title, current_employer_id = fetched
            print(f"Found job: {job_title} (ID: {fetched_id}) owned by employer: {current_employer_id}")

            cursor.execute("DELETE FROM internships WHERE id = %s", (fetched_id,))
            conn.commit()
        conn.close()

        print(f"Successfully deleted job posting: {job_title} (ID: {fetched_id})")
        return jsonify({'success': True, 'message': 'Job posting deleted successfully', 'deleted_job_id': fetched_id})
    except Exception as e:
        print(f"Error deleting job posting {job_id}: {e}")
        traceback.print_exc()
        try:
            conn.rollback()
            conn.close()
        except Exception:
            pass
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route("/api/employers/analyzed-applications/<job_id>", methods=["GET"])
def get_analyzed_applications(job_id):
    """Get analyzed applications with scores"""
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    ar.application_id,
                    ar.student_id,
                    ar.student_name,
                    ar.student_email,
                    ar.resume_score as score,
                    ar.match_percentage,
                    ar.skills_found,
                    ar.matched_skills,
                    ar.missing_skills,
                    ar.skills_breakdown,
                    ar.recommendations,
                    ar.analyzed_at,
                    a.applied_at,
                    a.status
                FROM analysis_results ar
                JOIN applications a ON ar.application_id = a.id
                WHERE ar.job_id = %s
                ORDER BY ar.resume_score DESC
            """, (job_id,))
            analyzed_apps = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description] if cursor.description else []
            analyzed_dicts = [dict(zip(columns, row)) for row in analyzed_apps] if analyzed_apps else []
        conn.close()

        return jsonify({'success': True, 'analyzed_applications': analyzed_dicts})
    except Exception as e:
        print(f"Error in get_analyzed_applications: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route("/api/employers/process-application", methods=["POST"])
def process_application():
    """Endpoint to trigger analysis for a new application"""
    try:
        data = request.get_json() or {}
        application_id = data.get('application_id')
        if not application_id:
            return jsonify({'success': False, 'error': 'Application ID required'}), 400

        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, job_id, student_id, resume_path FROM applications WHERE id = %s", (application_id,))
            application = cursor.fetchone()
        conn.close()

        if not application:
            return jsonify({'success': False, 'error': 'Application not found'}), 404

        app_id, job_id, student_id, resume_path = application

        with processing_lock:
            analysis_queue.append((app_id, resume_path, job_id, student_id))

        return jsonify({'success': True, 'message': 'Application added to analysis queue'})
    except Exception as e:
        print(f"Error in process_application: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'Resume Analysis API'})

if __name__ == "__main__":
    print("Starting Resume Analysis API Server...")
    print("Available endpoints:")
    print("  GET  /api/employers/job-postings?employer_id=XXX - Get employer's job postings")
    print("  POST /api/employers/job-postings - Create new job posting")
    print("  GET  /api/employers/job-applications/<job_id> - Get applications for job")
    print("  GET  /api/employers/analyzed-applications/<job_id> - Get analyzed applications")
    print("  POST /api/employers/process-application - Process application analysis")
    app.run(debug=True, port=5000)
