import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [completed, setCompleted] = useState(false);

  // 🔐 Protect Route
  useEffect(() => {
    if (!user) navigate("/");
  }, []);

  // 🚀 Upload File
  const handleUpload = async () => {
    if (!file) return alert("Please select an audio file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setStatus("Uploading...");

      const response = await fetch(
        "http://127.0.0.1:8000/api/upload-audio",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      setJobId(data.job_id);
      setStatus("Processing...");
      pollStatus(data.job_id);
    } catch (err) {
      setStatus("Upload failed ❌");
      setLoading(false);
    }
  };

  // 🔄 Poll Job Status
  const pollStatus = (id) => {
    const interval = setInterval(async () => {
      const res = await fetch(
        `http://127.0.0.1:8000/api/job/${id}`
      );

      const data = await res.json();

      if (data.status === "done") {
        clearInterval(interval);
        setStatus("Report Ready ✅");
        setLoading(false);
        setCompleted(true);

        // 💾 Save Report History
        const oldReports =
          JSON.parse(localStorage.getItem("reports")) || [];

        oldReports.push({
          date: new Date(),
          jobId: id,
        });

        localStorage.setItem(
          "reports",
          JSON.stringify(oldReports)
        );
      }

      if (data.status === "error") {
        clearInterval(interval);
        setStatus("Processing failed ❌");
        setLoading(false);
      }
    }, 3000);
  };

  // 📥 Download PDF
  const downloadPDF = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/jobs/${jobId}/download`
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "Meeting_Report.pdf";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed ❌");
    }
  };

  return (
    <>
      <Navbar />

      <div style={styles.container}>
        {/* Upload Section */}
        <div style={styles.card}>
          <h1 style={styles.heading}>Upload Meeting Audio</h1>
          <p style={styles.subtitle}>
            Transform your meetings into AI-powered structured reports.
          </p>

          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={styles.fileInput}
          />

          <button
            onClick={handleUpload}
            style={styles.uploadBtn}
            disabled={loading}
          >
            {loading ? "Processing..." : "🚀 Generate Report"}
          </button>

          {status && (
            <p style={styles.statusText}>{status}</p>
          )}
        </div>

        {/* After Completion UI */}
        {completed && (
          <div style={styles.afterContainer}>
            <button
              onClick={downloadPDF}
              style={styles.downloadBtn}
            >
              ⬇ Download Meeting Report (PDF)
            </button>

            <div style={styles.dashboardBox}>
              <p style={styles.dashboardText}>
                Your meeting report has been successfully generated.
                <br />
                Visit the dashboard to review insights,
                summaries, and manage recent reports.
              </p>

              <button
                onClick={() => navigate("/dashboard")}
                style={styles.dashboardBtn}
              >
                📊 Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const styles = {
  container: {
    paddingTop: "110px",
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "110px 20px 40px",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "14px",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.38)",
    textAlign: "center",
  },
  heading: {
    marginBottom: "10px",
  },
  subtitle: {
    color: "#666",
    marginBottom: "20px",
  },
  fileInput: {
    marginTop: "20px",
  },
  uploadBtn: {
    marginTop: "20px",
    padding: "12px 28px",
    borderRadius: "8px",
    border: "none",
    background:
      "linear-gradient(135deg, #8a1e6f, #2564eb)",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  },
  statusText: {
    marginTop: "15px",
    fontWeight: "500",
  },
  afterContainer: {
    marginTop: "40px",
    textAlign: "center",
  },
  downloadBtn: {
    padding: "14px 30px",
    borderRadius: "8px",
    border: "none",
    background: "#16a34a",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "30px",
  },
  dashboardBox: {
    background: "white",
    padding: "30px",
    borderRadius: "14px",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.34)",
  },
  dashboardText: {
    color: "#444",
    marginBottom: "20px",
    lineHeight: "1.6",
  },
  dashboardBtn: {
    padding: "12px 26px",
    borderRadius: "8px",
    border: "none",
    background:
      "linear-gradient(135deg, #2564eb, #8a1e6f)",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Home;