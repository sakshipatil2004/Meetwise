import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || "Signup failed");
                return;
            }

            // ✅ SAVE USER IN LOCALSTORAGE
            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: data.id,
                    name: data.name,
                    email: data.email,
                })
            );

            setSuccess("Account created successfully!");
            setError("");

            // ✅ GO DIRECTLY TO HOME
            setTimeout(() => {
                navigate("/home");
            }, 1000);

        } catch (err) {
            setError("Server error. Make sure backend is running.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                <div style={styles.branding}>
                    <h1 style={styles.logo}>MeetWise</h1>
                    <p style={styles.tagline}>Create your account</p>
                </div>

                <form onSubmit={handleSignup} style={styles.form}>
                    {error && <p style={styles.error}>{error}</p>}
                    {success && <p style={styles.success}>{success}</p>}

                    <div style={styles.inputGroup}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label>Password</label>
                        <div style={styles.passwordWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                            />
                            <span
                                style={styles.showBtn}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </span>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label>Confirm Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <button type="submit" style={styles.button}>
                        Create Account
                    </button>
                </form>

                <p style={styles.footerText}>
                    Already have an account?{" "}
                    <Link to="/login" style={styles.link}>
                        Sign In
                    </Link>
                </p>

                <p style={styles.security}>
                    🔒 Your data is encrypted and secure
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #2564ebbb, #8a1e6f7d)",
        fontFamily: "Inter, sans-serif",
    },
    card: {
        background: "#ffffff",
        padding: "40px",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    },
    branding: {
        textAlign: "center",
        marginBottom: "25px",
    },
    logo: {
        margin: 0,
        fontSize: "28px",
        fontWeight: "700",
        color: "#1e3a8a",
    },
    tagline: {
        marginTop: "5px",
        fontSize: "14px",
        color: "#555",
    },
    form: {
        display: "flex",
        flexDirection: "column",
    },
    inputGroup: {
        marginBottom: "18px",
        display: "flex",
        flexDirection: "column",
    },
    input: {
        padding: "10px",
        marginTop: "6px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        outline: "none",
        fontSize: "14px",
    },
    passwordWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    showBtn: {
        position: "absolute",
        right: "10px",
        fontSize: "12px",
        cursor: "pointer",
        color: "#2563eb",
    },
    button: {
        padding: "12px",
        borderRadius: "8px",
        border: "none",
        background: "#2563eb",
        color: "#fff",
        fontWeight: "600",
        cursor: "pointer",
    },
    footerText: {
        marginTop: "20px",
        textAlign: "center",
        fontSize: "14px",
    },
    link: {
        color: "#2563eb",
        textDecoration: "none",
        fontWeight: "500",
    },
    security: {
        marginTop: "15px",
        textAlign: "center",
        fontSize: "12px",
        color: "#666",
    },
    error: {
        color: "red",
        fontSize: "13px",
        marginBottom: "10px",
    },
    success: {
        color: "green",
        fontSize: "13px",
        marginBottom: "10px",
    },
};