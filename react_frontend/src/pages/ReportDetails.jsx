import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const ReportDetails = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [report, setReport] = useState(null);
    const [selectedDayTasks, setSelectedDayTasks] = useState([]);
    
    // ✅ EMAIL STATES
    const [recipientEmail, setRecipientEmail] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!user) navigate("/");
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            const res = await fetch(
                `http://127.0.0.1:8000/api/reports/detail/${reportId}`
            );

            const data = await res.json();

            if (typeof data.tasks === "string") {
                data.tasks = JSON.parse(data.tasks);
            }

            if (typeof data.dates === "string") {
                data.dates = JSON.parse(data.dates);
            }

            setReport(data);
        } catch (err) {
            console.error("Failed to fetch report", err);
        }
    };

    const highlightedDates =
        report?.dates?.map((dateStr) => {
            const parsed = new Date(dateStr);
            return isNaN(parsed) ? null : parsed;
        }) || [];

    // ✅ EMAIL FUNCTION
    const handleSendEmail = async () => {
        if (!recipientEmail) {
            alert("Please enter recipient email");
            return;
        }

        try {
            setSending(true);

            const response = await fetch(
                `http://127.0.0.1:8000/api/reports/send-email/${reportId}?recipient_email=${recipientEmail}`,
                {
                    method: "POST",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.detail || "Failed to send email");
            } else {
                alert("Email sent successfully ✅");
                setRecipientEmail("");
            }
        } catch (err) {
            alert("Error sending email ❌");
        } finally {
            setSending(false);
        }
    };

    const meetingDate = report?.meeting_date
        ? new Date(report.meeting_date + "T00:00:00")
        : null;

    const isSameDay = (d1, d2) => {
        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        );
    };

    const renderTileContent = ({ date, view }) => {
        if (view !== "month") return null;

        const isHighlighted = highlightedDates.some(
            (d) => d && isSameDay(date, d)
        );

        if (isHighlighted) {
            return (
                <div
                    style={{
                        height: "6px",
                        width: "6px",
                        borderRadius: "50%",
                        margin: "0 auto",
                        marginTop: "4px",
                        background: "#e5bfff",
                        boxShadow: "0 0 8px #e5bfff"
                    }}
                />
            );
        }

        return null;
    };

    const handleDayClick = (date) => {
        if (!report?.tasks) return;

        const tasksForDay = report.tasks.filter((task) => {
            if (!task.date) return false;

            const taskDate = new Date(task.date + "T00:00:00");

            return (
                taskDate.getFullYear() === date.getFullYear() &&
                taskDate.getMonth() === date.getMonth() &&
                taskDate.getDate() === date.getDate()
            );
        });

        setSelectedDayTasks(tasksForDay);
    };

    const downloadPDF = async () => {
        try {
            const response = await fetch(
                `http://127.0.0.1:8000/${report.pdf_path.replace("\\", "/")}`
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
                {/* Visual Blobs */}
                <div className="blobs">
                    <div style={{...styles.blob, top: '20%', right: '10%', background: '#4c1c62', animationDelay: '0s'}}></div>
                    <div style={{...styles.blob, bottom: '10%', left: '0', background: '#41005b', width: '350px', height: '350px', animationDelay: '2s'}}></div>
                </div>

                <div className="input-animation">
                    <button onClick={() => navigate(-1)} style={styles.backBtn} className="hover-back">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back to Dashboard
                    </button>

                    <h1 style={styles.title}>Meeting Report Details</h1>
                    <p style={styles.subtitle}>Report Reference: <code style={styles.codeBadge}>{reportId}</code></p>
                </div>

                {report && (
                    <div style={styles.contentLayout}>
                        {/* LEFT COLUMN: Actions & Info */}
                        <div style={styles.leftCol} className="input-animation delay-100">
                            <div className="glossy-glass-card" style={styles.actionCard}>
                                <div style={styles.actionHeader}>
                                    <h3 style={styles.cardSectionTitle}>Download Report</h3>
                                    <p style={styles.actionDesc}>Get the structured meeting summary in PDF format.</p>
                                </div>
                                <button className="glossy-button" style={styles.fullWidthBtn} onClick={downloadPDF}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                    Download PDF
                                </button>
                            </div>

                            <div className="glossy-glass-card" style={styles.actionCard}>
                                <div style={styles.actionHeader}>
                                    <h3 style={styles.cardSectionTitle}>Share via Email</h3>
                                    <p style={styles.actionDesc}>Send this report directly to a colleague or client.</p>
                                </div>
                                <div style={styles.emailForm}>
                                    <input
                                        type="email"
                                        placeholder="colleague@company.com"
                                        value={recipientEmail}
                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                        className="glossy-input"
                                        style={{...styles.emailInput, marginBottom: '16px'}}
                                    />
                                    <button
                                        onClick={handleSendEmail}
                                        disabled={sending}
                                        className="glossy-button-secondary"
                                        style={styles.fullWidthBtn}
                                    >
                                        {sending ? "Sending..." : (
                                            <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
                                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                                </svg>
                                                Send Email
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Calendar & Tasks */}
                        <div style={styles.rightCol} className="input-animation delay-200">
                            <div className="glossy-glass-card" style={styles.calendarCard}>
                                <h3 style={{...styles.cardSectionTitle, marginBottom: '24px', textAlign: 'center'}}>Meeting Calendar Timeline</h3>
                                <div className="calendar-wrapper">
                                    <Calendar
                                        value={meetingDate || new Date()}
                                        onClickDay={handleDayClick}
                                        tileContent={renderTileContent}
                                        className="custom-calendar"
                                    />
                                </div>

                                {selectedDayTasks.length > 0 && (
                                    <div style={styles.tasksSection} className="input-animation">
                                        <h3 style={styles.tasksTitle}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', color: '#e5bfff'}}>
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path>
                                                <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"></path>
                                            </svg>
                                            Tasks for Selected Date
                                        </h3>
                                        <ul style={styles.taskList}>
                                            {selectedDayTasks.map((task, idx) => (
                                                <li key={idx} className="glossy-task-item" style={styles.taskItem}>
                                                    <span style={styles.taskBullet}></span>
                                                    <div>
                                                        <p style={styles.taskText}>{task.task}</p>
                                                        <span style={styles.taskAssignee}>
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'4px'}}>
                                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                                <circle cx="12" cy="7" r="4"></circle>
                                                            </svg>
                                                            {task.person || "Unassigned"}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>
                {`
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

                    .blobs div {
                        position: fixed;
                        animation: float 8s ease-in-out infinite alternate;
                        pointer-events: none;
                    }

                    @keyframes slideInUp {
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    .input-animation {
                        opacity: 0;
                        animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        position: relative;
                        z-index: 2;
                    }
                    
                    .delay-100 { animation-delay: 0.05s; }
                    .delay-200 { animation-delay: 0.1s; }

                    /* Button and UI Classes matching aesthetic */
                    .hover-back:hover {
                        color: #ffffff !important;
                        transform: translateX(-4px);
                    }

                    .glossy-glass-card {
                        background: linear-gradient(135deg, rgba(93, 35, 120, 0.7) 0%, rgba(76, 28, 98, 0.45) 100%);
                        backdrop-filter: blur(28px);
                        -webkit-backdrop-filter: blur(28px);
                        border-radius: 20px;
                        border-top: 1.5px solid rgba(255, 255, 255, 0.45);
                        border-left: 1.5px solid rgba(255, 255, 255, 0.25);
                        border-right: 0.5px solid rgba(255, 255, 255, 0.08);
                        border-bottom: 0.5px solid rgba(255, 255, 255, 0.08);
                        box-shadow: 0 25px 40px rgba(0, 0, 0, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.05);
                        overflow: hidden;
                    }

                    .glossy-button {
                        background: linear-gradient(135deg, #a875ff 0%, #e5bfff 100%);
                        color: #230030 !important;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        border: none;
                        border-top: 1px solid rgba(255, 255, 255, 0.6) !important;
                        font-family: inherit;
                    }
                    .glossy-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 10px 20px rgba(229, 191, 255, 0.5);
                    }

                    .glossy-button-secondary {
                        background: rgba(255, 255, 255, 0.1);
                        color: #ffffff !important;
                        transition: all 0.3s ease;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-top: 1px solid rgba(255, 255, 255, 0.5) !important;
                        font-family: inherit;
                        backdrop-filter: blur(10px);
                    }
                    .glossy-button-secondary:hover:not(:disabled) {
                        background: rgba(255, 255, 255, 0.15);
                        transform: translateY(-2px);
                        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
                    }
                    .glossy-button-secondary:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }

                    .glossy-input {
                        background: rgba(0, 0, 0, 0.2) !important;
                        border: 1px solid rgba(255, 255, 255, 0.15) !important;
                        box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);
                        transition: all 0.3s ease !important;
                        color: #ffffff;
                        outline: none;
                        width: 100%;
                        box-sizing: border-box;
                    }
                    .glossy-input:focus {
                        border-color: #e5bfff !important;
                        box-shadow: 0 0 0 3px rgba(229, 191, 255, 0.2), inset 0 2px 5px rgba(0,0,0,0.3) !important;
                        background: rgba(0, 0, 0, 0.35) !important;
                    }
                    .glossy-input::placeholder {
                        color: rgba(255, 255, 255, 0.5) !important;
                    }

                    .glossy-task-item {
                        background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-top: 1px solid rgba(255, 255, 255, 0.2);
                        transition: transform 0.2s ease, background 0.2s ease;
                    }
                    .glossy-task-item:hover {
                        transform: translateY(-2px);
                        background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%);
                    }

                    /* Calendar Theme Overrides for Premium Aesthetic */
                    .custom-calendar {
                        background: rgba(0, 0, 0, 0.15) !important;
                        border: 1px solid rgba(255, 255, 255, 0.1) !important;
                        border-radius: 12px;
                        padding: 12px;
                        width: 100% !important;
                        color: #ffffff !important;
                        font-family: inherit !important;
                    }
                    .react-calendar__navigation button {
                        color: #ffffff !important;
                        min-width: 44px;
                        background: none;
                        font-size: 16px;
                        border-radius: 8px;
                        transition: background 0.2s ease;
                    }
                    .react-calendar__navigation button:hover:enabled, .react-calendar__navigation button:focus {
                        background-color: rgba(255, 255, 255, 0.1) !important;
                    }
                    .react-calendar__month-view__weekdays {
                        text-transform: uppercase;
                        font-weight: 700;
                        font-size: 12px;
                        color: rgba(255,255,255,0.6);
                    }
                    .react-calendar__month-view__days__day {
                        color: #ffffff !important;
                    }
                    .react-calendar__month-view__days__day--neighboringMonth {
                        color: rgba(255,255,255,0.3) !important;
                    }
                    .react-calendar__tile {
                        padding: 12px 6.6667% !important;
                        border-radius: 8px;
                        transition: all 0.2s ease;
                    }
                    .react-calendar__tile:hover {
                        background: rgba(229, 191, 255, 0.15) !important;
                    }
                    .react-calendar__tile--active {
                        background: linear-gradient(135deg, #a875ff, #e5bfff) !important;
                        color: #230030 !important;
                        font-weight: bold;
                        box-shadow: 0 4px 10px rgba(229, 191, 255, 0.4);
                    }
                    .react-calendar__tile--now {
                        background: rgba(255, 255, 255, 0.1) !important;
                        border: 1px solid rgba(255,255,255,0.2) !important;
                    }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: {
        paddingTop: "70px", /* Spacer for absolute navbar */
        maxWidth: "1150px",
        margin: "0 auto",
        padding: "100px 24px 60px",
        position: " relative",
        fontFamily: "'Inter', sans-serif"
    },
    blob: {
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        filter: 'blur(100px)',
        zIndex: 0,
        opacity: 0.3
    },
    backBtn: {
        display: "flex",
        alignItems: "center",
        background: "transparent",
        border: "none",
        color: "rgba(255,255,255,0.7)",
        cursor: "pointer",
        padding: "8px 0",
        fontWeight: "600",
        fontSize: "15px",
        marginBottom: "20px",
        transition: "all 0.2s ease",
    },
    title: {
        fontSize: "36px",
        marginBottom: "8px",
        fontWeight: "800",
        background: "linear-gradient(135deg, #ffffff, #e5bfff)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    },
    subtitle: {
        color: "rgba(255,255,255,0.8)",
        marginBottom: "48px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "15px"
    },
    codeBadge: {
        background: "rgba(255,255,255,0.1)",
        padding: "6px 10px",
        borderRadius: "6px",
        fontSize: "14px",
        color: "#e5bfff",
        border: "1px solid rgba(255,255,255,0.15)"
    },
    contentLayout: {
        display: "grid",
        gridTemplateColumns: "1fr 2fr",
        gap: "30px",
        alignItems: "start",
    },
    leftCol: {
        display: "flex",
        flexDirection: "column",
        gap: "24px",
    },
    rightCol: {
        display: "flex",
        flexDirection: "column",
    },
    actionCard: {
        padding: "30px 24px",
        display: "flex",
        flexDirection: "column",
    },
    actionHeader: {
        marginBottom: "24px",
    },
    cardSectionTitle: {
        margin: "0 0 6px 0",
        fontSize: "20px",
        fontWeight: "700",
        color: "#ffffff"
    },
    actionDesc: {
        color: "rgba(255,255,255,0.6)",
        fontSize: "14.5px",
        margin: 0,
        lineHeight: "1.5",
    },
    emailForm: {
        display: "flex",
        flexDirection: "column",
    },
    emailInput: {
        padding: "14px 16px",
        borderRadius: "10px",
        fontSize: "15px",
    },
    fullWidthBtn: {
        width: "100%",
        padding: "14px 20px",
        borderRadius: "10px",
        fontWeight: "600",
        fontSize: "15px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
    },
    calendarCard: {
        padding: "32px 36px",
        display: "flex",
        flexDirection: "column",
    },
    tasksSection: {
        marginTop: "36px",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        paddingTop: "24px",
    },
    tasksTitle: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
    },
    taskList: {
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    taskItem: {
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
        padding: "18px",
        borderRadius: "12px",
    },
    taskBullet: {
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: "#e5bfff",
        marginTop: "5px",
        boxShadow: "0 0 8px rgba(229, 191, 255, 0.6)",
        flexShrink: 0
    },
    taskText: {
        margin: "0 0 10px 0",
        fontSize: "15.5px",
        lineHeight: "1.5",
        color: "#ffffff",
    },
    taskAssignee: {
        display: "inline-flex",
        alignItems: "center",
        fontSize: "12px",
        fontWeight: "600",
        color: "#ffffff",
        background: "rgba(0,0,0,0.3)",
        padding: "4px 10px",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.1)"
    },
};

export default ReportDetails;