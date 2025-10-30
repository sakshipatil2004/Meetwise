import streamlit as st
import requests
import time
import os

BACKEND_URL = "http://localhost:8000"
UPLOAD_URL = f"{BACKEND_URL}/api/upload-audio"
JOB_URL = f"{BACKEND_URL}/api/job"

st.title("🎙️ Upload Meeting Audio")
st.write("Upload your meeting recording to generate a professional summary PDF report.")

uploaded_file = st.file_uploader("Select audio file", type=["mp3", "wav", "m4a", "mp4"])

if uploaded_file:
    st.info(f"Selected: {uploaded_file.name}")
    if st.button("Generate PDF Summary"):
        with st.spinner("Processing your file... Please wait ⏳"):
            try:
                files = {"file": (uploaded_file.name, uploaded_file, "multipart/form-data")}
                response = requests.post(UPLOAD_URL, files=files)

                if response.status_code not in [200, 202]:
                    st.error(f"Upload failed: {response.text}")
                else:
                    job_id = response.json()["job_id"]

                    for _ in range(60):  # Poll 5 min
                        time.sleep(5)
                        status_resp = requests.get(f"{JOB_URL}/{job_id}")
                        if status_resp.status_code != 200:
                            st.error("Failed to get job status.")
                            break
                        job = status_resp.json()
                        if job["status"] == "done" and job.get("pdf"):
                            pdf_filename = os.path.basename(job["pdf"])
                            pdf_url = f"{BACKEND_URL}/reports/{pdf_filename}"
                            st.success("✅ Summary PDF generated successfully!")
                            st.markdown(f"[📄 Download your report here]({pdf_url})", unsafe_allow_html=True)
                            break
                        elif job["status"] == "error":
                            st.error(f"Error: {job.get('error')}")
                            break
            except Exception as e:
                st.error(f"Unexpected error: {e}")
