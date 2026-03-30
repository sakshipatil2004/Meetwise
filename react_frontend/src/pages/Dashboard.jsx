import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [reports, setReports] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const reportsPerPage = 5;

    // 🔐 Auth Guard
    useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [user, navigate]);

    // 📥 Fetch Reports
    useEffect(() => {
        const fetchReports = async () => {
            try {
                if (!user || !user.id) return;

                const res = await fetch(
                    `http://127.0.0.1:8000/api/reports/${user.id}`
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

    // 📄 Pagination Logic
    const indexOfLast = currentPage * reportsPerPage;
    const indexOfFirst = indexOfLast - reportsPerPage;
    const currentReports = filteredReports.slice(
        indexOfFirst,
        indexOfLast
    );

    const totalPages = Math.ceil(
        filteredReports.length / reportsPerPage
    );

    // 🗑 Delete Report (Frontend only for now)
    const deleteReport = (reportId) => {
        const updatedReports = reports.filter(
            (r) => r.id !== reportId
        );
        setReports(updatedReports);
    };

    return (
        <>
            <Navbar />

            <div style={styles.container}>
                <h1>Dashboard Analytics</h1>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search reports..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.searchInput}
                />

                {/* Analytics */}
                <div style={styles.analytics}>
                    <div style={styles.card}>
                        <h3>Total Reports</h3>
                        <p>{reports.length}</p>
                    </div>

                    <div style={styles.card}>
                        <h3>Total Tasks</h3>
                        <p>
                            {reports.reduce(
                                (acc, r) =>
                                    acc +
                                    (r.tasks
                                        ? JSON.parse(r.tasks).length
                                        : 0),
                                0
                            )}
                        </p>
                    </div>
                </div>

                {/* Report History */}
                <h2 style={{ marginTop: "40px" }}>
                    Report History
                </h2>

                {currentReports.length === 0 ? (
                    <p>No reports found.</p>
                ) : (
                    currentReports.map((report, index) => (
                        <div
                            key={report.id}
                            style={styles.historyCard}
                        >
                            <div
                                onClick={() =>
                                    navigate(`/report/${report.id}`)
                                }
                                style={{ cursor: "pointer" }}
                            >
                                <h4>
                                    Report{" "}
                                    {indexOfFirst + index + 1}
                                </h4>
                                <p>
                                    {new Date(
                                        report.created_at
                                    ).toLocaleString()}
                                </p>
                            </div>

                            <button
                                style={styles.deleteBtn}
                                onClick={() =>
                                    deleteReport(report.id)
                                }
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}

                {/* Pagination */}
                <div style={styles.pagination}>
                    {Array.from(
                        { length: totalPages },
                        (_, i) => (
                            <button
                                key={i}
                                onClick={() =>
                                    setCurrentPage(i + 1)
                                }
                                style={{
                                    ...styles.pageBtn,
                                    background:
                                        currentPage === i + 1
                                            ? "#2564eb"
                                            : "#eee",
                                    color:
                                        currentPage === i + 1
                                            ? "white"
                                            : "black",
                                }}
                            >
                                {i + 1}
                            </button>
                        )
                    )}
                </div>
            </div>
        </>
    );
};

const styles = {
    container: {
        paddingTop: "110px",
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "110px 20px 40px",
    },
    searchInput: {
        width: "100%",
        padding: "10px",
        marginBottom: "20px",
        borderRadius: "6px",
        border: "1px solid #ddd",
    },
    analytics: {
        display: "flex",
        gap: "20px",
    },
    card: {
        flex: 1,
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
        textAlign: "center",
    },
    historyCard: {
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow:
            "0 5px 15px rgba(0,0,0,0.08)",
        marginTop: "15px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    deleteBtn: {
        padding: "6px 12px",
        borderRadius: "6px",
        border: "none",
        background: "#ef4444",
        color: "white",
        cursor: "pointer",
    },
    pagination: {
        marginTop: "20px",
        display: "flex",
        gap: "10px",
    },
    pageBtn: {
        padding: "6px 12px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
    },
};

export default Dashboard;