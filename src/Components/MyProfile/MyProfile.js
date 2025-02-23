import React from "react";
import { useNavigate } from "react-router-dom";
import "../MyProfile/MyProfile.css";
import { useState, useEffect } from "react";
import api from "../../api";
import { STORAGE_URL } from "../../api";
import { Link } from "react-router-dom";

const MyProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isHovered , setIsHovered] = useState(false);
  const defaultBlankPhotoUrl =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  const [selectedStatus , setSelectedStatus] = useState("online");

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
        setSelectedStatus(response.data.status || "Online");
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

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
    <div
        className="profile-info-row"
        onMouseEnter={() => setIsHovered(true)}  
        onMouseLeave={() => setIsHovered(false)} 
        style={{
          padding: isHovered ? "10px 10px 250px 10px" : "10px", 
        }}
      >
        <div className="profile-info-col">
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
        <div className="profile-info-col">
          <h1 className="user-name">
            {user.name} {user.lastname}
          </h1>
          <p className="user-status">
            {selectedStatus.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
          </p>

        </div>

        {isHovered && (
          <div className="dropdown-menu">
            <ul>
              <li 
              className="status-online"
              onClick={() => handleStatusChange("online")}
                >Online</li>
              <li className="status-offline"
              onClick={() => handleStatusChange("offline")}
                >Offline</li>
              <li className="status-away"
              onClick={() => handleStatusChange("away")}
                >Away</li>
              <li className="status-do-not-disturb"
              onClick={() => handleStatusChange("do_not_disturb")}
                >Do Not Disturb</li>
              <li>
              <Link className="settings" to="/dashboard/settings">Settings</Link>
                
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
   </div>
  );
};

export default MyProfile;
