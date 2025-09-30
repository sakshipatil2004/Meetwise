import os
import re
import json
import subprocess
from datetime import datetime

import spacy
from transformers import pipeline
import whisper

from app.services import pdf_generator  # ensure this exists

# ----------------------------
# Lazy-loaded models
# ----------------------------

_nlp = None
_summarizer = None
_whisper_model = None

def get_nlp_model():
    global _nlp
    if _nlp is None:
        _nlp = spacy.load("en_core_web_sm")
    return _nlp

def get_summarizer():
    global _summarizer
    if _summarizer is None:
        _summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    return _summarizer

def get_whisper_model(model_name="base"):
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = whisper.load_model(model_name)
    return _whisper_model

# ----------------------------
# Core NLP functions
# ----------------------------

def generate_summary(text):
    try:
        summarizer = get_summarizer()
        nlp = get_nlp_model()
        
        max_chunk_size = 1000
        text_chunks = [text[i:i+max_chunk_size] for i in range(0, len(text), max_chunk_size)]
        summaries = [summarizer(chunk, max_length=200, min_length=50, do_sample=False)[0]['summary_text']
                     for chunk in text_chunks]

        full_summary = " ".join(summaries)
        highlights = [sent.text.strip() for sent in nlp(full_summary).sents][:5]

        return {"full_summary": full_summary, "highlights": highlights}

    except Exception as e:
        return {"full_summary": f"Error generating summary: {e}", "highlights": []}

def extract_tasks(text):
    nlp = get_nlp_model()
    doc = nlp(text)
    tasks = []

    for sent in doc.sents:
        if any(word.lemma_ in ["do", "complete", "finish", "submit", "prepare", "send", "review"] for word in sent):
            persons = [ent.text for ent in sent.ents if ent.label_ == "PERSON"]
            tasks.append({"task": sent.text.strip(), "person": persons[0] if persons else "Unassigned"})
    return tasks

def extract_dates(text):
    nlp = get_nlp_model()
    doc = nlp(text)
    dates = set(ent.text.strip() for ent in doc.ents if ent.label_ == "DATE")

    regex_dates = re.findall(
        r'\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4})\b',
        text
    )
    for d in regex_dates:
        dates.add(d.strip())

    return sorted(dates)

def process_meeting_transcript(transcript):
    summary_data = generate_summary(transcript)
    tasks = extract_tasks(transcript)
    dates = extract_dates(transcript)

    return {
        "summary": summary_data["full_summary"],
        "highlights": summary_data["highlights"],
        "tasks": tasks,
        "dates": dates
    }

# ----------------------------
# Audio Processing
# ----------------------------

def transcribe_audio(file_path: str) -> str:
    try:
        model = get_whisper_model()
        result = model.transcribe(file_path)
        return result.get("text", "")
    except Exception as e:
        return f"Error in transcription: {str(e)}"

def get_audio_duration(file_path: str) -> float:
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", file_path],
            capture_output=True, text=True
        )
        return float(json.loads(result.stdout)["format"]["duration"])
    except Exception as e:
        print(f"Error getting audio duration: {e}")
        return 0

def calculate_timeout(file_path: str) -> int:
    duration = get_audio_duration(file_path)
    if duration == 0:
        return 60
    timeout = int(duration * 2)
    return max(30, min(timeout, 3600))

# ----------------------------
# Background Job
# ----------------------------

def process_file_job(job_id: str, file_path: str, jobs: dict):
    try:
        jobs[job_id]["status"] = "processing"
        jobs[job_id]["timeout"] = calculate_timeout(file_path)

        # Transcription
        transcript = transcribe_audio(file_path)

        # Transcript processing
        report = process_meeting_transcript(transcript)

        # Metadata
        meeting_name = os.path.basename(file_path)
        meeting_date = datetime.now().strftime("%d-%b-%Y %H:%M")

        # PDF generation
        pdf_path = os.path.join("reports", f"meeting_{job_id}.pdf")
        os.makedirs("reports", exist_ok=True)
        pdf_generator.generate_pdf_report(
            file_path=pdf_path,
            report_title="Meeting Summary Report",
            meeting_name=meeting_name,
            meeting_date=meeting_date,
            summary=report["summary"],
            highlights=report["highlights"],
            tasks=report["tasks"],
            dates=report["dates"]
        )

        # Update jobs dict
        jobs[job_id].update({
            "status": "done",
            "transcript": transcript,
            "report": report,
            "pdf": pdf_path
        })

    except Exception as e:
        jobs[job_id].update({"status": "error", "error": str(e)})
