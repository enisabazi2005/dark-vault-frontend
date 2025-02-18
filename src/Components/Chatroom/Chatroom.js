import React, { useState, useEffect } from "react";
import "../Chatroom/Chatroom.css";
import api from "../../api";
import { STORAGE_URL } from "../../api";
import Pusher from "pusher-js";
import Echo from "laravel-echo";

const Chatroom = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [message, setMessage] = useState(""); // State for message input
  const [messages, setMessages] = useState([]); // Default to an empty array

  const defaultBlankPhotoUrl =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  const requestId = localStorage.getItem("request_id");
  const userId = localStorage.getItem("user_id");
  const [senderRequestId, setSenderRequestId] = useState([]);
  const [recieverRequestId, setRecieverReqeustId] = useState([]);

  useEffect(() => {
    if (!requestId || !selectedUser) return;

    const fetchMessages = async () => {
      try {
        const response = await api.get(
          `/messages/${userId}/${selectedUser.id}`
        );
        // const senderRequestId = [];
        // const receiverRequestId = [];
        const messages = [];

        // Loop through the response data to extract sender_id, receiver_id, and message
        response.data.forEach((message) => {
          senderRequestId.push(message.sender_id);
          recieverRequestId.push(message.receiver_id);
          messages.push(message.message);
        });

        // Now you have your separated arrays
        console.log(senderRequestId, recieverRequestId, messages);

        // Set your state here to update the UI or use these variables further
        setMessages(messages); // Assuming you only need to display messages
        // Optionally set sender and receiver IDs as needed
        setSenderRequestId(senderRequestId);
        setRecieverReqeustId(recieverRequestId);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]); // Clear messages on error
      }
    };

    fetchMessages();
  }, [selectedUser, requestId]);

  useEffect(() => {
    if (!requestId) {
      console.error("Request ID is not available");
      return;
    }
    // Laravel Echo setup to listen for the new message event
    const echo = new Echo({
      broadcaster: "pusher",
      key: "5fa2841f32689bcde49e",
      cluster: "eu",
      forceTLS: true,
    });

    // Listen for new messages on the user's channel
    echo
      .channel(`chatroom.${requestId}`)
      .listen("App\\Events\\NewMessage", (data) => {
        console.log("Received new message:", data);

        // Append the new message to the existing messages list
        setMessages((prevMessages) => {
          const updatedMessages = [
            ...prevMessages,
            {
              message: data.message.message, // Assuming 'message' is inside the 'data' object
              sender_id: data.message.sender_id,
              reciever_id: data.message.reciever_id,
              dark_users_id: data.dark_users_id,
            },
          ];

          return updatedMessages;
        });
      });

    return () => {
      echo.leaveChannel(`chatroom.${requestId}`);
      // echo.leaveChannel(`chatroom.${selectedUser.request_id}`);
    };
  }, [requestId, requestId]);

  const handleSendMessage = async () => {
    if (message.trim() === "") {
      alert("Message cannot be empty");
      return;
    }

    if (!selectedUser) {
      alert("Please select a user to send a message.");
      return;
    }

    try {
      const response = await api.post("/send-message", {
        sender_id: requestId,
        reciever_id: selectedUser.request_id,
        message: message,
        dark_users_id: userId,
      });
      console.log("API Response:", response.data); // Check API response

      // Optimistically update the messages list
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: message,
          sender_id: requestId,
          reciever_id: selectedUser.request_id,
          dark_users_id: userId,
        },
      ]);
      setMessage(""); // Clear the input after sending
      console.log(response, "this is response");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  useEffect(() => {
    if (!requestId) {
      console.error("Request ID is not available");
      return;
    }

    const fetchPendingRequests = async () => {
      try {
        const response = await api.get(`/friend-request/${requestId}/pending`);
        setPendingRequests(response.data);
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }
    };

    const fetchFriends = async () => {
      try {
        const response = await api.get(`/friend-request/${requestId}/friends`);
        setFriends(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching friends:", error);
        setFriends([]);
      }
    };

    fetchPendingRequests();
    fetchFriends();
    setLoading(false);
  }, [requestId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await api.get("/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(response.data.data)) {
          setUsers(response.data.data);
        } else {
          console.error("Invalid API response format", response.data);
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  const respondToFriendRequest = async (requestId, action) => {
    try {
      const response = await api.post(`/friend-request/${requestId}/respond`, {
        action: action,
      });

      if (response.status === 200) {
        console.log(`Friend request ${action}ed successfully`);
        setPendingRequests((prevRequests) =>
          prevRequests.filter(
            (request) => request.request_friend_id !== requestId
          )
        );

        // Refresh the friends list
        const fetchFriends = async () => {
          try {
            const response = await api.get(
              `/friend-request/${requestId}/friends`
            );
            setFriends(response.data);
          } catch (error) {
            console.error("Error fetching friends:", error);
          }
        };

        fetchFriends();
      }
    } catch (error) {
      console.error(`Error responding to friend request: ${error}`);
      alert("Failed to respond to friend request.");
    }
  };

  const sendFriendRequest = async (userRequestId) => {
    try {
      const response = await api.post(`/friend-request/${userRequestId}/send`, {
        sender_request_id: requestId,
      });

      if (response.status === 200) {
        console.log("Friend request sent successfully");
        setFriendRequestSent(true);
        setFilteredUsers((prevUsers) =>
          prevUsers.filter((user) => user.request_id !== userRequestId)
        );
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Failed to send friend request.");
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);

    if (value.trim() === "") {
      setFilteredUsers([]);
      return;
    }

    const filtered = users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(value) ||
        user.lastname?.toLowerCase().includes(value) ||
        user.email?.toLowerCase().includes(value)
      );
    });

    setFilteredUsers(filtered);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const isFriend = (userId) => {
    // Check if friends is an array
    if (Array.isArray(friends)) {
      return friends.some((friend) => friend.request_id === userId);
    }
    // If not an array, return false (no friends)
    return false;
  };

  // console.log(messages);
  messages.map((msg, index) => {
    console.log(msg, index);
  });
  return (
    <div className="full-width-layout">
      <div className="row-layout">
        <div className="col-50">
          <h2 className="text-xl font-semibold">Search for a friend...</h2>
          <div className="search-layout">
            <label htmlFor="filter-input">Search</label>
            <input
              name="filter-input"
              type="text"
              placeholder="Search by name, lastname, or email..."
              value={search}
              onChange={handleSearch}
            />
          </div>
          {filteredUsers.length > 0 && (
            <ul className="dropdown">
              {filteredUsers.map((user, index) => (
                <li
                  key={index}
                  className="dropdown-item"
                  onClick={() => handleSelectUser(user)}
                >
                  {user.name} {user.lastname} ({user.email})
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="col-50">
          {selectedUser && (
            <div className="user-card">
              <div className="user-picture">
                <img
                  src={
                    selectedUser.picture
                      ? `${STORAGE_URL}/${selectedUser.picture}`
                      : `${defaultBlankPhotoUrl}`
                  }
                  alt={`${selectedUser.name} ${selectedUser.lastname}`}
                  className="user-image"
                />
              </div>
              <div className="user-details">
                <p>
                  {selectedUser.name} {selectedUser.lastname}
                </p>
                <button
                  className="add-friend-btn"
                  onClick={() =>
                    isFriend(selectedUser.request_id)
                      ? null
                      : sendFriendRequest(selectedUser.request_id)
                  }
                >
                  {isFriend(selectedUser.request_id)
                    ? "Friends"
                    : friendRequestSent
                    ? "Friend Request Sent"
                    : "Add Friend"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="row-layout">
        <div className="col-50">
          <h3>Pending Friend Requests</h3>
          {loading ? (
            <p>Loading...</p>
          ) : pendingRequests.length > 0 ? (
            <ul>
              {pendingRequests.map((request, index) => (
                <li key={index}>
                  {request.friend_name}{" "}
                  <button
                    onClick={() =>
                      respondToFriendRequest(
                        request.request_friend_id,
                        "accept"
                      )
                    }
                  >
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      respondToFriendRequest(
                        request.request_friend_id,
                        "reject"
                      )
                    }
                  >
                    Reject
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No pending requests</p>
          )}
        </div>

        <div className="col-50">
          <h3>Friends</h3>
          {loading ? (
            <p>Loading...</p>
          ) : friends.length > 0 ? (
            <ul>
              {friends.map((friend, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectUser(friend)}
                  style={{ cursor: "pointer" }}
                >
                  {friend.name} {friend.lastname} ({friend.email})
                </li>
              ))}
            </ul>
          ) : (
            <p>No friends</p>
          )}
        </div>
      </div>

      {selectedUser && messages && (
  <div className="chat-layout">
    <div className="chat-window">
      <div className="messages">
        {messages.length > 0 ? (
          messages.map((msg, index) => {
            console.log("Message Content:", msg); // Check content of the message

            const userRequestId = localStorage.getItem("request_id");
            console.log(userRequestId);

            const isSent = senderRequestId[index] === userRequestId;
            const isReceived = recieverRequestId[index] === userRequestId;

            console.log(senderRequestId, recieverRequestId);
            console.log("Full msg:", msg); // Log the message to check if it's an object or string

            // If msg is an object, access msg.message; otherwise, use msg directly
            const messageContent = typeof msg === "object" ? msg.message : msg;

            return (
              <div
                key={index}
                className={`message ${isSent ? "sent" : isReceived ? "received" : ""}`}
              >
                <p>{messageContent}</p> {/* Render the correct content */}
              </div>
            );
          })
        ) : (
          <p>No messages yet</p>
        )}
      </div>

      <div className="message-input">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};
export default Chatroom;
