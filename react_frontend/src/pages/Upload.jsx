import { useState } from "react";
import { uploadAudio } from "../api";

function Upload() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadAudio(formData);
        setMessage(result.message);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Upload Meeting Audio</h2>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <br /><br />
            <button onClick={handleUpload}>Generate Summary</button>
            <p>{message}</p>
        </div>
    );
}

export default Upload;