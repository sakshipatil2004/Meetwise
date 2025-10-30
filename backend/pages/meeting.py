import streamlit as st
import requests
import datetime
import pandas as pd
from streamlit_calendar import calendar  # ✅ interactive calendar

BACKEND_URL = "http://localhost:8000"

st.set_page_config(page_title="Meeting Details", layout="wide")

# ----------------------------
# Get job_id from query params
# ----------------------------
query_params = st.query_params.to_dict()
if "job_id" not in query_params:
    st.error("No meeting selected.")
    st.stop()

job_id = query_params["job_id"]

# ----------------------------
# Fetch job data
# ----------------------------
try:
    resp = requests.get(f"{BACKEND_URL}/api/job/{job_id}")
    resp.raise_for_status()
    job = resp.json()
except Exception as e:
    st.error(f"Failed to fetch meeting details: {e}")
    st.stop()

# ----------------------------
# Header Section
# ----------------------------
st.markdown("""
    <style>
        .header {
            background-color: #E3F2FD;
            padding: 15px 30px;
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0px 4px 10px rgba(0,0,0,0.1);
            width: 100%;
        }
        .header-title {
            font-size: 28px;
            font-weight: 900;
            color: #0D47A1;
        }
    </style>
    <div class="header">
        <div class="header-title">📋 Meeting Summary</div>
    </div>
""", unsafe_allow_html=True)

# ----------------------------
# Meeting Info
# ----------------------------
st.markdown(f"### 🎧 {job['file'].split('/')[-1]}")
st.write(f"🕒 Processed on: {datetime.datetime.now().strftime('%d %B %Y, %I:%M %p')}")

pdf_filename = job.get("pdf", "").split("/")[-1]
pdf_url = f"{BACKEND_URL}/reports/{pdf_filename}"

st.markdown(f"[📄 Download Summary PDF]({pdf_url})")

# ----------------------------
# Calendar + Tasks
# ----------------------------
report = job.get("report", {})
dates = report.get("dates", [])
tasks = report.get("tasks", [])

st.subheader("🗓️ Important Dates & Tasks")

events = []

# Match tasks to detected dates
if isinstance(tasks, list) and len(tasks) > 0 and isinstance(dates, list):
    for i, d in enumerate(dates):
        parsed_date = pd.to_datetime(d, errors="coerce")
        if not pd.isnull(parsed_date):
            event_title = tasks[i]["task"] if i < len(tasks) and isinstance(tasks[i], dict) else f"Task {i+1}"
            events.append({
                "title": event_title,
                "start": parsed_date.strftime("%Y-%m-%d"),
                "end": parsed_date.strftime("%Y-%m-%d"),
            })

if not events:
    st.info("No specific valid dates detected for this meeting.")
else:
    # Configure calendar
    calendar_options = {
        "initialView": "dayGridMonth",
        "editable": False,
        "selectable": False,
        "height": 650,
        "headerToolbar": {
            "left": "prev,next today",
            "center": "title",
            "right": "dayGridMonth,timeGridWeek,listMonth"
        },
        "eventDisplay": "block",
    }

    calendar(
        events=events,
        options=calendar_options,
        custom_css="""
            .fc-event {
                background-color: #1976D2 !important;
                border: none !important;
                color: white !important;
                border-radius: 6px;
                padding: 2px;
            }
            .fc-daygrid-day:hover {
                background-color: #E3F2FD !important;
                cursor: pointer;
            }
        """
    )

# ----------------------------
# Show Tasks Below
# ----------------------------
st.subheader("📝 All Tasks Mentioned")
if not tasks:
    st.info("No specific tasks detected.")
else:
    for task in tasks:
        st.write(f"- {task.get('task', 'No description available.')}")
