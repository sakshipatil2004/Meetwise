import os
import re
import json
import subprocess
from datetime import datetime

import spacy
import whisper
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Report
from app.services import pdf_generator


# ----------------------------
# Lazy-loaded models
# ----------------------------
_nlp = None
_summarizer = None
_summarizer_tokenizer = None
_summarizer_model = None
_whisper_model = None


def get_nlp_model():
    global _nlp
    if _nlp is None:
        _nlp = spacy.load("en_core_web_sm")
    return _nlp


def load_summarizer_model(model_name="philschmid/bart-large-cnn-samsum"):
    global _summarizer_model, _summarizer_tokenizer
    if _summarizer_model is None or _summarizer_tokenizer is None:
        _summarizer_tokenizer = AutoTokenizer.from_pretrained(model_name)
        _summarizer_model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    return _summarizer_model, _summarizer_tokenizer


def get_summarizer(model_name="philschmid/bart-large-cnn-samsum", device=-1):
    global _summarizer
    if _summarizer is None:
        model, tokenizer = load_summarizer_model(model_name)
        _summarizer = pipeline(
            "summarization",
            model=model,
            tokenizer=tokenizer,
            device=device
        )
    return _summarizer


def get_whisper_model(model_name="base"):
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = whisper.load_model(model_name)
    return _whisper_model


# ----------------------------
# Text Cleaning & Chunking
# ----------------------------
def clean_text(text: str) -> str:
    text = re.sub(r'\b(uh+|um+|ah+|er+)\b', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\s+', ' ', text)
    text = text.replace("…", ".").replace("..", ".")
    return text.strip()


def chunk_text(text: str, max_words: int = 600, overlap_words: int = 100):
    words = text.split()
    chunks = []
    for i in range(0, len(words), max_words - overlap_words):
        chunks.append(" ".join(words[i:i + max_words]))
    return chunks


# ----------------------------
# Summarization Logic
# ----------------------------
def generate_summary(text: str, device=-1):
    try:
        summarizer = get_summarizer(device=device)
        text = clean_text(text)

        if not text:
            return {"full_summary": "", "highlights": []}

        gen_args = {
            "max_length": 300,
            "min_length": 100,
            "do_sample": False,
            "temperature": 0.3,
            "num_beams": 4
        }

        result = summarizer(text, **gen_args)
        final_summary = result[0]["summary_text"].strip()

        # Highlights
        nlp = get_nlp_model()
        doc = nlp(text)

        highlights = []
        for sent in doc.sents:
            s = sent.text.strip()
            if 40 < len(s) < 140:
                if any(word in s.lower() for word in [
                    "decided", "plan", "action", "agreed", "update", "review"
                ]):
                    highlights.append(s)
            if len(highlights) >= 5:
                break

        return {"full_summary": final_summary, "highlights": highlights}

    except Exception as e:
        return {"full_summary": f"Error: {e}", "highlights": []}


# ----------------------------
# Task & Date Extraction
# ----------------------------
def extract_tasks(text):
    nlp = get_nlp_model()
    doc = nlp(text)

    tasks = []
    for sent in doc.sents:
        if any(word.lemma_.lower() in ["complete", "submit", "prepare", "review"]
               for word in sent):
            persons = [ent.text for ent in sent.ents if ent.label_ == "PERSON"]
            tasks.append({
                "task": sent.text.strip(),
                "person": persons[0] if persons else "Unassigned"
            })
    return tasks


def extract_dates(text):
    nlp = get_nlp_model()
    doc = nlp(text)

    dates = set(ent.text.strip() for ent in doc.ents if ent.label_ == "DATE")

    regex_dates = re.findall(
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
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
        return f"Error: {str(e)}"


# ----------------------------
# MAIN PIPELINE FUNCTION
# ----------------------------
def process_file_job(job_id: str, file_path: str, jobs: dict, user_id: int):
    try:
        jobs[job_id]["status"] = "processing"

        # Step 1: Transcription
        transcript = transcribe_audio(file_path)

        # Step 2: NLP Processing
        report = process_meeting_transcript(transcript)

        now = datetime.now()
        meeting_date_pdf = now.strftime("%d-%B-%Y")
        meeting_time = now.strftime("%I:%M %p")

        # Step 3: Generate PDF
        pdf_path = os.path.join("reports", f"meeting_{job_id}.pdf")

        pdf_generator.generate_pdf_report(
            file_path=pdf_path,
            report_title="Meeting Report",
            meeting_name="Meeting",
            meeting_date=meeting_date_pdf,
            meeting_time=meeting_time,
            summary=report["summary"],
            highlights=report["highlights"],
            tasks=report["tasks"],
            dates=report["dates"],
            participants=["Tony", "Tim", "Jason"]
        )

        # ----------------------------
        # Step 4: Parse Extracted Date Properly
        # ----------------------------
        meeting_date_obj = datetime.now()

        if report["dates"]:
            raw_date = report["dates"][0]

            # Remove st/nd/rd/th
            cleaned = re.sub(r'(st|nd|rd|th)', '', raw_date)

            # Try multiple formats
            for fmt in ("%d %B %Y", "%d %b %Y", "%d/%m/%Y", "%m/%d/%Y"):
                try:
                    meeting_date_obj = datetime.strptime(cleaned, fmt)
                    break
                except:
                    continue

        # ----------------------------
        # Step 5: Save to DB
        # ----------------------------
        db: Session = SessionLocal()
        try:
            new_report = Report(
                user_id=user_id,
                pdf_path=pdf_path,
                meeting_date=meeting_date_obj
            )

            db.add(new_report)
            db.commit()

        except:
            db.rollback()
            raise
        finally:
            db.close()

        jobs[job_id].update({
            "status": "done",
            "transcript": transcript,
            "report": report,
            "pdf": pdf_path
        })

    except Exception as e:
        jobs[job_id].update({
            "status": "error",
            "error": str(e)
        })