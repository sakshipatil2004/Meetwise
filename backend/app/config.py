# backend/app/config.py
import os
from dotenv import load_dotenv

load_dotenv()  # loads .env in backend root if exists

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
