import React, { useState, useEffect } from "react";
import "../Chatroom/Chatroom.css";
import api from "../../api";
import { STORAGE_URL } from "../../api";
import Pusher from "pusher-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { PUSHER_APP_KEY, PUSHER_CLUSTER } from "../../api";
import Muted from "../Muted/Muted";
import Unfriend from "../Unfriend/Unfriend";
import Blocked from "../Blocked/Blocked";

const Chatroom = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const defaultBlankPhotoUrl =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  const requestId = localStorage.getItem("request_id");
  const userId = localStorage.getItem("user_id");
  const [senderRequestId, setSenderRequestId] = useState([]);
  const [recieverRequestId, setRecieverReqeustId] = useState([]);
  const [isProfileClicked, setIsProfileClicked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedUserFriends, setSelectedUserFriends] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [friend, setFriend] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [blockedBy, setBlockedBy] = useState([]);

  useEffect(() => {
    const getBlockedByUsers = async () => {
      try {
        const response = await api.get("/blocked-by");
        setBlockedBy(response.data); 
        console.log(response.data, "response.data");
      } catch (error) {
        console.error("Error fetching the blocked by users", error);
      }
    };
    getBlockedByUsers();
  }, []);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const response = await api.get("/blocked-users");
        setBlockedUsers(response.data);
      } catch (error) {
        console.error("Error fetching blocked users", error);
        throw error;
      }
    };
    fetchBlockedUsers();
  }, []);

  useEffect(() => {
    const fetchSelectedUserFriends = async () => {
      if (!selectedUser || !selectedUser.request_id) return;
  
      try {
        const response = await api.get(`/dark-user/${selectedUser.request_id}/get-friends`);
        setSelectedUserFriends(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
  
    fetchSelectedUserFriends();
  }, [selectedUser?.request_id]); 
  
  const handleProfileClick = (user) => {
    setSelectedUser(user);
    setIsProfileClicked(true);
  };

  const handleCloseProfileClick = () => {
    setIsProfileClicked(false);
  };

  const handleBlockToggle = (newBlockStatus) => {
    setIsBlocked(newBlockStatus);
  };

  const handleUnfriendToggle = (newFriendStatus) => {
    setFriend(newFriendStatus);
  };

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
      console.log("API Response:", response.data);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: message,
          sender_id: requestId,
          reciever_id: selectedUser.request_id,
          dark_users_id: userId,
        },
      ]);
      setMessage("");
      console.log(response, "this is response");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  useEffect(() => {
    if (!requestId || !selectedUser) return;

    const pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: true,
    });
    const channel = pusher.subscribe(`chatroom.${selectedUser.request_id}`);
    console.log(`Subscribed to chatroom.${selectedUser.request_id}`);

    channel.bind("App\\Events\\NewMessage", function (data) {
      console.log("New message received:", data);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: data.message.message,
          sender_id: data.message.sender_id,
          reciever_id: data.message.reciever_id,
          dark_users_id: data.dark_users_id,
        },
      ]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [selectedUser, requestId]);

  useEffect(() => {
    if (!requestId || !selectedUser) return;

    const fetchMessages = async () => {
      try {
        const response = await api.get(
          `/messages/${userId}/${selectedUser.id}`
        );
        const messages = [];

        response.data.forEach((message) => {
          messages.push({
            message: message.message,
            sender_id: message.sender_id,
            reciever_id: message.reciever_id,
            dark_users_id: message.dark_users_id,
          });
        });

        setMessages(messages);
        setSenderRequestId(senderRequestId);
        setRecieverReqeustId(recieverRequestId);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [
    selectedUser,
    requestId,
    senderRequestId,
    recieverRequestId,
    userId,
    blockedUsers,
  ]); 

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
        setErrorMessage("");
        setFilteredUsers((prevUsers) =>
          prevUsers.filter((user) => user.request_id !== userRequestId)
        );
      }
      if (
        response.status === 400 &&
        response.data.message === "User blocked you"
      ) {
        setIsBlocked(true);
      } else {
        setIsBlocked(false);
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      setIsBlocked(true);
      setErrorMessage(error.response.data.message);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);

    if (value.trim() === "") {
      setFilteredUsers([]);
      return;
    }

    const currentUserRequestId = localStorage.getItem("request_id");

    const blockedUserIds = Array.isArray(blockedUsers)
      ? blockedUsers.map((user) => user.id)
      : []; 
    const filtered = users.filter((user) => {
      return (
        user.request_id !== currentUserRequestId &&
        !blockedUserIds.includes(user.id) && 
        (user.name?.toLowerCase().includes(value) ||
          user.lastname?.toLowerCase().includes(value))
      );
    });

    setFilteredUsers(filtered);
  };

  const handleSelectUser = (user, isFriendSelection = false) => {
    setSelectedUser(user);

    const isBlockedByUser = blockedBy.some(blocked => blocked.id === user.id); // Use `user.id` directly
    console.log(isBlockedByUser);
    
    if (isBlockedByUser) {
      setErrorMessage("User blocked you");
      setFriend(false); 
    } else {
      setErrorMessage("");
      setFriend(isFriend(user.request_id));
    }
  

    if (isFriendSelection) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleCloseChat = () => {
    setSelectedUser(null);
    setIsOpen(false);
  };

  const isFriend = (userId) => {
    if (Array.isArray(friends)) {
      return friends.some((friend) => friend.request_id === userId);
    }
    return false;
  };

  const sortedMessages = messages.sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  return (
    <div className="full-width-layout">
      <div className="row-layout">
        <div className="col-50">
          <h2 className="text-xl font-semibold">Add a friend...</h2>
          <div className="search-layout">
            <input
              name="filter-input"
              type="text"
              value={search}
              placeholder="Search"
              onChange={handleSearch}
            />
          </div>
          {filteredUsers.length > 0 && (
            <ul className="dropdown">
              {filteredUsers.map((user, index) => (
                <li
                  key={index}
                  className="dropdown-item"
                  onClick={() => handleSelectUser(user, false)}
                >
                  <img
                    src={
                      user.picture
                        ? `${STORAGE_URL}/${user.picture}`
                        : `${defaultBlankPhotoUrl}`
                    }
                    alt={`${user.name} ${user.lastname}`}
                    className="user-image-filter"
                  />
                  {user.name} {user.lastname}
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
                    blockedBy.some((user) => user.id === selectedUser.id) 
                      ? defaultBlankPhotoUrl
                      : selectedUser.picture
                      ? `${STORAGE_URL}/${selectedUser.picture}` 
                      : defaultBlankPhotoUrl 
                  }
                  alt="Profile"
                  className="user-image"
                />
              </div>
              <div className="user-details">
                <p>
                  {selectedUser.name} {selectedUser.lastname}
                </p>
                <div className="selected-user-details">
                  <p>
                    {isFriend(selectedUser.request_id) &&
                      selectedUserFriends?.friends_count > 0 && (
                        <p>{selectedUserFriends.friends_count} Friends</p>
                      )}
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
                      : errorMessage
                      ? errorMessage
                      : "Add Friend"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="row-layout row-layout-friends">
        <div className="col-50">
          <h3>Pending Friend Requests</h3>
          {loading ? (
            <p>Loading...</p>
          ) : pendingRequests.length > 0 ? (
            <ul>
              {pendingRequests.map((request, index) => (
                <li key={index} className="friend-request-name">
                  <img
                    src={
                      request.friend_picture_url
                        ? `${STORAGE_URL}/${request.friend_picture_url}`
                        : `${defaultBlankPhotoUrl}`
                    }
                    alt={`${request.request_friend_id}`}
                    className="user-image-filter"
                  />
                  {request.friend_name}
                  <button
                    className="accept-friend-request-button"
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
                    className="reject-friend-request-button"
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
                  onClick={() => handleSelectUser(friend, true)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={
                      friend.picture
                        ? `${STORAGE_URL}/${friend.picture}`
                        : `${defaultBlankPhotoUrl}`
                    }
                    alt={`${friend.name} ${friend.lastname}`}
                    className="user-image-filter"
                  />
                  {friend.name} {friend.lastname}
                </li>
              ))}
            </ul>
          ) : (
            <p>No friends</p>
          )}
        </div>
      </div>
      {selectedUser && isOpen && (
        <div className="overshadow" onClick={handleCloseChat}></div>
      )}
      {isOpen && selectedUser && messages && (
        <div className="chat-layout">
          <div className="chat-window">
            <div className="messages">
              <div className="display-friend-row">
                <div
                  className="friend-creds"
                  onClick={() => handleProfileClick(selectedUser)}
                >
                  {selectedUser && (
                    <img
                      src={
                        selectedUser.picture
                          ? `${STORAGE_URL}/${selectedUser.picture}`
                          : `${defaultBlankPhotoUrl}`
                      }
                      alt=""
                      className="display-friend-image"
                    ></img>
                  )}
                  {selectedUser && <h1>{selectedUser.name}</h1>}
                </div>
                {isProfileClicked && selectedUser && (
                  <div className="modal-profile-clicked">
                    <div className="modal-profile-clicked-row">
                      <h2 onClick={handleCloseProfileClick}>
                        {selectedUser.name}'s Options
                      </h2>
                      <Blocked
                        selectedUserId={selectedUser.request_id}
                        isBlocked={isBlocked}
                        onBlockToggle={handleBlockToggle}
                      />
                      <Muted
                        selectedUserId={selectedUser.id}
                        isMuted={isMuted}
                        onMuteToggle={(newMuteStatus) =>
                          setIsMuted(newMuteStatus)
                        }
                      />
                      <Unfriend
                        selectedUserId={selectedUser.request_id}
                        isFriend={friend}
                        onUnfriendToggle={handleUnfriendToggle}
                      />
                    </div>
                  </div>
                )}
                <div className="close-chat-window">
                  <button onClick={handleCloseChat}>
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              </div>
              <div className="personal-chat-layout">
                {messages.length > 0 ? (
                  sortedMessages.map((msg, index) => {
                    const userRequestId = localStorage.getItem("request_id");

                    const isSent = msg.sender_id === userRequestId;
                    const isReceived = selectedUser.request_id;

                    const messageContent = msg.message;

                    return (
                      <div
                        key={index}
                        className={`message ${
                          isSent
                            ? "sent"
                            : isReceived
                            ? "received"
                            : "just-sent"
                        }`}
                      >
                        <p className="message-content">{messageContent}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="message-content-fallback">No messages yet</p>
                )}
              </div>
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
