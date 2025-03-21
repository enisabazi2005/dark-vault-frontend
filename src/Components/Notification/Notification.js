import React, { useState, useEffect, useRef } from "react";
import api from "../../api";
import { PUSHER_APP_KEY, PUSHER_CLUSTER } from "../../api";
import Pusher from "pusher-js";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../Notification/Notification.css";
import notificationSound from "../../assets/images/notification.mp3";

const Notification = () => {
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [, setLoading] = useState(true);
  const [, setUser] = useState(null);
  const userId = localStorage.getItem("user_id");
  const [count, setCount] = useState(0);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const audioRef = useRef(null);

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

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadMessages = async () => {
      try {
        const response = await api.get("/get-unread-messages");
        setUnreadMessages(response.data);
        setCount(response.data.length);
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      } finally {
        setLoading(false);
      }
    };

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
        setCount((prevCount) => prevCount + data.notifications.length);
        
        // Play notification sound only when new messages arrive
        if (data.notifications.length > 0 && audioRef.current) {
          audioRef.current.play().catch(error => {
            console.error("Error playing notification sound:", error);
          });
        }
      }
    });

    return () => {
      channel.unbind("App\\Events\\UnreadMessagesEvent");
      pusher.unsubscribe(`unread-messages-${userId}`);
    };
  }, [userId]);

  const handleMarkAsRead = async () => {
    try {
      const response = await api.post("/mark-notifications-read");

      if (response) {
        setUnreadMessages([]);
        setCount(0);
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleBellClick = () => {
    setIsNotificationModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsNotificationModalOpen(false);
  };

  return (
    <div>
      <audio ref={audioRef} src={notificationSound} preload="auto" />
      <div className="notificationIconContainer" onClick={handleBellClick}>
        <FontAwesomeIcon icon={faBell} size="2x" className="bellIcon" />
        {count > 0 ? (
          <span className="notificationCount">{count}</span>
        ) : (
          <span className="no-notificationCount">0</span>
        )}
      </div>

      {isNotificationModalOpen && (
        <div className="custom-modal-overlay" onClick={handleCloseModal}>
          <div
            className="custom-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Notifications</h2>
            {unreadMessages.length > 0 ? (
              <ul>
                {unreadMessages.map((message, index) => (
                  <li key={index} className="custom-new-message">
                    You have a message from{" "}
                    <strong>{message.sender_name}</strong>: {message.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No unread messages.</p>
            )}
            {unreadMessages.length > 0 ? (
              <div className="custom-mark-as-read-section">
                <button
                  className="custom-mark-as-read-btn"
                  onClick={handleMarkAsRead}
                >
                  Mark as Read
                </button>
              </div>
            ) : (
              <div className="custom-mark-as-read-section">
                <button className="custom-mark-as-read-btn">
                  No Notifications
                </button>
              </div>
            )}
            <button className="custom-close-btn" onClick={handleCloseModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
