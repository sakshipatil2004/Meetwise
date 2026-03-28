import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem("user") || "null");

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    // ❌ Hide navbar on login & signup
    if (location.pathname === "/" || location.pathname === "/signup") {
        return null;
    }

    return (
        <div style={styles.navbar}>
            <div style={styles.left}>
                <h2 style={{ margin: 0 }}>MeetWise</h2>

                <Link to="/home" style={styles.link}>Home</Link>
                <Link to="/dashboard" style={styles.link}>Dashboard</Link>
            </div>

            <div style={styles.right}>
                <div style={styles.profile} onClick={() => setOpen(!open)}>
                    {user?.name || "User"} ⌄
                </div>

                {open && (
                    <div style={styles.dropdown}>
                        <p style={styles.dropdownItem}>{user?.email}</p>
                        <hr />
                        <p style={styles.dropdownItem} onClick={handleLogout}>
                            Logout
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    navbar: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "70px",
        background: "linear-gradient(135deg,#8a1e6f,#2564eb)",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 40px",
        color: "white",
        zIndex: 1000,
    },
    left: {
        display: "flex",
        alignItems: "center",
        gap: "25px",
    },
    link: {
        color: "white",
        textDecoration: "none",
        fontWeight: "500",
    },
    right: {
        position: "relative",
    },
    profile: {
        cursor: "pointer",
        fontWeight: "500",
    },
    dropdown: {
        position: "absolute",
        right: 0,
        top: "50px",
        background: "white",
        color: "black",
        borderRadius: "8px",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.36)",
        padding: "10px",
        minWidth: "180px",
    },
    dropdownItem: {
        margin: "8px 0",
        cursor: "pointer",
    },
};

export default Navbar;