from flask import Flask, render_template, request
import os
import json
from resumeparser import ats_extractor, read_file_from_path  # Assuming you created this
import yaml

app = Flask(__name__)
UPLOAD_PATH = "uploads"  # Or wherever your uploaded files are stored

# Load OpenAI key (optional for now)
with open("config.yaml") as file:
    config = yaml.load(file, Loader=yaml.FullLoader)
    api_key = config.get("OPENAI_API_KEY")

@app.route("/", methods=["GET", "POST"])
def index():
    data = None
    if request.method == "POST":
        doc = request.files['pdf_file']  
        doc_path = os.path.join(UPLOAD_PATH, "file.pdf")
        doc.save(doc_path)

        resume_text = read_file_from_path(doc_path)
        data_json = ats_extractor(resume_text)

        try:
            data = json.loads(data_json)
        except json.JSONDecodeError:
            data = {"error": "Unable to parse JSON response from OpenAI"}

    return render_template("index.html", data=data)

if __name__ == "__main__":
    app.run(debug=True)
