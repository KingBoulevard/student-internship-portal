from flask import Flask, render_template, request, redirect, url_for, flash
import os, datetime
import pymysql
from resume_parser import parse_resume, calculate_score, recommend_courses, recommend_skills
from dotenv import load_dotenv

app = Flask(__name__)
app.secret_key = "dev_secret_key"  # simple hardcoded key for school project

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ================================
# DB CONNECTION (edit credentials)
# ================================
# Load .env file
load_dotenv()

# DB connection using environment variables
connection = pymysql.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME")
)
cursor = connection.cursor()


cursor.execute("CREATE DATABASE IF NOT EXISTS cv;")
cursor.execute("""
CREATE TABLE IF NOT EXISTS user_data (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255),
    Email VARCHAR(255),
    Resume_Score INT,
    Timestamp VARCHAR(50),
    Page_No INT,
    Predicted_Field VARCHAR(255),
    Job_Description VARCHAR(255),
    User_Level VARCHAR(50) DEFAULT 'Beginner',
    Skills TEXT,
    Recommended_Skills TEXT
)
""")

# Predefined Job Descriptions
JOB_DESCRIPTIONS = [
    "Software Engineer",
    "Data Scientist",
    "Web Developer",
    "Android Developer",
    "iOS Developer",
    "UI/UX Designer"
]

# -----------------------
# ROUTES
# -----------------------

@app.route("/")
def index():
    return render_template(
        "index.html", 
        job_descriptions=JOB_DESCRIPTIONS,
        selected_jd=""
    )

@app.route("/upload", methods=["POST"])
def upload():
    if "resume" not in request.files:
        return "No file uploaded", 400
    file = request.files["resume"]
    jd_text = request.form.get("jd_text", "")
    save_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(save_path)

    # --- Parse resume ---
    resume_data = parse_resume(save_path)

    # --- Score resume (JD-aware) ---
    score = calculate_score(resume_data["text"], jd_text, resume_data["skills"])

    # --- Recommend field & courses ---
    field, courses = recommend_courses(resume_data["skills"])

    # --- Recommend missing core skills ---
    recommended_skills = recommend_skills(resume_data["skills"], jd_text)

    # --- Determine User Level ---
    if score >= 80:
        user_level = "Advanced"
    elif score >= 50:
        user_level = "Intermediate"
    else:
        user_level = "Beginner"

    # --- Prevent duplicate by email ---
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("SELECT * FROM user_data WHERE Email=%s", (resume_data["email"],))
    existing = cursor.fetchone()

    if not existing:
        cursor.execute("""
        INSERT INTO user_data 
        (Name, Email, Resume_Score, Timestamp, Page_No, Predicted_Field, Job_Description, User_Level, Skills, Recommended_Skills)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            resume_data["name"], 
            resume_data["email"], 
            score, 
            ts, 
            resume_data["pages"], 
            field,            
            jd_text,          
            user_level,
            ", ".join(resume_data["skills"]), 
            ", ".join(recommended_skills)
        ))
        connection.commit()
        flash("Resume uploaded successfully!", "success")
    else:
        flash("This email has already submitted a resume. Duplicate prevented.", "warning")

    return render_template(
        "index.html", 
        result=resume_data, 
        score=score, 
        selected_jd=jd_text,
        job_descriptions=JOB_DESCRIPTIONS,
        field=field,
        courses=courses,
        recommended_skills=recommended_skills
    )

@app.route("/admin")
def admin():
    selected_jd = request.args.get("jd", "")  # filter by job description
    if selected_jd:
        cursor.execute("SELECT * FROM user_data WHERE Job_Description=%s ORDER BY Resume_Score DESC", (selected_jd,))
    else:
        cursor.execute("SELECT * FROM user_data ORDER BY Resume_Score DESC")

    data = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    data_dicts = [dict(zip(columns, row)) for row in data]

    return render_template(
        "admin.html", 
        data=data_dicts,
        job_descriptions=JOB_DESCRIPTIONS,
        selected_jd=selected_jd
    )

if __name__ == "__main__":
    import webbrowser
    webbrowser.open("http://127.0.0.1:5000/")
    app.run(debug=True)
