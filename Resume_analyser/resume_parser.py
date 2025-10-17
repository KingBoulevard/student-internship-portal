import re
from pdfminer.high_level import extract_text, extract_pages
import spacy
import phonenumbers  # NEW: For robust phone number parsing
from Courses import ds_course, web_course, android_course, ios_course, uiux_course

# Load spaCy model once
nlp = spacy.load("en_core_web_sm")

# --- Canonical SWE skills (normalized to lowercase) ---
ALL_SWE_SKILLS = {
    # Languages
    "python","java","c","c++","c#","go","golang","rust","php","ruby","swift","kotlin",
    "javascript","typescript","sql","r",
    # Web core
    "html","css","sass","less","bootstrap","tailwind","jquery","react","react js","reactjs",
    "next.js","nextjs","angular","angular js","vue","vue.js","svelte",
    "node","node js","node.js","express","nestjs","django","flask","spring","spring boot",
    "laravel","rails","asp.net","asp.net core",
    # Mobile
    "android","kotlin","java","xml","flutter","dart","ios","swift","xcode","objective-c",
    # Data / ML
    "machine learning","deep learning","pytorch","tensorflow","keras","scikit-learn","nlp",
    "pandas","numpy","matplotlib","tableau","powerbi","excel","statistics","data visualization",
    # DevOps / Cloud
    "git","github","gitlab","bitbucket","docker","kubernetes","helm","terraform",
    "aws","azure","gcp","linux","ci/cd","cicd","jenkins","github actions","gitlab ci",
    "nginx","apache","redis","rabbitmq",
    # Databases
    "mysql","postgres","postgresql","sqlite","mongodb","dynamodb","cassandra","elasticsearch",
    "graphql","rest","microservices","testing","unit testing","pytest","junit","selenium",
    # Design / UX
    "figma","adobe xd","ui","ux","wireframes","prototyping",
}

# NEW: Skill variation mappings
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


# Some soft skills to consider
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

    """Extract basic info with better name heuristic + skills including soft skills."""
    text = extract_text(file_path) or ""
    lines = _extract_lines(text)
    doc = nlp(text)

    # --- Email & phone ---
    email_m = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    email = email_m.group() if email_m else "Unknown"

    phone_m = re.search(
        r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3}[-.\s]?\d{3,4}\b", text
    )
    mobile = phone_m.group() if phone_m else "Unknown"

    # --- Name heuristic ---
    name = None
    for ent in doc.ents:
        if ent.label_ == "PERSON" and 2 <= len(ent.text.split()) <= 4:
            name = ent.text.strip()
            break
    if not name and lines:
        first = lines[0]
        if 1 <= len(first.split()) <= 4 and re.match(r"^[A-Za-z ,.'-]+$", first):
            name = first.title()
    """Extract basic info with improved name heuristic + skills including soft skills."""
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
    doc = nlp(text)

    # --- Email ---
    email_m = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    email = email_m.group().lower() if email_m else "Unknown"

    # --- Phone ---
    mobile = "Unknown"
    try:
        for match in phonenumbers.PhoneNumberMatcher(text, "US"):  # Adjust region as needed
            mobile = phonenumbers.format_number(match.number, phonenumbers.PhoneNumberFormat.E164)
            break
    except Exception:
        pass  # Fallback to "Unknown" if phonenumbers fails

    # --- Name heuristic (check first 5 lines) ---
    name = None
    for ent in doc.ents:
        if ent.label_ == "PERSON" and 2 <= len(ent.text.split()) <= 4:
            name = ent.text.strip().title()
            break
    if not name:
        for line in lines[:5]:  # Check first 5 lines
            if 1 <= len(line.split()) <= 4 and re.match(r"^[A-Za-z ,.'-]+$", line):
                name = line.title()
                break
    if not name:
        name = "Unknown"

    # --- Skills extraction (SWE + soft skills) ---
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

    no_of_pages = len(list(extract_pages(file_path)))

    return {
        "name": name,
        "email": email,
        "mobile": mobile,
        "skills": sorted(skills_found),
        "pages": no_of_pages,
        "text": text
    }

def _skills_from_text(text: str):
    """Extract canonical SWE + soft skills from text."""
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

def calculate_score(resume_text: str, jd_text: str = "", resume_skills=None) -> int:
    """Improved scoring system with core skill prioritization."""
    resume_skills = set(map(str.lower, resume_skills or []))
    jd_skills = _skills_from_text(jd_text) if jd_text else set()

    jd_points = 0
    if jd_skills:
        core_skills = {s for s in jd_skills if s in CORE_SKILLS_PER_JOB.get(jd_text, jd_skills)}
        core_skills = CORE_SKILLS_PER_JOB.get(jd_text, jd_skills)  # Use all JD skills if not predefined
        matched_core = len(resume_skills & core_skills)
        matched_other = len(resume_skills & jd_skills) - matched_core

        core_score = 50 * (matched_core / max(1, len(core_skills)))

        other_score = 30 * (matched_other / max(1, len(jd_skills - core_skills)))
        jd_points = round(core_score + other_score)
    else:
        jd_points = min(80, len(resume_skills) * 4)
        other_score = 20 * (matched_other / max(1, len(jd_skills - core_skills)))
        jd_points = round(core_score + other_score)
        print(f"JD Skills: {jd_skills}, Core: {core_skills}, Matched Core: {matched_core}, Other: {matched_other}")  # Debug
    else:
        jd_points = min(90, len(resume_skills) * 3)  # Adjusted cap
        print(f"No JD, Skills Count: {len(resume_skills)}, JD Points: {jd_points}")  # Debug

    lower_resume = _normalize(resume_text)
    struct_hits = sum(1 for s in SECTION_HINTS_GOOD if s in lower_resume)
    struct_points = min(20, struct_hits * 5)

    return int(min(100, jd_points + struct_points))

    print(f"Structure Hits: {struct_hits}, Struct Points: {struct_points}")  # Debug

    skill_breadth = min(10, len(resume_skills) * 0.5)  # NEW: 10% for skill count
    print(f"Skill Breadth Points: {skill_breadth}")  # Debug

    return int(min(100, jd_points + struct_points + skill_breadth))

def recommend_skills(resume_skills, jd_text: str = ""):
    """Recommend missing core skills only for the JD."""
    resume_skills = set(map(str.lower, resume_skills or []))
    if jd_text:
        core_skills = CORE_SKILLS_PER_JOB.get(jd_text, set())
        missing = list(core_skills - resume_skills)
        return missing[:12]

    # Fallback suggestions based on current skills
    suggestions = set()
    core_foundation = {
        "git","docker","ci/cd","testing","unit testing","sql","linux",
        "aws","azure","gcp","rest","graphql","mysql","postgres","mongodb"
    }
    suggestions |= core_foundation
    suggestions -= resume_skills
    return list(sorted(suggestions))[:12]

def recommend_courses(skills):
    sk = {s.lower() for s in skills}

    ds_keywords = {'tensorflow','keras','pytorch','machine learning','deep learning','flask','streamlit','python','r','sql'}
    web_keywords = {'react','django','node js','node','express','php','laravel','wordpress','javascript','angular','typescript','html','css'}
    android_keywords = {'android','flutter','kotlin','xml','kivy'}
    ios_keywords = {'ios','swift','cocoa','xcode','objective-c'}
    uiux_keywords = {'ux','figma','adobe xd','ui','prototyping','wireframes','photoshop','illustrator'}

    if sk & ds_keywords:
        return "Data Science", ds_course
    elif sk & web_keywords:
        return "Web Development", web_course
    elif sk & android_keywords:
        return "Android Development", android_course
    elif sk & ios_keywords:
        return "iOS Development", ios_course
    elif sk & uiux_keywords:
        return "UI/UX Design", uiux_course
    else:
        return "Software Engineering", web_course
        return "Software Engineering", web_course

