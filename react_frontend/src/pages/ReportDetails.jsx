import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";

const ReportDetails = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (!user) navigate("/");
    }, []);

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
                <h1>Meeting Report Details</h1>
                <p>Job ID: {jobId}</p>

                <button
                    onClick={downloadPDF}
                    style={styles.downloadBtn}
                >
                    ⬇ Download Report PDF
                </button>
            </div>
        </>
    );
};

const styles = {
    container: {
        paddingTop: "120px",
        textAlign: "center",
    },
    downloadBtn: {
        marginTop: "20px",
        padding: "14px 28px",
        borderRadius: "8px",
        border: "none",
        background:
            "linear-gradient(135deg, #8a1e6f, #2564eb)",
        color: "white",
        fontWeight: "600",
        cursor: "pointer",
    },
};

export default ReportDetails;