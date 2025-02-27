import React, { useState, useEffect } from "react";
import api from "../../api";
import { PUSHER_APP_KEY, PUSHER_CLUSTER } from "../../api";
import Pusher from "pusher-js";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../Notification/Notification.css";

const Notification = ({count}) => {
  const [, setUnreadMessages] = useState([]);
  const [, setLoading] = useState(true);
  const [, setUser] = useState(null);
  const userId = localStorage.getItem("user_id"); 

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
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
  }, [userId]); 

  const fetchUnreadMessages = async () => {
    try {
      const response = await api.get("/get-unread-messages");
      setUnreadMessages(response.data);
      console.log("📩 Fetched unread messages:", response.data);
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return; 

    fetchUnreadMessages(); 

    const pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: true,
    });

    const channel = pusher.subscribe(`unread-messages-${userId}`);

    channel.bind("App\\Events\\UnreadMessagesEvent", (data) => {
      if (Array.isArray(data.notifications)) {
        setUnreadMessages((prevMessages) => {
          const newMessages = data.notifications.filter(
            (message) => !prevMessages.some((prev) => prev.id === message.id)
          );
          return [...newMessages, ...prevMessages]; 
        });
      }
    });
    
    return () => {
      channel.unbind("App\\Events\\UnreadMessagesEvent");
      pusher.unsubscribe(`unread-messages-${userId}`);
    };
  }, [userId]);

  return (
    <div>
      <div className="notificationIconContainer">
        <FontAwesomeIcon
          icon={faBell}
          size="2x"
          className="bellIcon"
        />
        {count > 0 ? (
        <span className="notificationCount">{count}</span>
      ) : (
        <span className="no-notificationCount">0</span>
      )}
      </div>
    </div>
  );
};

export default Notification;
