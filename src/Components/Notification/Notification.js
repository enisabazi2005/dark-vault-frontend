import React, { useState, useEffect, useRef } from "react";
import api from "../../api";
import { PUSHER_APP_KEY, PUSHER_CLUSTER } from "../../api";
import Pusher from "pusher-js";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../Notification/Notification.css";
import notificationSound from "../../assets/images/message-sent.wav";
import { useStore } from "../../Store/store";

const Notification = () => {
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [, setLoading] = useState(true);
  const [, setUser] = useState(null);
  const userId = localStorage.getItem("user_id");
  const [count, setCount] = useState(0);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const audioRef = useRef(null);
  const previousCountRef = useRef(0);
  const [pendingRequests, setPendingRequests] = useState([]);
  const { myProfile } = useStore();
  const combinedNotifications = [...pendingRequests, ...unreadMessages].sort(
    (a, b) => b.id - a.id
  );

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
        previousCountRef.current = response.data.length;
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

        const newCount = count + data.notifications.length;
        setCount(newCount);

        if (
          data.notifications.length > 0 &&
          newCount > previousCountRef.current &&
          audioRef.current
        ) {
          audioRef.current.currentTime = 0; 
          audioRef.current.play().catch((error) => {
            console.error("Error playing notification sound:", error);
          });
          previousCountRef.current = newCount;
        }
      }
    });
    if (!myProfile) return;

    const friendRequestChannel = pusher.subscribe(
      `friend-request.${myProfile.request_id}`
    );
    friendRequestChannel.bind("FriendRequestSent", (data) => {
      const newRequest = {
        id: Date.now(),
        type: "request",
        friend_name: data.sender.name,
        picture: data.sender.picture,
      };

      setPendingRequests((prev) => [...prev, newRequest]);
      console.log(pendingRequests, "pendingRequests");
      setCount((prev) => prev + 1);

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    });
    console.log(pendingRequests, "pendingRequests");

    const friendAcceptChannel = pusher.subscribe(
      `friend-accept.${myProfile.request_id}`
    );
    friendAcceptChannel.bind("FriendRequestAccepted", (data) => {
      const isSender = data.sender.request_id === myProfile.request_id;

      const message = isSender
        ? `You are now friends with ${data.receiver.name}`
        : `You accepted ${data.sender.name}'s friend request`;

      const newAcceptanceNotification = {
        id: Date.now(),
        type: "accepted",
        friend_name: isSender ? data.receiver.name : data.sender.name,
        message,
      };

      setUnreadMessages((prev) => [...prev, newAcceptanceNotification]);

      if (!isSender) {
        setPendingRequests((prev) => {
          const updated = prev.filter(
            (req) =>
              req.friend_name !== (data.sender.name || data.receiver.name)
          );
          const removedCount = prev.length - updated.length;
          setCount((prevCount) => prevCount + 1 - removedCount);
          return updated;
        });
      } else {
        setCount((prevCount) => prevCount + 1);
      }

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    });

    return () => {
      channel.unbind("App\\Events\\UnreadMessagesEvent");
      pusher.unsubscribe(`unread-messages-${userId}`);

      friendRequestChannel.unbind("FriendRequestSent");
      pusher.unsubscribe(`friend-request.${userId}`);

      friendAcceptChannel.unbind("FriendRequestAccepted");
      pusher.unsubscribe(`friend-accept.${userId}`);
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
            {combinedNotifications.length > 0 ? (
              <ul>
                {combinedNotifications.map((notification, index) => {
                  if (notification.type === "request") {
                    return (
                      <li key={`notif-${index}`} className="custom-new-message">
                        <strong>{notification.friend_name}</strong> has sent you
                        a friend request.
                      </li>
                    );
                  } else if (notification.type === "accepted") {
                    return (
                      <li key={`notif-${index}`} className="custom-new-message">
                        {notification.message}
                      </li>
                    );
                  } else {
                    return (
                      <li key={`notif-${index}`} className="custom-new-message">
                        You have a message from{" "}
                        <strong>{notification.sender_name}</strong>:{" "}
                        {notification.message}
                      </li>
                    );
                  }
                })}
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
                  No Unread Messages
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
