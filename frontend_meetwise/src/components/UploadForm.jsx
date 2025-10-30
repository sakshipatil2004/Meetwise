// frontend/src/components/UploadForm.jsx
import React, { useState } from "react";
import axios from "axios";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(false);

  const backendUrl = "http://localhost:8000/api"; // update if deployed

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    setLoading(true);
    setJobData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${backendUrl}/upload-audio`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setJobId(res.data.job_id);
      pollJobStatus(res.data.job_id);
    } catch (err) {
      alert("Upload failed: " + err.message);
      setLoading(false);
    }
  };

  const pollJobStatus = async (id) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${backendUrl}/job/${id}`);
        if (res.data.status === "done" || res.data.status === "error") {
          clearInterval(interval);
          setJobData(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
        setLoading(false);
      }
    }, 3000);
  };

  const handleDownload = () => {
    if (!jobData || !jobData.pdf) return;
    // Force download
    const link = document.createElement("a");
    link.href = `http://localhost:8000/${jobData.pdf}`;
    link.download = jobData.pdf.split("/").pop();
    link.click();
  };

  return (
    <div className="upload-form">
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Upload & Summarize"}
      </button>

      {jobData && jobData.status === "done" && (
        <div className="summary-container">
          <h2>Meeting Summary</h2>
          <p><strong>Summary:</strong> {jobData.report.summary}</p>

          {jobData.report.highlights.length > 0 && (
            <>
              <h3>Highlights:</h3>
              <ul>
                {jobData.report.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </>
          )}

          {jobData.report.tasks.length > 0 && (
            <>
              <h3>Action Items:</h3>
              <ul>
                {jobData.report.tasks.map((t, i) => (
                  <li key={i}>{t.task} <strong>({t.person})</strong></li>
                ))}
              </ul>
            </>
          )}

          {jobData.report.dates.length > 0 && (
            <>
              <h3>Important Dates:</h3>
              <ul>
                {jobData.report.dates.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </>
          )}

          <button className="download-btn" onClick={handleDownload}>
            Download PDF
          </button>
        </div>
      )}

      {jobData && jobData.status === "error" && (
        <p className="error">Error: {jobData.error}</p>
      )}
    </div>
  );
}
