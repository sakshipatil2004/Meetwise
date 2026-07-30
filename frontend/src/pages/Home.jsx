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
    formData.append("user_id", user.id);

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

        // DO NOT overwrite current user localstorage heavily just set it back correctly
        localStorage.setItem("user", JSON.stringify({
          id: user.id || data.id,
          name: user.name || data.name,
          email: user.email || data.email
        }));
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
    <div className="animated-bg" style={{ minHeight: "100vh" }}>
      <Navbar />

      <div style={styles.container}>
        {/* Animated Background Elements */}
        <div className="blobs">
            <div style={{...styles.blob, top: '15%', left: '10%', background: '#41005b', animationDelay: '0s'}}></div>
            <div style={{...styles.blob, bottom: '20%', right: '5%', background: '#4c1c62', animationDelay: '2s', width: '400px', height: '400px'}}></div>
            <div style={{...styles.blob, top: '45%', left: '45%', background: '#a875ff', animationDelay: '4s', width: '250px', height: '250px', filter: 'blur(130px)', opacity: 0.2}}></div>
        </div>

        {/* Dynamic Card Container Switch based on Completion */}
        <div className="glossy-glass-card" style={styles.card}>
            <div className="gloss-sweep"></div>
            
            {!completed ? (
                <div style={{ position: 'relative', zIndex: 5, width: '100%' }}>
                    <div style={styles.iconWrapper} className="glow-pulse">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20"></path>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    
                    <h1 style={styles.heading}>Upload Meeting Audio</h1>
                    <p style={styles.subtitle}>
                        Transform your generic meeting recordings into completely structured AI-powered reports.
                    </p>

                    <div style={styles.fileDropArea}>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => setFile(e.target.files[0])}
                            style={styles.fileInput}
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="drop-zone-label" style={{...styles.fileLabel, borderColor: file ? '#e5bfff' : 'rgba(255,255,255,0.2)'}}>
                            {file ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div className="success-pulse" style={{ marginBottom: '12px' }}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e5bfff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 18l6-6-6-6"></path>
                                        </svg>
                                    </div>
                                    <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '15px' }}>{file.name}</span>
                                    <span style={{ fontSize: '12px', marginTop: '4px', opacity: 0.6 }}>Ready to process</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.8 }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: "12px"}}>
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Drop an audio file or click to browse</span>
                                    <span style={{ fontSize: '12px', marginTop: '6px', opacity: 0.6 }}>Supports MP3, WAV, M4A</span>
                                </div>
                            )}
                        </label>
                    </div>

                    <button
                        onClick={handleUpload}
                        className="glossy-button upload-btn"
                        style={styles.uploadBtn}
                        disabled={loading}
                    >
                        {loading ? (
                            <span style={{display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center'}}>
                                <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                                    <line x1="12" y1="2" x2="12" y2="6"></line>
                                    <line x1="12" y1="18" x2="12" y2="22"></line>
                                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                                    <line x1="2" y1="12" x2="6" y2="12"></line>
                                    <line x1="18" y1="12" x2="22" y2="12"></line>
                                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                                </svg>
                                Processing Audio...
                            </span>
                        ) : "Generate AI Report"}
                        <div className="btn-glow"></div>
                    </button>

                    <div style={{ minHeight: '30px', marginTop: '20px' }}>
                        {status && (
                            <p className="status-fade-in" style={{
                                ...styles.statusText, 
                                color: status.includes("❌") ? "#ffcccc" : status.includes("✅") ? "#e5bfff" : "rgba(255,255,255,0.9)",
                                background: status.includes("❌") ? "rgba(255, 77, 77, 0.2)" : status.includes("✅") ? "rgba(229, 191, 255, 0.15)" : "rgba(255, 255, 255, 0.1)",
                                border: status.includes("❌") ? "1px solid rgba(255, 77, 77, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)"
                            }}>
                                {status}
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{ position: 'relative', zIndex: 5, width: '100%', animation: "slideInUp 0.6s forwards" }}>
                    <div style={styles.successIconWrapper}>
                        <div className="success-pulse"></div>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{position: 'relative', zIndex: 2}}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>

                    <h1 style={styles.heading}>Report Completed!</h1>
                    <p style={styles.subtitle}>
                        Your AI processing is finished. You can now download your report or check deeper insights in your dashboard.
                    </p>

                    <div style={styles.actionContainer}>
                        <button
                            onClick={downloadPDF}
                            className="glossy-button-secondary"
                            style={styles.downloadBtn}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download PDF
                        </button>

                        <button
                            onClick={() => navigate("/dashboard")}
                            className="glossy-button upload-btn"
                            style={styles.dashboardBtn}
                        >
                            Go to Dashboard
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '8px'}}>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      <style>
        {`
            /* Fluid background animation matching auth pages */
            @keyframes bgFlow {
                0% { background-position: 0% 50%; opacity: 0.9; }
                50% { background-position: 100% 50%; opacity: 1; }
                100% { background-position: 0% 50%; opacity: 0.9; }
            }

            .animated-bg {
                background: linear-gradient(-45deg, #15001c, #2f0042, #230030, #38004f);
                background-size: 300% 300%;
                animation: bgFlow 12s ease infinite alternate;
            }

            @keyframes float {
                0% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0.6; }
                50% { transform: translateY(-40px) scale(1.08) rotate(5deg); opacity: 0.85; }
                100% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0.6; }
            }

            @keyframes slideInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @keyframes glossAnimation {
                0% { transform: translateX(-150%) skewX(-45deg); opacity: 0; }
                40% { transform: translateX(150%) skewX(-45deg); opacity: 0.6; }
                100% { transform: translateX(150%) skewX(-45deg); opacity: 0; }
            }

            @keyframes pulseGlow {
                0% { box-shadow: 0 0 10px rgba(229, 191, 255, 0.4); }
                50% { box-shadow: 0 0 25px rgba(229, 191, 255, 0.8); }
                100% { box-shadow: 0 0 10px rgba(229, 191, 255, 0.4); }
            }
            
            @keyframes spin {
                100% { transform: rotate(360deg); }
            }

            .blobs div {
                position: fixed;
                animation: float 8s ease-in-out infinite alternate;
            }

            /* Main Premium Glossy Card (Same as Auth UI) */
            .glossy-glass-card {
                background: linear-gradient(135deg, rgba(93, 35, 120, 0.7) 0%, rgba(76, 28, 98, 0.45) 100%);
                backdrop-filter: blur(28px);
                -webkit-backdrop-filter: blur(28px);
                border-radius: 24px;
                
                /* Strong glossy highlight borders */
                border-top: 1.5px solid rgba(255, 255, 255, 0.45);
                border-left: 1.5px solid rgba(255, 255, 255, 0.25);
                border-right: 0.5px solid rgba(255, 255, 255, 0.08);
                border-bottom: 0.5px solid rgba(255, 255, 255, 0.08);
                
                /* Deep shadow */
                box-shadow: 0 35px 60px rgba(0, 0, 0, 0.6), 
                            inset 0 0 50px rgba(255, 255, 255, 0.1);
                            
                position: relative;
                z-index: 10;
                overflow: hidden;
                animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }

            .gloss-sweep {
                position: absolute;
                top: 0;
                left: -50%;
                width: 50%;
                height: 100%;
                background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
                transform: skewX(-45deg);
                animation: glossAnimation 7s infinite ease-in-out;
                pointer-events: none;
                z-index: 1;
            }

            /* Icon Styling */
            .glow-pulse {
                box-shadow: 0 0 20px rgba(229, 191, 255, 0.3), inset 0 0 15px rgba(229, 191, 255, 0.2);
            }
            
            /* Dropzone interactions */
            .drop-zone-label {
                transition: all 0.3s ease;
            }
            .drop-zone-label:hover {
                background: rgba(229, 191, 255, 0.05) !important;
                border-color: rgba(229, 191, 255, 0.5) !important;
                transform: translateY(-2px);
            }

            /* Vibrant main upload button matching Auth buttons */
            .glossy-button {
                background: linear-gradient(135deg, #a875ff 0%, #e5bfff 100%);
                color: #230030 !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
                border: none;
                border-top: 1px solid rgba(255, 255, 255, 0.6) !important;
                animation: pulseGlow 3s infinite alternate;
                font-family: inherit;
            }
            
            .glossy-button::after {
                content: '';
                position: absolute;
                top: 0; left: -100%;
                width: 50%; height: 100%;
                background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%);
                transform: skewX(-20deg);
                transition: all 0.5s ease;
                z-index: 1;
            }
            
            .glossy-button:hover:not(:disabled) {
                transform: translateY(-3px);
                box-shadow: 0 10px 20px rgba(229, 191, 255, 0.5);
            }
            
            .glossy-button:hover::after {
                left: 150%;
            }
            
            .glossy-button:disabled {
                opacity: 0.7;
                cursor: not-allowed;
                animation: none;
            }

            /* Secondary stylish button for Download */
            .glossy-button-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: #ffffff;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-top: 1px solid rgba(255, 255, 255, 0.4);
                backdrop-filter: blur(10px);
                font-family: inherit;
                position: relative;
                overflow: hidden;
            }

            .glossy-button-secondary:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-2px);
                box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
            }

            .status-fade-in {
                animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }

            .success-pulse {
                position: absolute;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                width: 100%; height: 100%;
                border-radius: 50%;
                background: #e5bfff;
                opacity: 0.2;
                animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            }

            @keyframes ping {
                75%, 100% {
                    transform: translate(-50%, -50%) scale(2);
                    opacity: 0;
                }
            }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    paddingTop: "120px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 120px)",
    padding: "120px 20px 60px",
    position: "relative",
    fontFamily: "'Inter', sans-serif"
  },
  blob: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    filter: 'blur(90px)',
    zIndex: 0,
  },
  card: {
    padding: "50px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: "580px",
    boxSizing: "border-box"
  },
  iconWrapper: {
    width: "72px",
    height: "72px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, rgba(168, 117, 255, 0.2), rgba(229, 191, 255, 0.1))",
    border: "1px solid rgba(229, 191, 255, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    color: "#e5bfff"
  },
  successIconWrapper: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #a875ff, #e5bfff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    color: "#230030",
    position: "relative"
  },
  heading: {
    margin: "0 0 12px 0",
    fontSize: "32px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #ffffff, #e5bfff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 4px 15px rgba(229, 191, 255, 0.2)"
  },
  subtitle: {
    color: "rgba(255,255,255,0.75)",
    marginBottom: "36px",
    fontSize: "15px",
    lineHeight: "1.6",
    maxWidth: "85%",
    margin: "0 auto 36px"
  },
  fileDropArea: {
    position: "relative",
    width: "100%",
    marginBottom: "28px",
  },
  fileInput: {
    opacity: 0,
    width: "0.1px",
    height: "0.1px",
    position: "absolute",
  },
  fileLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    background: "rgba(0, 0, 0, 0.2)",
    border: "2px dashed rgba(255, 255, 255, 0.2)",
    borderRadius: "16px",
    cursor: "pointer",
    color: "rgba(255,255,255,0.8)",
  },
  actionContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "100%",
    maxWidth: "340px",
    margin: "0 auto"
  },
  uploadBtn: {
    width: "100%",
    padding: "16px 28px",
    fontSize: "16px",
    fontWeight: "700",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    position: "relative"
  },
  downloadBtn: {
    width: "100%",
    padding: "16px 28px",
    fontSize: "15px",
    fontWeight: "600",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  dashboardBtn: {
    width: "100%",
    padding: "16px 28px",
    fontSize: "15px",
    fontWeight: "700",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    margin: 0,
    fontWeight: "500",
    fontSize: "14px",
    padding: "10px 20px",
    borderRadius: "8px",
    display: "inline-block",
  },
};

export default Home;