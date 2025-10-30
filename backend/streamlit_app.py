# backend/streamlit_app.py
import streamlit as st
import requests
import time
import os

# -------------------------------
# CONFIG
# -------------------------------
BACKEND_URL = "http://localhost:8000"
UPLOAD_URL = f"{BACKEND_URL}/api/upload-audio"
JOB_URL = f"{BACKEND_URL}/api/job"

st.set_page_config(
    page_title="MeetWise | AI Meeting Summary Assistant",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# -------------------------------
# GLOBAL HEADER (sky blue)
# -------------------------------
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
        .header-links a {
            margin-left: 20px;
            font-weight: 600;
            color: #0D47A1;
            text-decoration: none;
        }
        .header-links a:hover {
            text-decoration: underline;
        }
    </style>
    <div class="header">
        <div class="header-title">🎯 MeetWise</div>
        <div class="header-links">
            <a href="/">Home</a>
            <a href="/#dashboard">Dashboard</a>
            <a href="#">Policy</a>
            <a href="#">Contact Us</a>
            <a href="#">Profile</a>
        </div>
    </div>
""", unsafe_allow_html=True)

# -------------------------------
# MAIN PAGE
# -------------------------------
st.markdown("""
    <style>
        .main-title {
            text-align: center;
            font-size: 48px;
            font-weight: 800;
            color: #0D47A1;
            margin-top: 40px;
        }
        .sub-text {
            text-align: center;
            font-size: 18px;
            color: #555;
        }
        .upload-section {
            background-color: #f8f9fa;
            border-radius: 15px;
            padding: 25px;
            margin-top: 25px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
    </style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-title">MeetWise — AI Meeting Summary Assistant</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-text">Upload your meeting audio and get an automatically generated summary with calendar insights</div>', unsafe_allow_html=True)

st.markdown("---")

# -------------------------------
# FILE UPLOAD SECTION
# -------------------------------
with st.container():
    st.markdown('<div class="upload-section">', unsafe_allow_html=True)
    st.subheader("🎤 Upload Meeting Audio")

    uploaded_file = st.file_uploader("Upload your meeting audio", type=["mp3", "wav", "m4a", "mp4"])
    if uploaded_file:
        st.info(f"File selected: {uploaded_file.name}")
        if st.button("Generate Summary PDF"):
            with st.spinner("Processing your meeting... Please wait ⏳"):
                try:
                    files = {"file": (uploaded_file.name, uploaded_file, "multipart/form-data")}
                    response = requests.post(UPLOAD_URL, files=files)

                    if response.status_code not in [200, 202]:
                        st.error(f"Upload failed: {response.text}")
                    else:
                        data = response.json()
                        job_id = data["job_id"]

                        # Poll backend
                        for _ in range(60):
                            time.sleep(5)
                            status_resp = requests.get(f"{JOB_URL}/{job_id}")
                            if status_resp.status_code != 200:
                                st.error("Failed to get job status.")
                                break

                            job = status_resp.json()
                            if job["status"] == "done" and job.get("pdf"):
                                st.success("✅ Your PDF is ready!")
                                pdf_filename = os.path.basename(job["pdf"])
                                pdf_url = f"{BACKEND_URL}/reports/{pdf_filename}"
                                st.markdown(f"[📄 Download your summary PDF]({pdf_url})", unsafe_allow_html=True)
                                break
                            elif job["status"] == "error":
                                st.error(f"Processing failed: {job.get('error')}")
                                break
                        else:
                            st.warning("Processing taking longer than expected. Try again later.")
                except Exception as e:
                    st.error(f"Error: {e}")
    st.markdown('</div>', unsafe_allow_html=True)

st.markdown("---")
st.page_link("pages/dashboard.py", label="📊 Go to Dashboard", icon="📈")
