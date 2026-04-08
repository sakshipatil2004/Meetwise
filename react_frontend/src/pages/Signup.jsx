import React, { useState, useEffect } from "react";
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
    const [loading, setLoading] = useState(false);

    // Track mouse movement for a subtle interactive overlay
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            setMousePos({ x, y });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

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

        setLoading(true);

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
                setLoading(false);
                return;
            }

            // SAVE USER IN LOCALSTORAGE
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

            // GO DIRECTLY TO HOME
            setTimeout(() => {
                navigate("/home");
            }, 1000);

        } catch (err) {
            setError("Server error. Make sure backend is running.");
            setLoading(false);
        }
    };

    return (
        <div style={styles.container} className="animated-bg">
            {/* Interactive subtle radial overlay following the mouse */}
            <div 
                style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(76, 28, 98, 0.4) 0%, transparent 50%)`,
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />

            {/* Animated floating orbs in background */}
            <div className="blobs">
                <div style={{...styles.blob, top: '2%', left: '5%', background: '#41005b', animationDelay: '0s'}}></div>
                <div style={{...styles.blob, bottom: '2%', right: '2%', background: '#4c1c62', animationDelay: '2s', width: '380px', height: '380px'}}></div>
                <div style={{...styles.blob, top: '40%', left: '50%', background: '#a875ff', animationDelay: '4s', width: '200px', height: '200px', filter: 'blur(120px)', opacity: 0.15}}></div>
            </div>

            {/* Glossy Glass Effect Container */}
            <div className="glossy-glass-card" style={styles.card}>
                
                {/* The Glossy Sweeping Reflection Animation */}
                <div className="gloss-sweep"></div>

                <div style={styles.branding}>
                    <h1 style={styles.logo}>MeetWise</h1>
                    <p style={styles.tagline}>Create your account</p>
                </div>

                <form onSubmit={handleSignup} style={styles.form}>
                    {error && <div style={styles.errorBox}>{error}</div>}
                    {success && <div style={styles.successBox}>{success}</div>}

                    <div style={styles.inputGroup} className="input-animation delay-100">
                        <label style={styles.label}>Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={styles.input}
                            className="glossy-input"
                        />
                    </div>

                    <div style={styles.inputGroup} className="input-animation delay-100">
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            className="glossy-input"
                        />
                    </div>

                    <div style={styles.inputGroup} className="input-animation delay-200">
                        <label style={styles.label}>Password</label>
                        <div style={styles.passwordWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ ...styles.input, paddingRight: "50px" }}
                                className="glossy-input"
                            />
                            <button
                                type="button"
                                style={styles.showBtn}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                                    {showPassword ? (
                                        <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></>
                                    ) : (
                                        <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></>
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div style={styles.inputGroup} className="input-animation delay-200">
                        <label style={styles.label}>Confirm Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={styles.input}
                            className="glossy-input"
                        />
                    </div>

                    <div className="input-animation delay-300" style={{ width: "100%", marginTop: "12px" }}>
                        <button 
                            type="submit" 
                            style={{...styles.button, marginTop: 0}}
                            className="glossy-button"
                            disabled={loading}
                        >
                            <span className="btn-text" style={{ pointerEvents: "none" }}>{loading ? "Creating..." : "Create Account"}</span>
                            <div className="btn-glow" style={{ pointerEvents: "none" }}></div>
                        </button>
                    </div>
                </form>

                <p style={styles.footerText} className="input-animation delay-400">
                    Already have an account?{" "}
                    <Link to="/" style={styles.link}>
                        Sign In
                    </Link>
                </p>

                <p style={styles.security} className="input-animation delay-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', position: 'relative', top: '1px' }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Your data is encrypted and secure
                </p>
            </div>

            <style>
                {`
                    /* Beautiful fluid gradient animation for the background */
                    @keyframes bgFlow {
                        0% { background-position: 0% 50%; opacity: 0.9; }
                        50% { background-position: 100% 50%; opacity: 1; }
                        100% { background-position: 0% 50%; opacity: 0.9; }
                    }

                    .animated-bg {
                        background: linear-gradient(-45deg, #15001c, #2f0042, #230030, #38004f);
                        background-size: 300% 300%;
                        animation: bgFlow 12s ease infinite alternate;
                    }

                    @keyframes float {
                        0% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0.6; }
                        50% { transform: translateY(-40px) scale(1.08) rotate(5deg); opacity: 0.85; }
                        100% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0.6; }
                    }

                    @keyframes slideInUp {
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    @keyframes glossAnimation {
                        0% { transform: translateX(-150%) skewX(-45deg); opacity: 0; }
                        40% { transform: translateX(150%) skewX(-45deg); opacity: 0.6; }
                        100% { transform: translateX(150%) skewX(-45deg); opacity: 0; }
                    }

                    @keyframes pulseGlow {
                        0% { box-shadow: 0 0 10px rgba(229, 191, 255, 0.4); }
                        50% { box-shadow: 0 0 25px rgba(229, 191, 255, 0.8); }
                        100% { box-shadow: 0 0 10px rgba(229, 191, 255, 0.4); }
                    }

                    .blobs div {
                        animation: float 8s ease-in-out infinite alternate;
                    }

                    /* Lighter Glossy Glassmorphism Container */
                    .glossy-glass-card {
                        background: linear-gradient(135deg, rgba(93, 35, 120, 0.7) 0%, rgba(76, 28, 98, 0.45) 100%);
                        backdrop-filter: blur(24px);
                        -webkit-backdrop-filter: blur(24px);
                        border-radius: 20px;
                        
                        /* Strong glossy highlight borders */
                        border-top: 1.5px solid rgba(255, 255, 255, 0.45);
                        border-left: 1.5px solid rgba(255, 255, 255, 0.25);
                        border-right: 0.5px solid rgba(255, 255, 255, 0.08);
                        border-bottom: 0.5px solid rgba(255, 255, 255, 0.08);
                        
                        /* Deep shadow making it pop, plus internal white ambient glow */
                        box-shadow: 0 25px 40px rgba(0, 0, 0, 0.4), 
                                    inset 0 0 50px rgba(255, 255, 255, 0.1);
                                    
                        position: relative;
                        z-index: 10;
                        overflow: hidden;
                        animation: slideInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }

                    /* The Diagonal Moving Gloss Highlight */
                    .gloss-sweep {
                        position: absolute;
                        top: 0;
                        left: -50%;
                        width: 50%;
                        height: 100%;
                        background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
                        transform: skewX(-45deg);
                        animation: glossAnimation 7s infinite ease-in-out;
                        pointer-events: none;
                        z-index: 1;
                    }

                    .input-animation {
                        opacity: 0;
                        animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        position: relative;
                        z-index: 2;
                    }
                    
                    /* Tighter staggered delay sequence for the signup page */
                    .delay-100 { animation-delay: 0.05s; }
                    .delay-200 { animation-delay: 0.10s; }
                    .delay-300 { animation-delay: 0.15s; }
                    .delay-400 { animation-delay: 0.20s; }

                    /* Glossy input fields */
                    .glossy-input {
                        background: rgba(0, 0, 0, 0.25) !important;
                        border: 1px solid rgba(255, 255, 255, 0.2) !important;
                        box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);
                        transition: all 0.3s ease !important;
                    }
                    .glossy-input:focus {
                        border-color: #e5bfff !important;
                        box-shadow: 0 0 0 3px rgba(229, 191, 255, 0.3), inset 0 2px 5px rgba(0,0,0,0.3) !important;
                        background: rgba(0, 0, 0, 0.45) !important;
                        outline: none;
                    }
                    .glossy-input::placeholder {
                        color: rgba(255, 255, 255, 0.5) !important;
                    }

                    /* Glossy button with pulse animation */
                    .glossy-button {
                        background: linear-gradient(135deg, #a875ff 0%, #e5bfff 100%);
                        color: #230030 !important;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        position: relative;
                        overflow: hidden;
                        border-top: 1px solid rgba(255, 255, 255, 0.6) !important;
                        animation: pulseGlow 3s infinite alternate;
                    }
                    
                    .btn-text {
                        position: relative;
                        z-index: 2;
                        font-weight: 700;
                    }
                    
                    /* Button shine */
                    .glossy-button::after {
                        content: '';
                        position: absolute;
                        top: 0; left: -100%;
                        width: 50%; height: 100%;
                        background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%);
                        transform: skewX(-20deg);
                        transition: all 0.5s ease;
                        z-index: 1;
                    }
                    
                    .glossy-button:hover {
                        transform: translateY(-2px);
                    }
                    
                    .glossy-button:focus::after,
                    .glossy-button:hover::after {
                        left: 150%;
                    }
                `}
            </style>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif"
    },
    blob: {
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        filter: 'blur(90px)',
        zIndex: 0,
    },
    card: {
        padding: "24px 40px",
        width: "100%",
        maxWidth: "460px",
        margin: "20px",
        boxSizing: "border-box",

    },
    branding: {
        textAlign: "center",
        marginBottom: "20px",
        position: "relative",
        zIndex: 2
    },
    logo: {
        margin: 0,
        fontSize: "36px",
        letterSpacing: "-1px",
        fontWeight: "800",
        background: "linear-gradient(135deg, #ffffff, #e5bfff)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textShadow: "0 4px 15px rgba(229, 191, 255, 0.4)"
    },
    tagline: {
        marginTop: "8px",
        fontSize: "15px",
        color: "rgba(255,255,255,0.9)",
        fontWeight: "500"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 2
    },
    inputGroup: {
        marginBottom: "12px",
        display: "flex",
        flexDirection: "column",
        textAlign: "left"
    },
    label: {
        marginBottom: "4px",
        fontSize: "13px",
        fontWeight: "600",
        color: "#ffffff",
        textShadow: "0 1px 2px rgba(0,0,0,0.5)"
    },
    input: {
        width: "100%",
        padding: "12px 16px",
        borderRadius: "10px",
        color: "#ffffff",
        fontSize: "14px",
        outline: "none",
        boxSizing: 'border-box'
    },
    passwordWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    showBtn: {
        position: "absolute",
        right: "14px",
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
    },
    button: {
        marginTop: "12px",
        width: "100%",
        padding: "14px 24px",
        borderRadius: "10px",
        border: "none",
        cursor: "pointer",
    },
    footerText: {
        marginTop: "18px",
        textAlign: "center",
        fontSize: "13.5px",
        color: "rgba(255,255,255,0.85)",
        position: "relative",
        zIndex: 2
    },
    link: {
        color: "#e5bfff",
        fontWeight: "700",
        textDecoration: "none",
        textShadow: "0 0 10px rgba(229,191,255,0.4)",
        transition: "color 0.2s ease"
    },
    security: {
        marginTop: "12px",
        textAlign: "center",
        fontSize: "12px",
        color: "rgba(255,255,255,0.6)",
        position: "relative",
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    errorBox: {
        background: "rgba(255, 77, 77, 0.2)",
        color: "#ffcccc",
        padding: "14px",
        borderRadius: "8px",
        border: "1px solid rgba(255, 77, 77, 0.4)",
        fontSize: "14px",
        marginBottom: "20px",
        textAlign: "center",
        fontWeight: "500",
        position: "relative",
        zIndex: 2
    },
    successBox: {
        background: "rgba(34, 197, 94, 0.2)",
        color: "#bbf7d0",
        padding: "14px",
        borderRadius: "8px",
        border: "1px solid rgba(34, 197, 94, 0.4)",
        fontSize: "14px",
        marginBottom: "20px",
        textAlign: "center",
        fontWeight: "500",
        position: "relative",
        zIndex: 2
    },
};