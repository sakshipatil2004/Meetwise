import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const user = JSON.parse(localStorage.getItem("user") || "null");

    const handleLogout = () => {
        localStorage.removeItem("user");
        setOpen(false);
        navigate("/");
    };

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Hide navbar on login & signup
    if (location.pathname === "/" || location.pathname === "/signup") {
        return null;
    }

    return (
        <div style={styles.navbar}>
            <div style={styles.contentWrapper}>
                <div style={styles.left}>
                    <div style={styles.logoWrapper}>
                        <h2 style={styles.logo}>MeetWise</h2>
                    </div>
                    
                    <div style={styles.navLinks}>
                        <Link 
                            to="/home" 
                            style={{
                                ...styles.link, 
                                ...(location.pathname === "/home" ? styles.activeLink : {})
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            Home
                        </Link>
                        
                        <Link 
                            to="/dashboard" 
                            style={{
                                ...styles.link, 
                                ...(location.pathname === "/dashboard" ? styles.activeLink : {})
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                <line x1="9" y1="21" x2="9" y2="9"></line>
                            </svg>
                            Dashboard
                        </Link>
                    </div>
                </div>

                <div style={styles.right} ref={dropdownRef}>
                    <div 
                        style={{...styles.profile, background: open ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0.05)'}} 
                        onClick={() => setOpen(!open)}
                        className="nav-profile-hover"
                    >
                        <div style={styles.avatar}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <span style={styles.userName}>{user?.name || "User"}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>

                    {open && (
                        <div style={styles.dropdown} className="glassmorphism-dropdown">
                            <div style={styles.dropdownHeader}>
                                <p style={styles.dropdownName}>{user?.name}</p>
                                <p style={styles.dropdownEmail}>{user?.email}</p>
                            </div>
                            <div style={styles.dropdownDivider} />
                            <button style={styles.dropdownItem} onClick={handleLogout} className="dropdown-logout-hover">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px', color: '#ff8080'}}>
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>
                {`
                    .nav-profile-hover {
                        transition: all 0.2s ease;
                    }
                    .nav-profile-hover:hover {
                        background: rgba(255, 255, 255, 0.1) !important;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                        border-color: rgba(229, 191, 255, 0.3);
                    }

                    @keyframes dropdownSlide {
                        from { opacity: 0; transform: translateY(10px) scale(0.95); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }

                    .glassmorphism-dropdown {
                        background: linear-gradient(135deg, rgba(93, 35, 120, 0.8) 0%, rgba(76, 28, 98, 0.9) 100%);
                        backdrop-filter: blur(28px);
                        -webkit-backdrop-filter: blur(28px);
                        border-radius: 16px;
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255,255,255,0.05);
                        animation: dropdownSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }

                    .dropdown-logout-hover {
                        transition: all 0.2s ease;
                    }
                    .dropdown-logout-hover:hover {
                        background: rgba(255, 77, 77, 0.1) !important;
                        color: #ffcccc !important;
                    }
                `}
            </style>
        </div>
    );
};

const styles = {
    navbar: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "80px",
        zIndex: 1000,
        
        /* Unified Bleed-to-Edge Glass Navbar */
        background: 'linear-gradient(90deg, rgba(168, 117, 255, 0.1) 0%, rgba(93, 35, 120, 0.25) 50%, rgba(168, 117, 255, 0.1) 100%)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 -1px 1px rgba(255, 255, 255, 0.05)',
    },
    contentWrapper: {
        maxWidth: "1400px",
        margin: "0 auto",
        height: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 32px",
        boxSizing: "border-box"
    },
    left: {
        display: "flex",
        alignItems: "center",
        gap: "48px",
    },
    logoWrapper: {
        display: "flex",
        alignItems: "center",
    },
    logo: {
        margin: 0,
        fontSize: "26px",
        letterSpacing: "-0.5px",
        fontWeight: "800",
        background: "linear-gradient(135deg, #ffffff, #e5bfff)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textShadow: "0 2px 10px rgba(229, 191, 255, 0.3)",
        cursor: "pointer"
    },
    navLinks: {
        display: "flex",
        gap: "8px",
    },
    link: {
        display: "flex",
        alignItems: "center",
        padding: "10px 18px",
        borderRadius: "12px",
        fontWeight: "600",
        color: "rgba(255,255,255,0.7)",
        fontSize: "15px",
        textDecoration: "none",
        transition: "all 0.2s ease",
    },
    activeLink: {
        background: "rgba(229, 191, 255, 0.12)",
        color: "#ffffff",
        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(229, 191, 255, 0.15)"
    },
    right: {
        position: "relative",
    },
    profile: {
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "6px 14px 6px 6px",
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.1)",
    },
    avatar: {
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #a875ff, #e5bfff)",
        color: "#230030",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
        fontWeight: "800",
        boxShadow: "0 2px 10px rgba(229, 191, 255, 0.3)"
    },
    userName: {
        fontWeight: "600",
        fontSize: "15px",
        color: "#ffffff",
    },
    dropdown: {
        position: "absolute",
        right: 0,
        top: "60px",
        padding: "10px",
        minWidth: "240px",
        transformOrigin: "top right",
    },
    dropdownHeader: {
        padding: "12px 14px",
        background: "rgba(0,0,0,0.15)",
        borderRadius: "10px",
        marginBottom: "8px"
    },
    dropdownName: {
        margin: 0,
        fontWeight: "700",
        fontSize: "15px",
        color: "#ffffff"
    },
    dropdownEmail: {
        margin: "4px 0 0",
        fontSize: "13px",
        color: "rgba(255,255,255,0.6)",
    },
    dropdownDivider: {
        height: "1px",
        background: "rgba(255,255,255,0.1)",
        margin: "8px 0",
    },
    dropdownItem: {
        display: "flex",
        alignItems: "center",
        width: "100%",
        padding: "12px 14px",
        background: "transparent",
        border: "none",
        color: "#ffffff",
        textAlign: "left",
        cursor: "pointer",
        borderRadius: "10px",
        fontSize: "14.5px",
        fontWeight: "600",
    },
};

export default Navbar;