import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Track mouse movement for a subtle interactive overlay, 
    // but the main background will now animate autonomously in CSS
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

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://127.0.0.1:8000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || "Login failed");
                setLoading(false);
                return;
            }

            // ALWAYS SAVE CLEAN USER OBJECT
            const userData = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
            };

            localStorage.setItem("user", JSON.stringify(userData));

            // Small delay for stability
            setTimeout(() => {
                navigate("/home");
            }, 300);

        } catch (err) {
            setError("Server error. Make sure backend is running.");
        }

        setLoading(false);
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
                <div style={{...styles.blob, top: '5%', left: '10%', background: '#41005b', animationDelay: '0s'}}></div>
                <div style={{...styles.blob, bottom: '10%', right: '5%', background: '#4c1c62', animationDelay: '2s', width: '380px', height: '380px'}}></div>
                <div style={{...styles.blob, top: '50%', left: '40%', background: '#a875ff', animationDelay: '4s', width: '200px', height: '200px', filter: 'blur(120px)', opacity: 0.15}}></div>
            </div>

            {/* Glossy Glass Effect Container (1 bit lighter as requested) */}
            <div className="glossy-glass-card" style={styles.card}>
                
                {/* The Glossy Sweeping Reflection Animation */}
                <div className="gloss-sweep"></div>
                
                <div style={styles.branding}>
                    <h1 style={styles.logo}>MeetWise</h1>
                    <p style={styles.tagline}>Welcome Back</p>
                </div>

                <form onSubmit={handleLogin} style={styles.form}>
                    {error && <div style={styles.errorBox}>{error}</div>}

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
                                placeholder="••••••••"
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

                    <div className="input-animation delay-300" style={{ width: "100%", marginTop: "16px" }}>
                        <button 
                            type="submit" 
                            onClick={handleLogin}
                            style={{...styles.button, marginTop: 0}}
                            className="glossy-button"
                            disabled={loading}
                        >
                            <span className="btn-text" style={{ pointerEvents: "none" }}>{loading ? "Logging In..." : "Login"}</span>
                            <div className="btn-glow" style={{ pointerEvents: "none" }}></div>
                        </button>
                    </div>
                </form>

                <p style={styles.footerText} className="input-animation delay-400">
                    Don’t have an account?{" "}
                    <Link to="/signup" style={styles.link}>
                        Create Account
                    </Link>
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
                        /* Gently pushed the gradient stops brighter to make it pop */
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
                        pointer-events: none; /* Let clicks pass through */
                        z-index: 1;
                    }

                    .input-animation {
                        opacity: 0;
                        animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        position: relative;
                        z-index: 2;
                    }
                    
                    .delay-100 { animation-delay: 0.1s; }
                    .delay-200 { animation-delay: 0.15s; }
                    .delay-300 { animation-delay: 0.2s; }
                    .delay-400 { animation-delay: 0.25s; }

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
        height: "100vh",
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
        padding: "45px 40px",
        width: "100%",
        maxWidth: "440px",
        margin: "20px",
        boxSizing: "border-box",
    },
    branding: {
        textAlign: "center",
        marginBottom: "36px",
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
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        textAlign: "left"
    },
    label: {
        marginBottom: "8px",
        fontSize: "14px",
        fontWeight: "600",
        color: "#ffffff",
        textShadow: "0 1px 2px rgba(0,0,0,0.5)"
    },
    input: {
        width: "100%",
        padding: "15px 16px",
        borderRadius: "10px",
        color: "#ffffff",
        fontSize: "15px",
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
        marginTop: "16px",
        width: "100%",
        padding: "15px 24px",
        borderRadius: "10px",
        border: "none",
        cursor: "pointer",
    },
    footerText: {
        marginTop: "32px",
        textAlign: "center",
        fontSize: "15px",
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
    errorBox: {
        background: "rgba(255, 77, 77, 0.2)",
        color: "#ffcccc",
        padding: "14px",
        borderRadius: "8px",
        border: "1px solid rgba(255, 77, 77, 0.4)",
        fontSize: "14px",
        marginBottom: "24px",
        textAlign: "center",
        fontWeight: "500",
        position: "relative",
        zIndex: 2
    },
};