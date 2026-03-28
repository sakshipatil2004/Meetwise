import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ReportDetails from "./pages/ReportDetails";

function App() {
  const location = useLocation();

  // Hide navbar on login & signup
  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/signup";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report/:jobId" element={<ReportDetails />} />
      </Routes>
    </>
  );
}

export default App;