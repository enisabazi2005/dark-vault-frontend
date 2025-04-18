import React, { useEffect, useState, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faNetworkWired,
  faGrip,
  faLock,
  faSquareEnvelope,
  faCircleInfo,
  faNoteSticky,
  faCommentDots,
  faArrowRightFromBracket,
  faPeopleGroup,
  faChartPie,
  faDatabase,
  faShieldAlt,
  faUserGroup,
  faArrowsRotate
} from "@fortawesome/free-solid-svg-icons";
import { PieChart } from "@mui/x-charts";
import {
  useGaugeState,
  GaugeContainer,
  GaugeReferenceArc,
  GaugeValueArc,
} from "@mui/x-charts";
import api from "../../api";
import MyProfile from "../MyProfile/MyProfile";
import Notification from "../Notification/Notification";
import Bot from "../Bot/Bot";
import DashboardSkeleton from "./DashboardSkeleton";
import Logo from "../../assets/images/Samira_Hadid-removebg-preview.png";
import "../Dashboard/Dashboard.css";
import useStorageStore from "../../Store/storageStore";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  // const { totalStored, updateTotalStored } = useStorageStore();
  const MAX_STORAGE = 5;
  // const MAX_STORAGE = 100;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  // const [data, setData] = useState([
  //   { id: 0, value: 0, label: "Passwords" },
  //   { id: 1, value: 0, label: "Emails" },
  //   { id: 2, value: 0, label: "Private Info" },
  //   { id: 3, value: 0, label: "Notes" },
  // ]);
  const { totalStored, updateTotalStored, data, updateChartData } = useStorageStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [passwordsRes, emailsRes, privateInfosRes, notesRes, userRes] =
          await Promise.all([
            api.get("/store-passwords"),
            api.get("/store-emails"),
            api.get("/store-private-infos"),
            api.get("/store-notes"),
            api.get(`/users/${localStorage.getItem("user_id")}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }),
          ]);

        const passwordsCount = passwordsRes.data.length;
        const emailsCount = emailsRes.data.length;
        const privateInfosCount = privateInfosRes.data.length;
        const notesCount = notesRes.data.length;

        const total =
          passwordsCount + emailsCount + privateInfosCount + notesCount;
        if (total === 0) return;
        updateTotalStored(total);

        updateChartData([
          {
            id: 0,
            value: (passwordsCount / total) * 100,
            label: "Passwords",
          },
          {
            id: 1,
            value: (emailsCount / total) * 100,
            label: "Emails",
          },
          {
            id: 2,
            value: (privateInfosCount / total) * 100,
            label: "Private Info",
          },
          {
            id: 3,
            value: (notesCount / total) * 100,
            label: "Notes",
          },
        ]);

        setUser(userRes.data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [updateTotalStored , updateChartData]);

  const refreshChart = async () => {
    try {
      setIsLoading(true);
      const [passwordsRes, emailsRes, privateInfosRes, notesRes] = await Promise.all([
        api.get("/store-passwords"),
        api.get("/store-emails"),
        api.get("/store-private-infos"),
        api.get("/store-notes"),
      ]);
  
      const passwordsCount = passwordsRes.data.length;
      const emailsCount = emailsRes.data.length;
      const privateInfosCount = privateInfosRes.data.length;
      const notesCount = notesRes.data.length;
  
      const total = passwordsCount + emailsCount + privateInfosCount + notesCount;
  
      // Update chart data based on current count
      updateChartData([
        { id: 0, value: (passwordsCount / total) * 100, label: "Passwords" },
        { id: 1, value: (emailsCount / total) * 100, label: "Emails" },
        { id: 2, value: (privateInfosCount / total) * 100, label: "Private Info" },
        { id: 3, value: (notesCount / total) * 100, label: "Notes" },
      ]);
    } catch (error) {
      console.error("Error refreshing chart data", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  function GaugePointer() {
    const { valueAngle, outerRadius, cx, cy } = useGaugeState();

    if (valueAngle === null) {
      return null;
    }

    const target = {
      x: cx + outerRadius * Math.sin(valueAngle),
      y: cy - outerRadius * Math.cos(valueAngle),
    };
    return (
      <g>
        <circle cx={cx} cy={cy} r={5} fill="#3498db" />
        <path
          d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
          stroke="#3498db"
          strokeWidth={3}
        />
      </g>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      navigate("/login");
    }
  }, [navigate]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="dashboard-container">
      <div className="myProfile">
        <MyProfile />
      </div>
      {/* Sidebar */}
      {!isMobile && (
        <aside className="sidebar">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <img src={Logo} alt="Logo" className="sidebar-logo" />
            </div>
            <nav className="sidebar-nav">
              <Link to="/dashboard" className="nav-item"   state={{ MAX_STORAGE, totalStored }}>
                <FontAwesomeIcon icon={faNetworkWired} />
                <span>Dashboard</span>
              </Link>
              <Link to="store-password" className="nav-item"   state={{ MAX_STORAGE, totalStored }}>
                <FontAwesomeIcon icon={faLock} />
                <span>Store Password</span>
              </Link>
              <Link to="store-email" className="nav-item"   state={{ MAX_STORAGE,totalStored }}>
                <FontAwesomeIcon icon={faSquareEnvelope} />
                <span>Store Emails</span>
              </Link>
              <Link to="private-info" className="nav-item"   state={{ MAX_STORAGE,totalStored }}>
                <FontAwesomeIcon icon={faCircleInfo} />
                <span>Store Private Info</span>
              </Link>
              <Link to="store-notes" className="nav-item"   state={{ MAX_STORAGE,totalStored }}>
                <FontAwesomeIcon icon={faNoteSticky} />
                <span>Store Notes</span>
              </Link>
              <Link to="chatroom" className="nav-item">
                <FontAwesomeIcon icon={faCommentDots} />
                <span>Go to Chatroom</span>
              </Link>
              <Link to="friends" className="nav-item">
                <FontAwesomeIcon icon={faUserGroup} />
                <span>Friends</span>
              </Link>
              <Link to="groups" className="nav-item">
                <FontAwesomeIcon icon={faPeopleGroup} />
                <span>Groups</span>
              </Link>
            </nav>
            <button className="logout-button" onClick={handleLogout}>
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
              <span>Log Out</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
        {location.pathname === "/dashboard" && (
          <div className="dashboard-grid">
            <Bot />
            {/* Welcome Card */}
            <div className="dashboard-card welcome-card">
              <div className="card-content">
                <h2>Welcome Back</h2>
                <div className="user-name">
                  {user ? `${user.name} ${user.lastname}` : "Loading..."}
                </div>
                <p className="welcome-message">
                  We're glad to see you again. Your vault is secure and ready to use.
                </p>
              </div>
            </div>

            {/* Storage Usage Card */}
            <div className="dashboard-card storage-card">
              <div className="card-header">
                <FontAwesomeIcon icon={faDatabase} />
                <h3>Storage Usage</h3>
              </div>
              <div className="card-content">
                <GaugeContainer
                  width={200}
                  height={200}
                  startAngle={-110}
                  endAngle={110}
                  value={(totalStored / MAX_STORAGE) * 100}
                >
                  <GaugeReferenceArc />
                  <GaugeValueArc />
                  <GaugePointer />
                </GaugeContainer>
                <p className="storage-info">
                  {totalStored} items stored out of {MAX_STORAGE}
                </p>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="card-header">
                <FontAwesomeIcon icon={faChartPie} />
                <h3>Data Distribution</h3>
              </div>
              <div className="card-content card-content-charts">
              {totalStored === 0 ? (
                  <p className="empty-state">Nothing is stored yet</p>
                ) : (
                  <PieChart  series={[{ data }]} width={400} height={200} />
                )}
                 <button className="refresh-chart-button" onClick={refreshChart}>
                    <FontAwesomeIcon icon={faArrowsRotate} />
                </button>
              </div>
            </div>

            {/* Security Status Card */}
            <div className="dashboard-card">
              <div className="card-header">
                <FontAwesomeIcon icon={faShieldAlt} />
                <h3>Security Status</h3>
              </div>
              <div className="card-content">
                <div className="security-features">
                  <div className="feature">
                    <FontAwesomeIcon icon={faLock} className="feature-icon" />
                    <span>End-to-End Encryption</span>
                  </div>
                  <div className="feature">
                    <FontAwesomeIcon icon={faShieldAlt} className="feature-icon" />
                    <span>Secure Storage</span>
                  </div>
                  <div className="feature">
                    <FontAwesomeIcon icon={faDatabase} className="feature-icon" />
                    <span>Data Backup</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Navigation */}
      {isMobile && (
        <nav className="bottom-nav">
          <Link to="/dashboard" className="nav-item">
            <FontAwesomeIcon icon={faNetworkWired} />
            <span>Dashboard</span>
          </Link>
          <div className="dropdown-container">
            <button className="nav-item" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <FontAwesomeIcon icon={faGrip} />
              <span>Stored</span>
            </button>
            {isDropdownOpen && (
              <div ref={dropdownRef} className="dropdown-menu">
                <Link to="store-password" className="dropdown-item">
                  <FontAwesomeIcon icon={faLock} />
                  <span>Passwords</span>
                </Link>
                <Link to="store-email" className="dropdown-item">
                  <FontAwesomeIcon icon={faSquareEnvelope} />
                  <span>Email</span>
                </Link>
                <Link to="private-info" className="dropdown-item">
                  <FontAwesomeIcon icon={faCircleInfo} />
                  <span>Private Info</span>
                </Link>
                <Link to="store-notes" className="dropdown-item">
                  <FontAwesomeIcon icon={faNoteSticky} />
                  <span>Notes</span>
                </Link>
              </div>
            )}
          </div>
          <Link to="chatroom" className="nav-item">
            <FontAwesomeIcon icon={faCommentDots} />
            <span>Chat</span>
          </Link>
          <span className="notification-mobile">
            <Notification />
            <span>Notifications</span>
          </span>
          <span className="profile-mobile">
            <MyProfile />
            <span>{user ? `${user.name} ${user.lastname}` : ""}</span>
          </span>
        </nav>
      )}
    </div>
  );
};

export default Dashboard;
