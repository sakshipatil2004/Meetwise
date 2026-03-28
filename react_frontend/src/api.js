const BASE_URL = "http://127.0.0.1:8000";

export const uploadAudio = async (formData) => {
    const response = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: formData,
    });
    return response.json();
};

export const getMeetings = async () => {
    const response = await fetch(`${BASE_URL}/meetings`);
    return response.json();
};

export const sendEmail = async (meetingId) => {
    const response = await fetch(`${BASE_URL}/send-email/${meetingId}`, {
        method: "POST",
    });
    return response.json();
};