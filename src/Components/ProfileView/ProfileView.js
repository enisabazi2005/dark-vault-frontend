import React, { useState, useCallback, useEffect } from "react";
import api, { STORAGE_URL } from "../../api";
import { useStore } from "../../Store/store";
import "./ProfileView.css";
import Icon from "../../assets/images/check.png";
import { DownloadIcon, CheckIcon , LoadingSpinner } from "../SVG/svg";


const ProfileView = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const { myProfile, friends } = useStore();
  const defaultBlankPhotoUrl =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  const [downloadStatus, setDownloadStatus] = useState('idle');


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


  const getUserStatus = (user) => {
    if (user.online === 1) return "online";
    if (user.away === 1) return "away";
    if (user.offline === 1) return "offline";
    if (user.do_not_disturb === 1) return "do_not_disturb";
    return "offline"; 
  };

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
      await api.post("/profile-viewed", {
        viewed_user_id: user.id,
      });
    } catch (error) {
      console.error(error, "error");
      throw error;
    }
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const proUser = () => {
    const handleDownload = async () => {
      if (downloadStatus === 'success') return;
      
      setDownloadStatus('loading');
      
      try {
        const response = await api.get(`/download-profile-picture/${selectedUser.picture}`, {
          responseType: "blob", 
        });
      
        const blob = response.data;
      
        const link = document.createElement("a");
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute("download", selectedUser.picture.split("/").pop()); 
      
        document.body.appendChild(link);
        link.click();
      
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setDownloadStatus('success');
      } catch (error) {
        console.error("Error downloading file", error);
        setDownloadStatus('error');
        
        setTimeout(() => {
          setDownloadStatus('idle');
        }, 3000);
      }
    };
  
    return (
      <>
        {myProfile?.has_pro ? (
          <>
            <p>
              <strong>Email: </strong> {selectedUser.email}
            </p>
            <p>
              <strong>Profile Picture:</strong>{" "}
              <button 
                className={`download-button-picture ${downloadStatus === 'success' ? 'success' : ''}`} 
                onClick={handleDownload}
                disabled={downloadStatus === 'loading'}
              >
                {downloadStatus === 'idle' && (
                  <>
                    <DownloadIcon />
                    Download PFP
                  </>
                )}
                {downloadStatus === 'loading' && (
                  <span className="loading-wrapper">
                    <LoadingSpinner />
                    Downloading...
                  </span>
                )}
                {downloadStatus === 'success' && (
                  <>
                    <span className="download-checkmark">
                      <CheckIcon />
                    </span>
                    Downloaded
                  </>
                )}
                {downloadStatus === 'error' && (
                  <>
                    <span className="text-red-500">Failed - Try Again</span>
                  </>
                )}
              </button>
            </p>
          </>
        ) : null}
      </>
    );
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
                  {user.has_pro ? (
                    <img className="icon-pro-profile-view" src={Icon} alt="Pro" />
                  ) : null}
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
              {selectedUser.has_pro ? (
                <img className="icon-pro" src={Icon}></img>
              ) : null}
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
                  {myProfile?.has_pro ? proUser() : null}
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
                  {selectedUser.request_id && (
                    <p>
                      <span>Request ID:</span>{" "}
                      <strong>{selectedUser.request_id}</strong>
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
