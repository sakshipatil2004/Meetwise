// frontend/src/App.jsx
import React from "react";
import UploadForm from "./components/UploadForm";

export default function App() {
  return (
    <div className="app-container">
      <header className="hero-section">
        <h1>MeetWise</h1>
        <p className="hero-subtitle">
          Transform your meeting recordings into actionable summaries
        </p>
      </header>

      <main className="main-content">
        <UploadForm />
      </main>

      <footer className="footer">
        &copy; 2025 MeetWise. All rights reserved.
      </footer>
    </div>
  );
}
