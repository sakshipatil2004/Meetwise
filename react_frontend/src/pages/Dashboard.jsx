import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Dashboard = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [reports, setReports] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const reportsPerPage = 5;

    // 🔐 Load User from localStorage properly
    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            navigate("/login");
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
    }, [navigate]);

    // 📥 Fetch Reports (FIXED ROUTE)
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
        <>
            <Navbar />

            <div style={styles.container}>
                <h1>Dashboard Analytics</h1>

                {user && (
                    <h3 style={{ marginBottom: "20px" }}>
                        Welcome, {user.name}
                    </h3>
                )}

                <input
                    type="text"
                    placeholder="Search reports..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.searchInput}
                />

                <div style={styles.analytics}>
                    <div style={styles.card}>
                        <h3>Total Reports</h3>
                        <p>{reports.length}</p>
                    </div>
                </div>

                <h2 style={{ marginTop: "40px" }}>Report History</h2>

                {currentReports.length === 0 ? (
                    <p>No reports found.</p>
                ) : (
                    currentReports.map((report, index) => (
                        <div key={report.id} style={styles.historyCard}>
                            <div
                                onClick={() =>
                                    navigate(`/report/${report.id}`)
                                }
                                style={{ cursor: "pointer" }}
                            >
                                <h4>
                                    Report {indexOfFirst + index + 1}
                                </h4>

                                <p>
                                    {new Date(
                                        report.created_at
                                    ).toLocaleString()}
                                </p>

                                {report.pdf_url && (
                                    <a
                                        href={report.pdf_url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        View PDF
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                )}

                <div style={styles.pagination}>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
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
                    ))}
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
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        textAlign: "center",
    },
    historyCard: {
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
        marginTop: "15px",
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