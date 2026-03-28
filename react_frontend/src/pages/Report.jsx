import { useParams } from "react-router-dom";
import { sendEmail } from "../api";

function Report() {
    const { id } = useParams();

    const handleEmail = async () => {
        const result = await sendEmail(id);
        alert(result.message);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Meeting Report</h2>
            <p>Report details for meeting ID: {id}</p>
            <button onClick={handleEmail}>Send Email</button>
        </div>
    );
}

export default Report;