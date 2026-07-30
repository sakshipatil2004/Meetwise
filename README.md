<div align="center">

# 🎙️ MeetWise
### AI-Powered Meeting Summarization & Task Management System

Automatically transcribe meetings, generate AI-powered summaries, extract action items, detect important dates, analyze sentiment, and generate professional PDF reports — all in one platform.

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)
![Whisper](https://img.shields.io/badge/OpenAI-Whisper-black)
![Transformers](https://img.shields.io/badge/HuggingFace-Transformers-yellow)
![SpaCy](https://img.shields.io/badge/SpaCy-NLP-09A3D5)
![License](https://img.shields.io/badge/License-Educational-green)

</div>

---

# 📖 Overview

MeetWise is an AI-powered web application developed to automate meeting documentation and task management. Instead of manually writing meeting minutes, users can upload an audio recording and receive a structured report containing:

- Meeting transcription
- AI-generated summary
- Key highlights
- Action items
- Responsible person
- Important dates
- Sentiment overview
- Professional PDF report
- Calendar-based task tracking

The system combines Speech-to-Text, Natural Language Processing, Transformer-based summarization, and PDF generation into one seamless workflow.

---

# ✨ Key Features

- 🎤 Audio Upload
- 📝 Speech-to-Text using OpenAI Whisper
- 🤖 AI Meeting Summarization
- 📌 Automatic Action Item Extraction
- 👤 Responsible Person Detection
- 📅 Important Date Extraction
- 😊 Meeting Sentiment Analysis
- 📄 Professional PDF Report Generation
- 📆 Calendar Integration for Tasks
- ⚡ Fast & Responsive Interface
- 🌐 Modern React Dashboard

---

# 🖥️ Screenshots

---

## Login Page

<img src="c:\Users\ACER\OneDrive\Pictures\Screenshots\Screenshot 2026-04-22 233804.png" width="900">

---

## Home Page

<img src="c:\Users\ACER\OneDrive\Pictures\Screenshots\Screenshot 2026-04-22 232727.png" width="900">

---

## Meeting Dashboard

<img src="c:\Users\ACER\OneDrive\Pictures\Screenshots\Screenshot 2026-04-22 233200.png" width="900">

---

## Calendar View

<img src="c:\Users\ACER\OneDrive\Pictures\Screenshots\Screenshot 2026-04-22 233218.png" width="900">

---

## Generated PDF Report

<img src="c:\Users\ACER\OneDrive\Pictures\Screenshots\Screenshot 2026-04-22 233305.png" width="900">

---

# ⚙️ How It Works

```text
                Audio File
                     │
                     ▼
        OpenAI Whisper Speech-to-Text
                     │
                     ▼
             Meeting Transcript
                     │
     ┌───────────────┼────────────────┐
     ▼               ▼                ▼
Transformer      SpaCy NLP      TextBlob
Summary         Extraction      Sentiment
     │               │                │
     └───────────────┼────────────────┘
                     ▼
        Structured Meeting Information
                     │
                     ▼
          Professional PDF Report
                     │
                     ▼
          Calendar & Dashboard View
```

---

# 🏗️ System Architecture

```
Frontend (React + Vite)
        │
Axios API Requests
        │
Backend (FastAPI / Flask)
        │
──────────────────────────────────────────
│           │           │               │
Whisper   BART      SpaCy NLP     TextBlob
│           │           │               │
Speech    Summary    Tasks & Dates  Sentiment
        │
        ▼
ReportLab PDF Generator
        │
        ▼
Meeting Report
```

---

# 🧠 AI Models & Libraries Used

| Component | Technology |
|------------|------------|
| Speech-to-Text | OpenAI Whisper |
| Summarization | Facebook BART Large CNN |
| NLP Processing | SpaCy |
| Sentiment Analysis | TextBlob |
| PDF Generation | ReportLab |
| Backend | Python + FastAPI / Flask |
| Frontend | React + Vite |
| Styling | CSS |
| API Communication | Axios |
| Deep Learning | PyTorch |
| Transformer Framework | Hugging Face Transformers |
| Audio Processing | FFmpeg |

---

# 📂 Project Structure

```
MeetWise/
│
├── backend/
│   ├── app.py
│   ├── processor.py
│   ├── requirements.txt
│   ├── uploads/
│   ├── reports/
│   ├── services/
│   │     └── pdf_generator.py
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── screenshots/
│   ├── home.png
│   ├── upload.png
│   ├── dashboard.png
│   ├── calendar.png
│   └── pdf-report.png
│
├── README.md
├── .gitignore
└── .env.example
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/MeetWise.git

cd MeetWise
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt
```

Download SpaCy model

```bash
python -m spacy download en_core_web_sm
```

Run Backend

```bash
python app.py
```

or

```bash
uvicorn main:app --reload
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Open

```
http://localhost:5173
```

---

# 📄 Generated Meeting Report

The generated report includes:

- Executive Summary
- Key Highlights
- Action Items
- Responsible Person
- Important Dates
- Sentiment Overview
- Meeting Metadata
- PDF Download

---

# 💻 Technology Stack

### Frontend

- React.js
- Vite
- JavaScript
- HTML
- CSS
- Axios

### Backend

- Python
- FastAPI / Flask

### Artificial Intelligence

- OpenAI Whisper
- Hugging Face Transformers
- Facebook BART
- SpaCy
- TextBlob

### Database

- Local Storage / JSON (or update this if you use a database)

### Other Tools

- ReportLab
- FFmpeg
- PyTorch
- Git
- VS Code

---

# 📈 Future Enhancements

- 🎙️ Real-time Meeting Transcription
- 👥 Automatic Speaker Identification (Speaker Diarization)
- 🌍 Multi-language Support
- 📧 Email Notifications for Assigned Tasks
- ☁️ Cloud Deployment
- 🔐 User Authentication & Role Management
- 📊 Meeting Analytics Dashboard
- 🤖 AI Chat Assistant for Meeting Queries
- 📱 Mobile Application
- 🔗 Integration with Google Calendar
- 🔗 Integration with Microsoft Outlook
- 🔗 Zoom & Google Meet API Integration
- 📝 Editable AI-generated Meeting Minutes
- 📤 One-click Report Sharing

---

# 🎯 Learning Outcomes

This project demonstrates practical implementation of:

- Artificial Intelligence
- Natural Language Processing
- Speech Recognition
- Transformer Models
- REST APIs
- Web Development
- PDF Report Generation
- Calendar Integration
- Task Extraction
- Sentiment Analysis

---

# 👩‍💻 Developed By

**Sakshi Patil, Saloni Sutar and Maitree Pimple**

Bachelor of Engineering

Artificial Intelligence & Data Science

---

# 📜 License

This project has been developed for academic and educational purposes as a Final Year Engineering Project.

---

<div align="center">

⭐ If you found this project interesting, consider giving it a star!

</div>