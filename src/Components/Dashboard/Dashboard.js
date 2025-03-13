import { PieChart } from "@mui/x-charts";
import {
  useGaugeState,
  GaugeContainer,
  GaugeReferenceArc,
  GaugeValueArc,
} from "@mui/x-charts";
import "../Dashboard/Dashboard.css";
import "@fontsource/roboto";
import api from "../../api";
import React, { useEffect, useState, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import MyProfile from "../MyProfile/MyProfile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faNetworkWired,
  faGrip,
  faBackward,
  faLock,
  faSquareEnvelope,
  faCircleInfo,
  faNoteSticky,
  faCommentDots,
  faArrowRightFromBracket,
  faPeopleGroup,
} from "@fortawesome/free-solid-svg-icons";
import Notification from "../Notification/Notification";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const [totalStored, setTotalStored] = useState(0);
  const MAX_STORAGE = 100;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [notificationCount, setNotificationCount] = useState(0);

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

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

  const handleLinkClick = () => {
    const container = document.querySelector(".container");
    if (container) {
      container.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [data, setData] = useState([
    { id: 0, value: 0, label: "Passwords" },
    { id: 1, value: 0, label: "Emails" },
    { id: 2, value: 0, label: "Private Info" },
    { id: 3, value: 0, label: "Notes" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [passwordsRes, emailsRes, privateInfosRes, notesRes] =
          await Promise.all([
            api.get("/store-passwords"),
            api.get("/store-emails"),
            api.get("/store-private-infos"),
            api.get("/store-notes"),
          ]);

        const passwordsCount = passwordsRes.data.length;
        const emailsCount = emailsRes.data.length;
        const privateInfosCount = privateInfosRes.data.length;
        const notesCount = notesRes.data.length;

        const total =
          passwordsCount + emailsCount + privateInfosCount + notesCount;
        if (total === 0) return;
        setTotalStored(total);

        setData([
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
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
          console.error("No user ID or token found");
          return;
        }

        const response = await api.get(`/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

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
        <circle cx={cx} cy={cy} r={5} fill="red" />
        <path
          d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
          stroke="red"
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

  // const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      navigate("/login");
    }
  }, [navigate]);
  return (
    <>
      {/* Sidebar */}
      <div className="myProfile">
        <MyProfile />
      </div>
      {!isMobile && (
        <aside
          id="default-sidebar"
          className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 bg-gray-50 dark:bg-gray-800"
          aria-label="Siderbar"
        >
          <div className="h-full px-3 py-4 overflow-y-auto">
            <ul>
              <li>
                <Link
                  to="/dashboard"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <FontAwesomeIcon icon={faNetworkWired} />
                  <span className="ms-3">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  to="store-password"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <FontAwesomeIcon icon={faLock} />
                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Store Password
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="store-email"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <FontAwesomeIcon icon={faSquareEnvelope} />
                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Store Emails
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="private-info"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <FontAwesomeIcon icon={faCircleInfo} />
                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Store Private Info
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="store-notes"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <FontAwesomeIcon icon={faNoteSticky} />
                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Store Notes
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="chatroom"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <FontAwesomeIcon icon={faCommentDots} />
                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Go to Chatroom
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="friends"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <FontAwesomeIcon icon={faPeopleGroup} />
                  <span className="flex-1 ms-3 whitespace-nowrap">Friends</span>
                </Link>
              </li>
              <li className="sign-out-list">
                <button onClick={handleLogout}>
                  <FontAwesomeIcon icon={faArrowRightFromBracket} />
                  Log Out
                </button>
              </li>
            </ul>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="ml-64 p-6 bg-gray-100 w-full">
        <Outlet />
        {location.pathname === "/dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Content Boxes */}
            <div className="bg-white p-4 rounded-lg shadow-lg">
              {data.length === 0 || data.every((item) => item.value === 0) ? (
                <p>Nothing is stored yet</p>
              ) : (
                <PieChart series={[{ data }]} width={400} height={200} />
              )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow-lg">
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
              <p>Total stored entities saved based on your storage</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold">
                Welcome Back{" "}
                <span>
                  {user ? `${user.name} ${user.lastname}` : "Loading..."}
                </span>
              </h2>
              <p>We missed your presence...</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold">Store anything you want</h2>
              <p>100% encrypted end-to-end</p>
            </div>
          </div>
        )}
      </main>
      {isNotificationModalOpen && (
        <div
          className="modal-overlay-notification"
          onClick={() => setIsNotificationModalOpen(false)}
        >
          <div
            className="modal-content-notification"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Notifications</h2>
            <p>Display notifications here...</p>
            <button
              className="close-btn"
              onClick={() => setIsNotificationModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isMobile && (
        <nav className="bottom-nav">
          <Link className="nigga" to="/dashboard" onClick={handleLinkClick}>
            <FontAwesomeIcon icon={faNetworkWired} /> Dashboard
          </Link>
          <Link className="dropdown-trigger" onClick={handleDropdownToggle}>
            <FontAwesomeIcon icon={faGrip} /> Stored
          </Link>
          {isDropdownOpen && (
            <div ref={dropdownRef} className="dropdown-menu">
              <Link
                to="#"
                onClick={() => setIsDropdownOpen(false)} 
              >
                <FontAwesomeIcon icon={faBackward} /> Back
              </Link>

              <Link to="store-password">
                <FontAwesomeIcon icon={faLock} /> Passwords
              </Link>
              <Link to="store-email">
                <FontAwesomeIcon icon={faSquareEnvelope} /> Email
              </Link>
              <Link to="private-info">
                <FontAwesomeIcon icon={faCircleInfo} /> Private Info
              </Link>
              <Link to="store-notes">
                <FontAwesomeIcon icon={faNoteSticky} /> Notes
              </Link>
            </div>
          )}

          <Link to="chatroom" onClick={handleLinkClick}>
            <FontAwesomeIcon icon={faCommentDots} /> Chat
          </Link>

          <span
            className="notification-mobile"
            onClick={() => setIsNotificationModalOpen(true)}
          >
            <Notification />
            Notification
          </span>

          <span className="profile-mobile">
            <MyProfile />{" "}
            {user && user.name && user.lastname
              ? `${user.name} ${user.lastname}`
              : ""}
          </span>
        </nav>
      )}
    </>
  );
};

export default Dashboard;
