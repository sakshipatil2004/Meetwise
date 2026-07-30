const BASE_URL = "http://127.0.0.1:8000/api";

// ✅ Upload Audio
export const uploadAudio = async (formData) => {
    const response = await fetch(`${BASE_URL}/upload-audio`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Upload failed");
    }

    return response.json();
};

// ✅ Get Reports of Logged-in User
export const getUserReports = async (userId) => {
    const response = await fetch(`${BASE_URL}/reports/user/${userId}`);

    if (!response.ok) {
        throw new Error("Failed to fetch reports");
    }

    return response.json();
};

// ✅ Send Email with PDF
export const sendEmail = async (reportId, recipientEmail) => {
    const response = await fetch(
        `http://127.0.0.1:8000/api/reports/send-email/${reportId}?recipient_email=${recipientEmail}`,
        { method: "POST" }
    );

    if (!response.ok) {
        throw new Error("Failed to send email");
    }

    return response.json();
};