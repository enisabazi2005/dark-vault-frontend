import React, { useState, useEffect } from "react";
import "../MyProfile/MyProfile.css";
import api from "../../api";
import { STORAGE_URL } from "../../api";
import { Link } from "react-router-dom";
import Notification from "../Notification/Notification";

const MyProfile = ({ updateNotificationCount }) => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const defaultBlankPhotoUrl =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  const [selectedStatus, setSelectedStatus] = useState("online");
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchUser = async () => {
      try {
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
        setSelectedStatus(response.data.status || "Online");
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [userId]);

  const handleStatusChange = async (status) => {
    try {
      setSelectedStatus(status);

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      await api.post(
        "/update-status",
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsModalOpen(false);
      console.log(`Status updated to: ${status}`);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const statusBorderColors = {
    online: "rgb(24, 181, 24)",
    offline: "rgb(208, 185, 57)",
    away: "rgb(72, 75, 72)",
    do_not_disturb: "rgb(166, 22, 29)",
  };

  const borderColor = statusBorderColors[selectedStatus] || "rgb(24, 181, 24)";

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-settings-wrapper">
      <div className="profile-settings">
        <div className="profile-info-row">
          <div className="profile-info-col profile-info-col-notification">
            <Notification updateNotificationCount={updateNotificationCount} />
          </div>
          <div
            className="profile-info-col"
            onClick={() => setIsModalOpen(true)}
          >
            <img
              src={
                user.picture
                  ? `${STORAGE_URL}/${user.picture}`
                  : `${defaultBlankPhotoUrl}`
              }
              alt={`${user.name} ${user.lastname}`}
              className="user-pic"
              style={{
                border: `3px solid ${borderColor}`,
              }}
            />
          </div>
          <div
            className="profile-info-col profile-info-col-user-names"
            onClick={() => setIsModalOpen(true)}
          >
            <h1 className="user-name">
              {user.name} {user.lastname}
            </h1>
            <p className="user-status">
              {selectedStatus
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase())}
            </p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="modal-overlay-status"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="modal-content-status"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Change Status</h2>
            <ul>
              {Object.keys(statusBorderColors).map((status) => (
                <li
                  key={status}
                  className={`status-option ${
                    selectedStatus === status ? "active-status" : ""
                  }`}
                  style={{
                    color: selectedStatus === status ? "white" : "black",
                    backgroundColor:
                      selectedStatus === status
                        ? statusBorderColors[status]
                        : "transparent",
                  }}
                  onClick={() => handleStatusChange(status)}
                >
                  {status
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </li>
              ))}
              <li onClick={() => setIsModalOpen(false)}>
                <Link className="settings" to="/dashboard/settings">
                  Settings
                </Link>
              </li>
            </ul>
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
