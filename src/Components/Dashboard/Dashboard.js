// import * as React from "react";
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
import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import MyProfile from "../MyProfile/MyProfile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNetworkWired, faLock, faSquareEnvelope, faCircleInfo, faNoteSticky, faCommentDots, faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";




const Dashboard = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const [totalStored, setTotalStored] = useState(0);
  const MAX_STORAGE = 100;

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

  const navigate = useNavigate();

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
      <aside
        id="default-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 bg-gray-50 dark:bg-gray-800"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            <li>
              <Link
                to="/dashboard"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                {/* Dashboard Icon */}
                <FontAwesomeIcon icon={faNetworkWired} />

                <span className="ms-3">Dashboard</span>
              </Link>
            </li>
            {/* Other List Items */}
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
            <li className="sign-out-list">
              <Link to="sign-out">
              <FontAwesomeIcon icon={faArrowRightFromBracket} />

                <button className="log-out" onClick={handleLogout}>
                  Log Out
                </button>
              </Link>
            </li>
          </ul>
        </div>
      </aside>

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
    </>
  );
};

export default Dashboard;
