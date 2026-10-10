import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from google import genai

load_dotenv()

app = Flask(__name__)
CORS(app)

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None


@app.post("/api/assistant")
def assistant():
    if not client:
        return jsonify({"error": "GEMINI_API_KEY is not configured."}), 500

    data = request.get_json(silent=True) or {}
    question = str(data.get("message", "")).strip()

    if not question:
        return jsonify({"error": "Please enter a question."}), 400

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=(
                "You are CampusPulse AI, a student success assistant. "
                "Help with academic analytics, exam planning, study schedules, "
                "resumes and mock interviews. Do not invent student records. "
                "Use only student data explicitly provided in the question. "
                "If information is missing, ask for it.\n\n"
                f"Student question: {question}"
            )
        )
        return jsonify({"reply": response.text or "No response was generated."})
    except Exception:
        app.logger.exception("Gemini request failed")
        return jsonify({
            "error": "The AI request failed. Check the API key, model access, quota, and server logs."
        }), 502


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)