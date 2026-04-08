import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const ReportDetails = () => {
    // ✅ FIXED HERE
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
    // 
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

    const taskDates =
        report?.tasks?.map((task) =>
            task.date ? new Date(task.date + "T00:00:00") : null
        ) || [];

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
                        marginTop: "2px",
                        background: "#eb2564"
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
        <>
            <Navbar />
            <div style={styles.container}>
                <h1>Meeting Report Details</h1>
                <p>Report ID: {reportId}</p>

                {report && (
                    <>
                        <button style={styles.downloadBtn} onClick={downloadPDF}>
                            ⬇ Download Report PDFS
                        </button>

                        {/* EMAIL SECTION */}
                        <div style={{ marginTop: "30px" }}>
                            <h3>Send Report via Email</h3>
                            <input
                                type="email"
                                placeholder="Enter recipient email"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                                style={{
                                    padding: "10px",
                                    width: "280px",
                                    marginRight: "10px"
                                }}
                            />
                            <button
                                onClick={handleSendEmail}
                                disabled={sending}
                                style={{
                                    padding: "10px 18px",
                                    background: "#2564eb",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer"
                                }}
                            >
                                {sending ? "Sending..." : "Send Email"}
                            </button>
                        </div>

                        <div style={{ marginTop: "40px" }}>
                            <h2>Meeting Calendar</h2>
                            <Calendar
                                value={meetingDate || new Date()}
                                onClickDay={handleDayClick}
                                tileContent={renderTileContent}
                            />
                        </div>

                        {selectedDayTasks.length > 0 && (
                            <div style={{ marginTop: "20px", textAlign: "left" }}>
                                <h3>Tasks for Selected Date</h3>
                                <ul>
                                    {selectedDayTasks.map((task, idx) => (
                                        <li key={idx}>
                                            {task.task} —{" "}
                                            <strong>{task.person || "Unassigned"}</strong>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

const styles = {
    container: {
        paddingTop: "120px",
        textAlign: "center",
        maxWidth: "900px",
        margin: "0 auto"
    },
    downloadBtn: {
        marginTop: "20px",
        padding: "14px 28px",
        borderRadius: "8px",
        border: "none",
        background: "linear-gradient(135deg, #8a1e6f, #2564eb)",
        color: "white",
        fontWeight: "600",
        cursor: "pointer"
    }
};

export default ReportDetails;