import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadAudio } from "../api";

function Upload() {
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));

    // 🔐 Protect Route
    useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, []);

    const handleUpload = async () => {
        if (!file) {
            return alert("Please select an audio file");
        }

        try {
            setLoading(true);
            setMessage("Uploading...");

            const formData = new FormData();
            formData.append("file", file);
            formData.append("user_id", user.id); // ✅ REQUIRED

            const result = await uploadAudio(formData);

            if (result.job_id) {
                setMessage("Upload successful! Processing started...");
            } else if (result.message) {
                setMessage(result.message);
            } else {
                setMessage("Upload completed.");
            }

        } catch (error) {
            console.error("Upload Error:", error);
            setMessage("Upload failed ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
            <h2>Upload Meeting Audio</h2>

            <input
                type="file"
                accept="audio/*"
                onChange={(e) => setFile(e.target.files[0])}
            />

            <br /><br />

            <button
                onClick={handleUpload}
                disabled={loading}
                style={{
                    padding: "10px 20px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#2564eb",
                    color: "white",
                    cursor: "pointer"
                }}
            >
                {loading ? "Uploading..." : "Generate Summary"}
            </button>

            {message && (
                <p style={{ marginTop: "20px", fontWeight: "500" }}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default Upload;