import os
import re
import json
import subprocess
from datetime import datetime
import spacy
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import whisper

from app.services import pdf_generator  # make sure this path is correct


# ----------------------------
# Lazy-loaded models
# ----------------------------
_nlp = None
_summarizer = None
_summarizer_tokenizer = None
_summarizer_model = None
_whisper_model = None


def get_nlp_model():
    """Load and cache SpaCy English model."""
    global _nlp
    if _nlp is None:
        _nlp = spacy.load("en_core_web_sm")
    return _nlp


def load_summarizer_model(model_name="philschmid/bart-large-cnn-samsum"):
    """Load abstractive summarization model."""
    global _summarizer_model, _summarizer_tokenizer
    if _summarizer_model is None or _summarizer_tokenizer is None:
        _summarizer_tokenizer = AutoTokenizer.from_pretrained(model_name)
        _summarizer_model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    return _summarizer_model, _summarizer_tokenizer


def get_summarizer(model_name="philschmid/bart-large-cnn-samsum", device=-1):
    """Create summarization pipeline if not already loaded."""
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
    """Load Whisper model for audio transcription."""
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


def chunk_text(text: str, max_words: int = 600, overlap_words: int = 100) -> list[str]:
    words = text.split()
    chunks = []
    for i in range(0, len(words), max_words - overlap_words):
        chunks.append(" ".join(words[i:i + max_words]))
    return chunks


# ----------------------------
# Summarization Logic
# ----------------------------
def generate_summary(
    text: str,
    model_name="philschmid/bart-large-cnn-samsum",
    device=-1,
    precision_mode=True
) -> dict:
    try:
        summarizer = get_summarizer(model_name=model_name, device=device)
        tokenizer = summarizer.tokenizer

        text = clean_text(text)
        if not text:
            return {"full_summary": "", "highlights": []}

        word_count = len(text.split())
        gen_args = {
            "max_length": 300,
            "min_length": 100,
            "do_sample": not precision_mode,
            "temperature": 0.3 if precision_mode else 0.7,
            "num_beams": 4 if precision_mode else 2
        }

        # Summarize
        if word_count < 800:
            result = summarizer(text, **gen_args)
            final_summary = result[0]["summary_text"].strip()
        else:
            chunks = chunk_text(text)
            chunk_summaries = []
            for chunk in chunks:
                result = summarizer(chunk, **gen_args)
                chunk_summaries.append(result[0]["summary_text"].strip())
            combined_text = " ".join(chunk_summaries)
            token_count = len(tokenizer.encode(combined_text))
            if token_count > 1024:
                final_result = summarizer(
                    combined_text,
                    max_length=350,
                    min_length=150,
                    do_sample=False,
                    temperature=0.3,
                    num_beams=5
                )
                final_summary = final_result[0]["summary_text"].strip()
            else:
                final_summary = combined_text

        # -------------------
        # Improved Highlights
        # -------------------
        nlp = get_nlp_model()
        doc = nlp(text)

        highlights = []
        for sent in doc.sents:
            s = sent.text.strip()
            # Pick short, meaningful, distinct sentences
            if 40 < len(s) < 140 and not any(s in h for h in highlights):
                if any(keyword in s.lower() for keyword in [
                    "discuss", "decided", "plan", "action",
                    "focus", "agreed", "update", "review", "prepare"
                ]):
                    highlights.append(s)
            if len(highlights) >= 5:
                break

        return {"full_summary": final_summary, "highlights": highlights}

    except Exception as e:
        return {"full_summary": f"Error generating summary: {e}", "highlights": []}


# ----------------------------
# Task & Date Extraction
# ----------------------------
def extract_tasks(text):
    nlp = get_nlp_model()
    doc = nlp(text)
    tasks = []
    for sent in doc.sents:
        if any(word.lemma_.lower() in ["do", "complete", "finish", "submit", "prepare", "send", "review"]
               for word in sent):
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
# Audio / Transcription
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
        return 0.0


def calculate_timeout(file_path: str) -> int:
    duration = get_audio_duration(file_path)
    if duration <= 0:
        return 60
    timeout = int(duration * 2)
    return max(30, min(timeout, 3600))


def process_file_job(job_id: str, file_path: str, jobs: dict):
    """End-to-end pipeline: transcribe → summarize → extract info → generate PDF."""
    try:
        jobs[job_id]["status"] = "processing"
        jobs[job_id]["timeout"] = calculate_timeout(file_path)

        transcript = transcribe_audio(file_path)
        report = process_meeting_transcript(transcript)

        # --------------------
        # Clean meeting name
        # --------------------
        raw_name = os.path.splitext(os.path.basename(file_path))[0]
        meeting_name = re.sub(r'^[a-f0-9]+_', '', raw_name)  # remove any random hash prefix

        now = datetime.now()
        meeting_date = now.strftime("%d-%B-%Y")
        meeting_time = now.strftime("%I:%M %p")

        pdf_path = os.path.join("reports", f"meeting_{job_id}.pdf")
        os.makedirs(os.path.dirname(pdf_path), exist_ok=True)

        pdf_generator.generate_pdf_report(
            file_path=pdf_path,
            report_title=meeting_name,
            meeting_name=meeting_name,
            meeting_date=meeting_date,
            meeting_time=meeting_time,
            summary=report["summary"],
            highlights=report["highlights"],
            tasks=report["tasks"],
            dates=report["dates"],
            participants=["Tony", "Tim", "Jason", "Carrie", "Melinda"]  # Example participant names
        )

        jobs[job_id].update({
            "status": "done",
            "transcript": transcript,
            "report": report,
            "pdf": pdf_path
        })
    except Exception as e:
        jobs[job_id].update({"status": "error", "error": str(e)})
