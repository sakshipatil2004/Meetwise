import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Dashboard = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [reports, setReports] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const reportsPerPage = 6; // Grid fits 6 nicely (3x2 or 2x3)

    // 🔐 Load User from localStorage properly
    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            navigate("/");
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
    }, [navigate]);

    // 📥 Fetch Reports
    useEffect(() => {
        const fetchReports = async () => {
            try {
                if (!user || !user.id) return;

                const res = await fetch(
                    `http://127.0.0.1:8000/api/reports/user/${user.id}`
                );

                if (!res.ok) {
                    throw new Error("Failed to fetch reports");
                }

                const data = await res.json();
                setReports(data);
            } catch (error) {
                console.error("Error fetching reports:", error);
            }
        };

        fetchReports();
    }, [user]);

    // 🔍 Filter Reports
    const filteredReports = reports.filter((report, index) =>
        `Report ${index + 1}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    // 📄 Pagination
    const indexOfLast = currentPage * reportsPerPage;
    const indexOfFirst = indexOfLast - reportsPerPage;
    const currentReports = filteredReports.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

    return (
        <div className="animated-bg" style={{ minHeight: "100vh" }}>
            <Navbar />

            <div style={styles.container}>
                {/* Animated Background Elements matching Home exactly */}
                <div className="blobs">
                    <div style={{...styles.blob, top: '15%', left: '5%', background: '#41005b', animationDelay: '0s'}}></div>
                    <div style={{...styles.blob, bottom: '20%', right: '5%', background: '#4c1c62', animationDelay: '2s', width: '400px', height: '400px'}}></div>
                    <div style={{...styles.blob, top: '40%', left: '50%', background: '#a875ff', animationDelay: '4s', width: '250px', height: '250px', filter: 'blur(130px)', opacity: 0.15}}></div>
                </div>

                {/* Dashboard Header */}
                <div className="input-animation delay-100" style={styles.headerBlock}>
                    <div>
                        <h1 style={styles.pageTitle}>Dashboard Analytics</h1>
                        {user && (
                            <p style={styles.welcomeText}>
                                Welcome back, <span style={{color: '#fff', fontWeight: '700'}}>{user.name}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Top Analytics Panel */}
                <div className="glossy-glass-card input-animation delay-200" style={styles.topSection}>
                    <div className="gloss-sweep"></div>
                    
                    <div style={styles.analytics}>
                        <div style={styles.statCard}>
                            <div style={styles.iconBox} className="glow-pulse-soft">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: '#e5bfff'}}>
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                            </div>
                            <div style={{textAlign: 'left'}}>
                                <h3 style={styles.statTitle}>Total Generated Reports</h3>
                                <p style={styles.statValue}>{reports.length}</p>
                            </div>
                        </div>
                    </div>

                    <div style={styles.searchWrapper}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.searchIcon}>
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Find a specific report..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="glossy-input"
                            style={styles.searchInput}
                        />
                    </div>
                </div>

                <div className="input-animation delay-300" style={styles.sectionHeader}>
                    <h2 style={styles.historyTitle}>Your Meeting History</h2>
                    <div style={{height: '1px', background: 'rgba(255,255,255,0.1)', flexGrow: 1, marginLeft: '20px'}}></div>
                </div>

                <div className="input-animation delay-400">
                    {currentReports.length === 0 ? (
                        <div className="glossy-glass-card" style={styles.emptyState}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: "16px"}}>
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            <p style={{fontSize: '16px', fontWeight: '500', margin: 0}}>No reports generated yet.</p>
                            <p style={{fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '8px'}}>Head to the Home page to upload your first audio file.</p>
                        </div>
                    ) : (
                        <div style={styles.grid}>
                            {currentReports.map((report, index) => (
                                <div 
                                    key={report.id} 
                                    className="glossy-report-card" 
                                    style={styles.historyCard}
                                    onClick={() => navigate(`/report/${report.id}`)}
                                >
                                    <div style={styles.cardContent}>
                                        <div style={styles.cardHeader}>
                                            <div style={styles.iconCircle}>
                                                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                                </svg>
                                            </div>
                                            <span style={styles.dateLabel}>
                                                {new Date(report.created_at).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        <h4 style={styles.reportTitle}>Report #{indexOfFirst + index + 1}</h4>
                                        <p style={styles.timeLabel}>
                                            Generated at {new Date(report.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>

                                        <div style={styles.cardActions}>
                                            <span style={styles.viewDetailsText}>
                                                View Details
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chevron-icon">
                                                    <polyline points="9 18 15 12 9 6"></polyline>
                                                </svg>
                                            </span>
                                            
                                            {report.pdf_url && (
                                                <a
                                                    href={report.pdf_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="pdf-download-btn"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    PDF
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div style={styles.pagination} className="input-animation delay-400">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <style>
                {`
                    /* Fluid background animation matching auth pages */
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

                    .blobs div {
                        position: fixed; /* Keep blobs fixed during scroll */
                        animation: float 8s ease-in-out infinite alternate;
                        pointer-events: none;
                    }

                    @keyframes slideInUp {
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    .input-animation {
                        opacity: 0;
                        animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        position: relative;
                        z-index: 2;
                    }
                    
                    .delay-100 { animation-delay: 0.05s; }
                    .delay-200 { animation-delay: 0.10s; }
                    .delay-300 { animation-delay: 0.15s; }
                    .delay-400 { animation-delay: 0.20s; }

                    /* Lighter Glossy Glassmorphism Base */
                    .glossy-glass-card {
                        background: linear-gradient(135deg, rgba(93, 35, 120, 0.7) 0%, rgba(76, 28, 98, 0.45) 100%);
                        backdrop-filter: blur(28px);
                        -webkit-backdrop-filter: blur(28px);
                        border-radius: 20px;
                        border-top: 1.5px solid rgba(255, 255, 255, 0.45);
                        border-left: 1.5px solid rgba(255, 255, 255, 0.25);
                        border-right: 0.5px solid rgba(255, 255, 255, 0.08);
                        border-bottom: 0.5px solid rgba(255, 255, 255, 0.08);
                        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.05);
                        position: relative;
                        overflow: hidden;
                    }

                    /* Interactive Micro-cards for Grid */
                    .glossy-report-card {
                        background: linear-gradient(135deg, rgba(93, 35, 120, 0.4) 0%, rgba(76, 28, 98, 0.2) 100%);
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                        border-radius: 16px;
                        border-top: 1px solid rgba(255, 255, 255, 0.2);
                        border-left: 1px solid rgba(255, 255, 255, 0.15);
                        border-right: 1px solid rgba(255, 255, 255, 0.05);
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                        position: relative;
                        overflow: hidden;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }

                    .glossy-report-card:hover {
                        transform: translateY(-5px);
                        background: linear-gradient(135deg, rgba(168, 117, 255, 0.3) 0%, rgba(93, 35, 120, 0.4) 100%);
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(255,255,255,0.1);
                        border-top: 1px solid rgba(255, 255, 255, 0.4);
                        border-left: 1px solid rgba(255, 255, 255, 0.3);
                    }

                    .glossy-report-card:hover .chevron-icon {
                        transform: translateX(4px);
                    }

                    .chevron-icon {
                        transition: transform 0.2s ease;
                        margin-left: 4px;
                    }

                    /* Glossy Input Reused */
                    .glossy-input {
                        background: rgba(0, 0, 0, 0.2) !important;
                        border: 1px solid rgba(255, 255, 255, 0.15) !important;
                        box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);
                        transition: all 0.3s ease !important;
                        color: #ffffff;
                        outline: none;
                    }
                    .glossy-input:focus {
                        border-color: #e5bfff !important;
                        box-shadow: 0 0 0 3px rgba(229, 191, 255, 0.2), inset 0 2px 5px rgba(0,0,0,0.3) !important;
                        background: rgba(0, 0, 0, 0.35) !important;
                    }
                    .glossy-input::placeholder {
                        color: rgba(255, 255, 255, 0.5) !important;
                    }

                    .glow-pulse-soft {
                        box-shadow: 0 0 15px rgba(229, 191, 255, 0.2), inset 0 0 10px rgba(229, 191, 255, 0.1);
                        animation: pulseSoft 3s infinite alternate;
                    }

                    @keyframes pulseSoft {
                        from { box-shadow: 0 0 10px rgba(229, 191, 255, 0.2); }
                        to { box-shadow: 0 0 20px rgba(229, 191, 255, 0.4); }
                    }

                    /* Report Actions */
                    .pdf-download-btn {
                        display: flex;
                        alignItems: center;
                        background: linear-gradient(135deg, rgba(229, 191, 255, 0.2), rgba(168, 117, 255, 0.1));
                        border: 1px solid rgba(255,255,255,0.2);
                        padding: 6px 14px;
                        border-radius: 8px;
                        font-size: 13px;
                        font-weight: 600;
                        color: #e5bfff;
                        text-decoration: none;
                        transition: all 0.2s ease;
                    }
                    .pdf-download-btn:hover {
                        background: linear-gradient(135deg, #a875ff, #e5bfff);
                        color: #230030;
                        transform: translateY(-1px);
                    }

                    /* Pagination */
                    .page-btn {
                        width: 38px;
                        height: 38px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 10px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 15px;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        color: rgba(255,255,255,0.7);
                        transition: all 0.2s ease;
                    }
                    .page-btn:hover {
                        background: rgba(255, 255, 255, 0.15);
                        color: #fff;
                    }
                    .page-btn.active {
                        background: linear-gradient(135deg, #a875ff, #e5bfff);
                        color: #230030;
                        border-color: #fff;
                        box-shadow: 0 4px 10px rgba(229, 191, 255, 0.3);
                    }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: {
        paddingTop: "40px", /* Spacer for navbar */
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "100px 24px 60px",
        position: "relative",
        fontFamily: "'Inter', sans-serif"
    },
    blob: {
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        filter: 'blur(100px)',
        zIndex: 0,
    },
    headerBlock: {
        marginBottom: "36px",
    },
    pageTitle: {
        fontSize: "36px",
        margin: "0 0 6px 0",
        fontWeight: "800",
        background: "linear-gradient(135deg, #ffffff, #e5bfff)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "-0.5px"
    },
    welcomeText: {
        fontSize: "16px",
        color: "rgba(255,255,255,0.75)",
        margin: 0,
    },
    topSection: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "24px",
        padding: "32px 36px",
        marginBottom: "48px",
    },
    analytics: {
        display: "flex",
        flex: "1 1 300px"
    },
    statCard: {
        display: "flex",
        alignItems: "center",
        gap: "24px",
    },
    iconBox: {
        width: "60px",
        height: "60px",
        borderRadius: "16px",
        background: "rgba(0, 0, 0, 0.2)",
        border: "1px solid rgba(229, 191, 255, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    statTitle: {
        fontSize: "13px",
        fontWeight: "600",
        color: "rgba(255,255,255,0.7)",
        margin: "0 0 6px 0",
        textTransform: "uppercase",
        letterSpacing: "1px"
    },
    statValue: {
        fontSize: "36px",
        fontWeight: "800",
        margin: 0,
        color: "#ffffff",
        lineHeight: 1
    },
    searchWrapper: {
        position: "relative",
        flex: "1 1 300px",
        maxWidth: "400px"
    },
    searchIcon: {
        position: "absolute",
        left: "16px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "rgba(255,255,255,0.5)",
        zIndex: 2,
    },
    searchInput: {
        width: "100%",
        padding: "16px 20px 16px 46px",
        borderRadius: "14px",
        fontSize: "15px",
    },
    sectionHeader: {
        display: "flex",
        alignItems: "center",
        marginBottom: "24px",
    },
    historyTitle: {
        fontSize: "22px",
        margin: 0,
        fontWeight: "700",
        color: "#ffffff"
    },
    emptyState: {
        padding: "60px 40px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "24px",
    },
    historyCard: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
    },
    cardContent: {
        padding: "24px",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
    },
    iconCircle: {
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#e5bfff"
    },
    reportTitle: {
        margin: "0 0 6px 0",
        fontSize: "18px",
        fontWeight: "700",
        color: "#ffffff"
    },
    dateLabel: {
        fontSize: "12px",
        fontWeight: "600",
        background: "rgba(0, 0, 0, 0.3)",
        padding: "6px 10px",
        borderRadius: "8px",
        color: "rgba(255,255,255,0.9)",
        border: "1px solid rgba(255,255,255,0.05)"
    },
    timeLabel: {
        margin: "0 0 24px 0",
        fontSize: "13px",
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.5)",
    },
    cardActions: {
        marginTop: "auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        paddingTop: "20px",
    },
    viewDetailsText: {
        fontWeight: "600", 
        fontSize: "14px", 
        display: "flex", 
        alignItems: "center", 
        color: "#e5bfff"
    },
    pagination: {
        marginTop: "40px",
        display: "flex",
        justifyContent: "center",
        gap: "10px",
    },
};

export default Dashboard;