import React, { useState, useCallback, useEffect } from "react";
import api, { STORAGE_URL } from "../../api";
import { useStore } from "../../Store/store";
import "./ProfileView.css";

const ProfileView = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const { myProfile, friends } = useStore();
  const defaultBlankPhotoUrl =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  const [isViewed, setIsViewed] = useState('');

  const isFriend = (user) => {
    return friends.some((friend) => friend.request_id === user.request_id);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("users");

        if (Array.isArray(response.data.data)) {
          setUsers(response.data.data);
        } else {
          console.error("Invalid API response format");
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

//   console.log(selectedUser, "selectedUser");

  const getUserStatus = (user) => {
    if (user.online === 1) return "online";
    if (user.away === 1) return "away";
    if (user.offline === 1) return "offline";
    return "offline"; // Default status
  };

  // Debounced search
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleSearch = (value) => {
    setIsSearching(true);

    if (!myProfile) return;

    if (value.trim() === "") {
      setFilteredUsers([]);
      setIsSearching(false);
      return;
    }

    const filtered = users.filter((user) => {
      return (
        user.request_id !== myProfile.request_id &&
        (user.name?.toLowerCase().includes(value.toLowerCase()) ||
          user.lastname?.toLowerCase().includes(value.toLowerCase()))
      );
    });

    setFilteredUsers(filtered);
    setIsSearching(false);
  };

  const debouncedHandleSearch = useCallback(debounce(handleSearch, 400), [
    users,
    myProfile,
  ]);

  const onSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setIsSearching(true);
    debouncedHandleSearch(value);
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    try { 
        const response = await api.post('/profile-viewed', {
            viewed_user_id: user.id,
        });
        setIsViewed(response.data);

    } catch(error) { 
        console.error(error , 'error');
        throw error;
    }

  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className="profile-view-container">
      <input
        name="filter-input"
        type="text"
        value={search}
        placeholder="Search users by name..."
        onChange={onSearchChange}
        className="profile-view-search-input"
      />

      {search.trim() !== "" && (
        <div className="profile-view-filtered-users-list">
          {isSearching ? (
            <div className="profile-view-no-results">Searching...</div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="profile-view-filtered-user-card"
                onClick={() => handleSelectUser(user)}
              >
                <img
                  src={
                    user.picture
                      ? `${STORAGE_URL}/${user.picture}`
                      : defaultBlankPhotoUrl
                  }
                  alt={`${user.name} ${user.lastname}`}
                  className="profile-view-user-image-filter"
                />
                <div className="profile-view-user-info">
                  <h4>
                    {user.name} {user.lastname}
                  </h4>
                  {isFriend(user) && (
                    <p
                      className={`profile-view-user-status ${getUserStatus(
                        user
                      )}`}
                    >
                      {getUserStatus(user)}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="profile-view-no-results">
              No users found matching "{search}"
            </div>
          )}
        </div>
      )}

      {selectedUser && (
        <div className="profile-view-modal-overlay" onClick={handleCloseModal}>
          <div
            className="profile-view-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={
                selectedUser.picture
                  ? `${STORAGE_URL}/${selectedUser.picture}`
                  : defaultBlankPhotoUrl
              }
              alt={`${selectedUser.name} ${selectedUser.lastname}`}
              className="profile-view-modal-avatar"
            />
            <h2>
              {selectedUser.name} {selectedUser.lastname}
            </h2>
            {isFriend(selectedUser) && (
              <>
                <p
                  className={`profile-view-user-status ${getUserStatus(
                    selectedUser
                  )}`}
                >
                  {getUserStatus(selectedUser)}
                </p>
                <div className="profile-view-user-details">
                  {selectedUser.age && (
                    <p>
                      <strong>Age:</strong> {selectedUser.age}
                    </p>
                  )}
                  {selectedUser.gender && (
                    <p>
                      <strong>Gender:</strong> {selectedUser.gender}
                    </p>
                  )}
                </div>
              </>
            )}

            <button
              className="profile-view-close-button"
              onClick={handleCloseModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
