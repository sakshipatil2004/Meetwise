# backend/pages/dashboard.py
import streamlit as st
import requests
import datetime

BACKEND_URL = "http://localhost:8000"

st.set_page_config(page_title="MeetWise Dashboard", layout="wide")

# ----------------------------
# Header
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
        }
        .header-title {
            font-size: 26px;
            font-weight: 800;
            color: #0D47A1;
        }
    </style>
    <div class="header">
        <div class="header-title">🎯 MeetWise Dashboard</div>
    </div>
""", unsafe_allow_html=True)

st.title("📊 Meeting Dashboard")

# ----------------------------
# Fetch Jobs from Backend
# ----------------------------
try:
    response = requests.get(f"{BACKEND_URL}/api/jobs")
    response.raise_for_status()
    jobs = response.json()
except Exception as e:
    st.error(f"Failed to fetch jobs: {e}")
    st.stop()

# ----------------------------
# Dashboard Cards
# ----------------------------
if not jobs:
    st.info("No uploaded meetings yet.")
else:
    for job_id, job_data in reversed(list(jobs.items())):
        if job_data.get("status") != "done":
            continue

        with st.container():
            st.markdown("""
                <div style="background-color:#F1F8E9;padding:20px;border-radius:12px;
                margin-bottom:15px;box-shadow:0 4px 8px rgba(0,0,0,0.05);">
            """, unsafe_allow_html=True)

            st.markdown(f"### 🎧 {job_data['file'].split('/')[-1]}")
            st.write(f"🕒 Processed on: {datetime.datetime.now().strftime('%d %B %Y, %I:%M %p')}")

            pdf_filename = job_data.get("pdf", "").split("/")[-1]
            pdf_url = f"{BACKEND_URL}/reports/{pdf_filename}"
            st.markdown(f"[📄 Download Summary PDF]({pdf_url})")

            # ✅ Fixed link to meeting.py with query param
            detail_url = f"/meeting?job_id={job_id}"
            st.markdown(f"[🔍 View Details]({detail_url})", unsafe_allow_html=True)

            st.markdown("</div>", unsafe_allow_html=True)
