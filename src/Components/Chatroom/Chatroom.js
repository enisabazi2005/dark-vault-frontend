import React, { useState, useEffect } from "react";
import "../Chatroom/Chatroom.css";
import api from "../../api";
import { STORAGE_URL } from "../../api";

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
  const defaultBlankPhotoUrl =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  const requestId = localStorage.getItem("request_id");
  

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
          // Always ensure friends is an array
          setFriends(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          console.error("Error fetching friends:", error);
          setFriends([]); // Fallback to an empty array in case of error
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
          prevRequests.filter((request) => request.request_friend_id !== requestId)
        );
  
        // Refresh the friends list
        const fetchFriends = async () => {
          try {
            const response = await api.get(`/friend-request/${requestId}/friends`);
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

  const handleSendMessage = () => {
    if (message.trim() === "") {
      alert("Message cannot be empty");
      return;
    }
    // Implement sending message logic here (e.g., API call or WebSocket)
    console.log(`Sending message to ${selectedUser.name}: ${message}`);
    setMessage(""); // Clear the input after sending
  };

  const isFriend = (userId) => {
    // Check if friends is an array
    if (Array.isArray(friends)) {
      return friends.some((friend) => friend.request_id === userId);
    }
    // If not an array, return false (no friends)
    return false;
  };


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
                  onClick={() => isFriend(selectedUser.request_id) ? null : sendFriendRequest(selectedUser.request_id)}
                >
                  {isFriend(selectedUser.request_id) ? "Friends" : friendRequestSent ? "Friend Request Sent" : "Add Friend"}
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
                      respondToFriendRequest(request.request_friend_id, "accept")
                    }
                  >
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      respondToFriendRequest(request.request_friend_id, "reject")
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

      {selectedUser && (
        <div className="row-layout">
          <div className="col-50">
            <h3>Send Message to {selectedUser.name}</h3>
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
