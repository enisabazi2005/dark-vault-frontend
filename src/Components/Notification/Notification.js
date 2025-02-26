import React, { useState, useEffect } from "react";
import api from "../../api";
import { PUSHER_APP_KEY, PUSHER_CLUSTER } from "../../api";
import Pusher from "pusher-js";

const Notification = () => {
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem("user_id");
  useEffect(() => {
    // Fetch user profile data
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
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Function to fetch unread messages
    const fetchUnreadMessages = async () => {
        try {
            const response = await api.get("/get-unread-messages");
            setUnreadMessages(response.data);
        } catch (error) {
            console.error("Error fetching unread messages:", error);
        } finally {
            setLoading(false);
        }
    };

    // Function to subscribe to Pusher and keep it active
    const subscribeToPusher = () => {
        const pusher = new Pusher(PUSHER_APP_KEY, {
            cluster: PUSHER_CLUSTER,
            encrypted: true,
        });

        // Subscribe to the correct channel
        const channel = pusher.subscribe('unread-messages-' + userId);

        console.log("Subscribed to unread-messages-" + userId);

        // Listen for new unread messages in real-time
        channel.bind('App\\Events\\UnreadMessagesEvent', (data) => {
            console.log("Received unread messages event", data);
        
            if (Array.isArray(data.notifications)) {
                // Only append new notifications if they are not already in the state
                setUnreadMessages((prevMessages) => {
                    const newMessages = data.notifications.filter(
                        (message) => !prevMessages.some((prev) => prev.id === message.id)
                    );
                    return [...prevMessages, ...newMessages];
                });
            }
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
          };
    };

    // Fetch unread messages when the component is mounted or when user changes
    fetchUnreadMessages();

    // Subscribe to Pusher and keep it active even if status changes
    const pusher = subscribeToPusher();

    // Cleanup when the component unmounts or user changes
    return () => {
        pusher.unsubscribe(`unread-messages-${userId}`);
    };
}, [user]); // Re-run only when user data changes

  const handleMarkAsRead = async () => {
    try {
      await api.post("/mark-notifications-read");
      setUnreadMessages([]); // Clear unread messages after marking as read
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading notifications...</p>
      ) : (
        <>
          {unreadMessages.length > 0 ? (
            <div>
              <h3>You have {unreadMessages.length} unread messages</h3>
              <ul>
                {unreadMessages.map((message, index) => (
                  <li key={index}>
                    {message.message} from {message.sender_id}
                  </li>
                ))}
              </ul>
              <button onClick={handleMarkAsRead}>Mark All as Read</button>
            </div>
          ) : (
            <p>No unread messages</p>
          )}
        </>
      )}
    </div>
  );
};

export default Notification;
