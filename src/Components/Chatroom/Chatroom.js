import React, { useState, useEffect, useRef, useCallback } from "react";
import "../Chatroom/Chatroom.css";
import api from "../../api";
import { STORAGE_URL } from "../../api";
import Pusher from "pusher-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { PUSHER_APP_KEY, PUSHER_CLUSTER } from "../../api";
import Muted from "../Muted/Muted";
import Unfriend from "../Unfriend/Unfriend";
import Blocked from "../Blocked/Blocked";
import BackgroundChange from "../BackgroundChange/BackgroundChange";
import MessageSent from "../../assets/images/message-sent.wav";
import { useStore } from "../../Store/store";
import useStorageStore from "../../Store/storageStore";

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
  const messageSentAudioRef = useRef(null);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  const [chatBackground, setChatBackground] = useState(null);
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const [groupedReactions, setGroupedReactions] = useState({});
  const { myProfile, friends: storeFriends } = useStore();
  const [typingStatus, setTypingStatus] = useState("");
  const typingTimeoutRef = useRef();
  const [lastSeenId, setLastSeenId] = useState(null);
  const [isSeen, setIsSeen] = useState(false);
  const { usersMuted, updateUsersMuted } = useStorageStore();
  const friendRef = useRef(friends);

  useEffect(() => {
    friendRef.current = friends;
    // console.log(friendRef, 'friendRef');
  }, [friends]);

  useEffect(() => {
    const fetchMutedUsers = async () => {
      try {
        const response = await api.get("/muted-users", {
          params: {
            dark_users_id: userId,
          },
        });
        if (response.status === 200) {
          updateUsersMuted(response.data.muted_users);
        }
      } catch (error) {
        console.error("Error fetching muted users:", error);
      }
    };

    fetchMutedUsers();
  }, [userId, updateUsersMuted]);


  const removeReaction = async (messageId) => {
    try {
      const response = await api.delete(`message/${messageId}/react`);
      console.log("Reaction Deleted Successfully", response);

      const updatedReactions = await api.get(`/reactions/grouped`);
      setGroupedReactions(updatedReactions.data);
    } catch (error) {
      console.log("Error fetching data", error);
      // throw error;
    }
  };

  const handleReact = async (messageId, emojiKeyword) => {
    const darkUserId = localStorage.getItem("user_id");
    console.log(messageId, emojiKeyword, "post request for react");
    try {
      const response = await api.post(`/message/${messageId}/react`, {
        reaction_type: emojiKeyword,
        reacted_by: darkUserId,
        dark_users_id: darkUserId,
      });
      console.log("Reacted successfully:", response.data);
      const updatedReactions = await api.get("/reactions/grouped");
      setGroupedReactions(updatedReactions.data);
    } catch (error) {
      console.error("Failed to send reaction:", error.response?.data || error);
    }
  };

  useEffect(() => {
    async function fetchGroupedReactions() {
      const res = await api.get("/reactions/grouped");
      setGroupedReactions(res.data);
    }
    fetchGroupedReactions();
  }, []);

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
        const response = await api.get(
          `/dark-user/${selectedUser.request_id}/get-friends`
        );
        setSelectedUserFriends(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchSelectedUserFriends();
  }, [selectedUser]);

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
          id: message.id,
          message: message,
          sender_id: requestId,
          reciever_id: selectedUser.request_id,
          dark_users_id: userId,
          message_sent_at: response.data.data.message_sent_at,
          sender_name: response.data.data.sender_name,
          sender_lastname: response.data.data.sender_lastname,
          is_seen: response.data.data.is_seen, //new line added
        },
      ]);
      setMessage("");
      if(isOpen) { 
        console.log(isOpen, 'isOpen');
        markLastMessageAsSeen(response.data.data.message.id);
      } else { 
        console.log("isopen false", isOpen);
      }
      // Play the message sent sound
      if (messageSentAudioRef.current) {
        messageSentAudioRef.current.currentTime = 0;
        messageSentAudioRef.current.play().catch((error) => {
          console.error("Error playing message sent sound:", error);
        });
      }

      console.log(response, "this is response");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  useEffect(() => {
    if (!selectedUser || !selectedUser.request_id) return;

    const pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: false,
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
          message_sent_at: data.message.message_sent_at,
          sender_name: data.message.sender_name,
          is_seen: data.message.is_seen,
        },
      ]);
      if(isOpen) {
        console.log(isOpen, "isOpen true"); 
        markLastMessageAsSeen(data.message.id);
      } else { 
        console.log(isOpen, 'isOpen false');
      }
      console.log(messages, "messages");
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [selectedUser?.request_id]);

  const findIsTyping = (id) => {
    const friend = friends.find((f) => f.id === id);
    return friend ? friend?.name : "Unknown";
  };

  useEffect(() => {
    if (!myProfile) return;

    const pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: false,
    });

    const channel = pusher.subscribe(`chatroom.${myProfile.id}`);
    // console.log(`Subscribed to chatroom.${myProfile.id}`);
    fetchFriends();
    channel.bind("user.typing", function (data) {
      if (data.is_typing) {
        const name = findIsTyping(Number(data.sender_id));
        setTypingStatus(`${name} is typing...`);
        setTimeout(() => {
          setTypingStatus("");
        }, 4000);
      }
    });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [myProfile?.id, friends]);

  const debouncedHandleTyping = useCallback(() => {
    if (!myProfile) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      try {
        await api.post("/typing", {
          sender_id: myProfile.id,
          receiver_id: selectedUser.id,
          is_typing: true,
        });
        console.log("writing");
      } catch (error) {
        console.error("Error sending typing event:", error);
      }
    }, 1500);
  }, [myProfile, selectedUser]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

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
            id: message.id,
            message: message.message,
            sender_id: message.sender_id,
            reciever_id: message.reciever_id,
            dark_users_id: message.dark_users_id,
            message_sent_at: message.message_sent_at,
            is_seen: message.is_seen,
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
              `/friend-request/${myProfile.request_id}/friends`
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

  useEffect(() => {
    if (!myProfile?.request_id) return;

    const pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: false,
    });

    const channel = pusher.subscribe(`friend-request.${myProfile.request_id}`);
    console.log(`Subscribed to friend-request.${myProfile.request_id}`);

    channel.bind("FriendRequestSent", (data) => {
      console.log("📩 Live friend request received!", data);

      setPendingRequests((prev) => [
        ...prev,
        {
          friend_name: data.sender.name,
          request_friend_id: data.sender.request_id,
          friend_picture_url: data.sender.picture || null,
        },
      ]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [myProfile?.request_id]);

  const fetchFriends = async () => {
    try {
      const response = await api.get(
        `/friend-request/${myProfile.request_id}/friends`
      );
      setFriends(response.data);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  useEffect(() => {
    if (!myProfile?.request_id) return;

    const pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: false,
    });
    const channel = pusher.subscribe(`friend-accept.${myProfile.request_id}`);
    console.log(`Subscribed to friend-accept.${myProfile.request_id}`);

    channel.bind("FriendRequestAccepted", (data) => {
      console.log("✅ Friend request accepted!", data);

      fetchFriends();

      setPendingRequests((prevRequests) =>
        prevRequests.filter(
          (request) => request.request_friend_id !== data.receiver.request_id &&
                       request.request_friend_id !== data.sender.request_id
        )
      );

    });
    console.log(myProfile, "myProfile");
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [myProfile?.request_id]);

  useEffect(() => {
    if (!myProfile?.request_id) return;
    fetchFriends();
  }, [myProfile]);

  useEffect(() => {
    if (!selectedUser?.id || !myProfile?.request_id || !isOpen) return;

    const lastUnseenMessage = [...messages]
      .reverse()
      .find(
        (msg) =>
          msg.reciever_id === myProfile.request_id &&
          msg.sender_id === selectedUser.request_id &&
          !msg.is_seen
      );

    if (lastUnseenMessage && lastUnseenMessage.id !== lastSeenId) {
      markLastMessageAsSeen(lastUnseenMessage.id);
    }
  }, [messages, selectedUser?.id, myProfile?.request_id, isOpen]);

  useEffect(() => {
    if (!messages.length) return;
  
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage.is_seen) {
      console.log("Marking last message as seen:", lastMessage.id);
      markLastMessageAsSeen(lastMessage.id);  
    } else { 
      console.log("Marking last message as not seen not working sadly");
    }
  
    if (lastMessage?.is_seen) {
      setIsSeen(true);
    } else {
      setIsSeen(false);
    }
  }, [messages]);

  const markLastMessageAsSeen = async (messageId) => {
    if (!messageId) return;

    try {
      const res = await api.post("/mark-as-seen", {
        message_id: messageId,
      });
      console.log(res.data);
      setLastSeenId(messageId);

      setIsSeen(true);
    } catch (error) {
      console.error("Failed to mark message as seen:", error);
    }
  };

  useEffect(() => {
    if (!myProfile?.id) return;

    const pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: true,
    });

    const channel = pusher.subscribe(`chat.${myProfile.request_id}`);

    channel.bind("MessageSeenEvent", (data) => {
      console.log("👀 Message seen event received!", data);
      if (data.message_id) {
        setLastSeenId(data.message_id);
        setIsSeen(true);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [myProfile?.id]);

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

    const isBlockedByUser = blockedBy.some((blocked) => blocked.id === user.id); 
    console.log(isBlockedByUser);

    if (isBlockedByUser) {
      setErrorMessage("User blocked you");
      setFriend(false);
    } else {
      setErrorMessage("");
      setFriend(isFriend(user.request_id));
    }
    console.log(isFriendSelection, 'isFriendSelection')
    console.log(user, 'user ')
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      handleSendMessage();
    }
  };

  useEffect(() => {
    fetchBackground();
  }, []);

  const fetchBackground = async () => {
    try {
      const response = await api.get("/background");
      if (response.data && response.data.option) {
        setChatBackground(response.data.option);
      }
    } catch (error) {
      console.error("Error fetching background:", error);
    }
  };

  const handleBackgroundChange = (newBackground) => {
    setChatBackground(newBackground);
  };

  const emojiMap = {
    heart: "❤️",
    laugh: "😂",
    like: "👍",
    curious: "🤩",
    cry: "😢",
    dislike: "👎",
  };

  return (
    <div className="full-width-layout">
      <audio ref={messageSentAudioRef} src={MessageSent} preload="auto" />
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
            <ul className="dropdown scroll-smooth">
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
                <div className="selected-user-details">
                  <div className="user-info">
                    <p>
                      {selectedUser.name} {selectedUser.lastname}
                      {isFriend(selectedUser.request_id) &&
                        selectedUserFriends?.friends_count > 0 && (
                          <span>
                            {selectedUserFriends.friends_count} Friends
                          </span>
                        )}
                        {usersMuted.includes(selectedUser.id) && (
                          <span style={{ marginLeft: 8, color: 'red' }}>🔇</span> 
                        )}
                    </p>
                  </div>
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
            <ul className="friends-list">
              {friends.map((friend, index) => (
                <li
                  key={index}
                  className="friend-item"
                  onClick={() => handleSelectUser(friend, true)}
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
                  <span>
                    {friend.name} {friend.lastname}
                    {usersMuted.includes(friend.id) && (
                       <span style={{ marginLeft: 8, color: 'red' }}>🔇</span> 
                    )}
                  </span>
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
          <div className={`chat-window ${chatBackground || ""}`}>
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
                  {usersMuted.includes(selectedUser.id) && (
                       <span style={{ color: 'red' }}>🔇</span> 
                    )}
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
                        onCloseChat={handleCloseChat}
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
                        onCloseChat={handleCloseChat}
                      />
                    </div>
                  </div>
                )}
                <div className="close-chat-window">
                  <button onClick={handleCloseChat}>
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
                <div
                  className="settings-background-change"
                  onClick={() => setIsBackgroundModalOpen(true)}
                >
                  <FontAwesomeIcon icon={faEllipsisVertical} />
                </div>
              </div>
              <div className="personal-chat-layout">
                {messages.length > 0 ? (
                  sortedMessages.map((msg, index) => {
                    const userRequestId = localStorage.getItem("request_id");
                    const isSent = msg.sender_id === userRequestId;
                    const isReceived = selectedUser.request_id;
                    const messageContent = msg.message;
                    const reactions = groupedReactions[msg.id] || [];
                    // const reactionCounts = reactions.reduce((acc, r) => {
                    //   acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
                    //   return acc;
                    // }, {});

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
                        onMouseEnter={() => setHoveredMsg(index)}
                        onMouseLeave={() => setHoveredMsg(null)}
                      >
                        <p className="message-content">{messageContent}</p>
                        {/* {isSeen ? (
                          <div className="text-green-500 text-sm">Seen</div>
                            ) : (
                          <div className="text-gray-500 text-sm">Sent</div>
                            )} */}
                        {reactions.length > 0 && (
                          <div className="reaction-bar">
                            {Object.entries(
                              reactions.reduce((acc, r) => {
                                acc[r.reaction_type] =
                                  (acc[r.reaction_type] || 0) + 1;
                                return acc;
                              }, {})
                            ).map(([type, count], idx) => (
                              <span
                                key={idx}
                                className="reaction-display"
                                onClick={() => removeReaction(msg.id)}
                              >
                                {emojiMap[type] || type} {count}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="message-status">
                          {/* {isSent && <span className="checkmarks">✓✓</span>} */}
                          {msg.message_sent_at && (
                            <p className="message-time">
                              {new Date(msg.message_sent_at).toLocaleTimeString(
                                [],
                                { hour: "numeric", minute: "2-digit" }
                              )}
                            </p>
                          )}
                          {/* {index === sortedMessages.length - 1  && (
                          isSeen ? (
                            <div className="message-seen-status">
                              <p className="message-seen-status-true">Seen</p>
                            </div>
                            ) : (
                          <div className="message-seen-status">
                            <p className="message-seen-status-false">Sent</p>
                          </div>
                            )
                          )} */}
                        </div>
                        <div className="message-seen-status">
                        {index === sortedMessages.length - 1  && (
                          isSeen ? (
                              <p className="message-seen-status-true">Seen</p>
                            ) : (
                              <p className="message-seen-status-false">Sent</p>
                            )
                          )}
                          </div>
                        {hoveredMsg === index && (
                          <div className="emoji-reactions">
                            <span onClick={() => handleReact(msg.id, "heart")}>
                              ❤️
                            </span>
                            <span onClick={() => handleReact(msg.id, "like")}>
                              👍
                            </span>
                            <span onClick={() => handleReact(msg.id, "laugh")}>
                              😂
                            </span>
                            <span onClick={() => handleReact(msg.id, "cry")}>
                              😢
                            </span>
                            <span
                              onClick={() => handleReact(msg.id, "curious")}
                            >
                              🤩
                            </span>
                            <span
                              onClick={() => handleReact(msg.id, "dislike")}
                            >
                              👎
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="message-content-fallback">
                    <p>No messages yet</p>
                    <span>Start a conversation with {selectedUser.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="message-input">
              <div className="typing-status">
                {/* {isSeen ? (
                  <div className="text-green-500 text-sm">Seen</div>
                ) : (
                  <div className="text-gray-500 text-sm">Sent</div>
                )} */}
                {typingStatus && (
                  <p>
                    {typingStatus.split("").map((char, index) => (
                      <span
                        key={index}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {char}
                      </span>
                    ))}
                  </p>
                )}
              </div>
              {messages.length > 0 ? (
                <textarea
                  value={message}
                  // onChange={(e) => setMessage(e.target.value)}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    debouncedHandleTyping(); // 👈 this must fire on every input
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                />
              ) : (
                <textarea
                  value={message}
                  // onChange={(e) => setMessage(e.target.value)}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    // handleTyping(); // 👈 Fire typing event
                    debouncedHandleTyping(); // debounce logic runs here
                  }}
                  placeholder="Say hi to your friend"
                />
              )}
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
      <BackgroundChange
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
        onBackgroundChange={handleBackgroundChange}
      />
    </div>
  );
};
export default Chatroom;
