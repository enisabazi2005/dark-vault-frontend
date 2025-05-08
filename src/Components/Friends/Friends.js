import React, { useEffect, useState } from "react";
import "../Friends/Friends.css";
import api from "../../api";
import { STORAGE_URL } from "../../api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLockOpen, faUnlock, faTrash } from "@fortawesome/free-solid-svg-icons";
import FriendsSkeleton from "./FriendsSkeleton";
import useStorageStore from "../../Store/storageStore";
import ProfileView from "../ProfileView/ProfileView";
import Icon from "../../assets/images/check.png";

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loadingUnblock, setLoadingUnblock] = useState({});
  const [loadingUnfriend, setLoadingUnfriend] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { usersMuted } = useStorageStore();

  const requestId = localStorage.getItem("request_id");
  const defaultBlankPhotoUrl =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  useEffect(() => {
    if (!requestId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [friendsResponse, blockedResponse] = await Promise.all([
          api.get(`/friend-request/${requestId}/friends`),
          api.get("/blocked-users")
        ]);
        setFriends(friendsResponse.data ?? []);
        setBlockedUsers(blockedResponse.data ?? []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setFriends([]);
        setBlockedUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [requestId]);

  const handleUnblock = async (blockedRequestId) => {
    setLoadingUnblock((prev) => ({ ...prev, [blockedRequestId]: true }));
    try {
      await api.post(`/unblock-user/${blockedRequestId}`);
      setBlockedUsers((prev) => prev.filter((user) => user.request_id !== blockedRequestId));
    } catch (error) {
      console.error("Error unblocking user:", error);
    } finally {
      setLoadingUnblock((prev) => ({ ...prev, [blockedRequestId]: false }));
    }
  };

  const handleUnfriend = async (friendRequestId) => {
    setLoadingUnfriend((prev) => ({ ...prev, [friendRequestId]: true }));
    try {
      await api.post(`/remove-friend/${friendRequestId}`);
      setFriends((prev) => prev.filter((friend) => friend.request_id !== friendRequestId));
    } catch (error) {
      console.error("Error removing friend:", error);
    } finally {
      setLoadingUnfriend((prev) => ({ ...prev, [friendRequestId]: false }));
    }
  };

  if (isLoading) {
    return <FriendsSkeleton />;
  }

  return (
    <div className="flex-friends">
      <div className="profile-view-container-at-friends">
        <ProfileView />
      </div>
      <div className="friends-row">
        <div className="flex-friends-div">
          <h6>Total friends: {friends.length > 0 ? friends.length : 0}</h6>
          <h2 className="text-xl font-semibold">Friends</h2>
          {friends.length > 0 ? (
            <ul className="user-list">
              {friends.map((friend) => (
                <li key={friend.id} className="user-item">
                  <img
                    src={friend.picture ? `${STORAGE_URL}/${friend.picture}` : defaultBlankPhotoUrl}
                    alt={friend.name}
                    className="user-avatar"
                  />
                  <span>{friend.name}</span>
                    {friend.has_pro ? (<img className="icon-pro" src={Icon}></img>) : null}
                  <div className="user-mute-div">
                  {usersMuted.includes(friend.id) && (
                      <span className="user-mute-span" style={{ marginLeft: 8, color: 'red' }}>🔇</span> 
                  )}
                  </div>
                  <div className="unblock-div">
                    <button className="unfriend-btn" onClick={() => handleUnfriend(friend.request_id)}>
                      <FontAwesomeIcon icon={loadingUnfriend[friend.request_id] ? faUnlock : faTrash} />
                    </button>
                    <p>Remove friend</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No friends found.</p>
          )}
        </div>

        <div className="flex-friends-div">
          <h6>Total Blocked: {blockedUsers.length > 0 ? blockedUsers.length : 0}</h6>
          <h2 className="text-xl font-semibold">Blocked</h2>
          {blockedUsers.length > 0 ? (
            <ul className="user-list">
              {blockedUsers.map((user) => (
                <li key={user.id} className="user-item">
                  <img
                    src={user.picture ? `${STORAGE_URL}/${user.picture}` : defaultBlankPhotoUrl}
                    alt={user.name}
                    className="user-avatar"
                  />
                  <span>{user.name}</span>
                  <div className="unblock-div">
                    <button className="unblock-btn" onClick={() => handleUnblock(user.request_id)}>
                      <FontAwesomeIcon icon={loadingUnblock[user.request_id] ? faLockOpen : faUnlock} />
                    </button>
                    <p>Unblock</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No blocked users.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;