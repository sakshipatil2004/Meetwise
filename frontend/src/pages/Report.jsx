import { useParams } from "react-router-dom";
import { sendEmail } from "../api";

function Report() {
    const { reportId } = useParams();  // must match route

    const handleEmail = async () => {
        if (!reportId) {
            alert("Report ID is missing");
            return;
        }

        const result = await sendEmail(reportId);
        alert(result.message || "Email sent");
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Meeting Report</h2>
            <p>Report details for meeting ID: {reportId}</p>
            <button onClick={handleEmail}>
                Send Email
            </button>
        </div>
    );
}

export default Report;