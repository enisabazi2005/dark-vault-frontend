import { useEffect, useState, useCallback } from "react";
import api from "../../api";
import { useStore } from "../../Store/store";
import { STORAGE_URL } from "../../api";
import "./Groups.css";

const Groups = () => {
  const { myProfile, friends } = useStore();
  const [groups, setGroups] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [acceptedGroups, setAcceptedGroups] = useState([]);
  const [isGroupModalClosed, setIsGroupModalClosed] = useState(false);

  const defaultBlankPhotoUrl =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  const fetchGroups = useCallback(async () => {
    try {
      const response = await api.get(
        `/groups?request_id=${myProfile.request_id}`
      );
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching admin groups:", error);
    }
  }, [myProfile?.request_id]);

  const fetchAcceptedGroups = useCallback(async () => {
    try {
      const response = await api.get(
        `/groups/member?request_id=${myProfile.request_id}`
      );
      setAcceptedGroups(response.data);
    } catch (error) {
      console.error("Error fetching accepted groups:", error);
    }
  }, [myProfile?.request_id]);

  const fetchPendingInvites = useCallback(async () => {
    try {
      const response = await api.get("/groups/pending");
      setPendingInvites(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching pending invites:", error);
      setPendingInvites([]);
    }
  }, []);

  useEffect(() => {
    if (!myProfile?.request_id) return;
    fetchGroups();
    fetchAcceptedGroups();
    fetchPendingInvites();
  }, [myProfile, fetchGroups, fetchAcceptedGroups, fetchPendingInvites]);

  const handleEditClick = (group) => {
    setEditingGroup(group);
    setNewTitle(group.title);
  };

  const handleSaveEdit = async () => {
    if (!editingGroup) return;

    try {
      const response = await api.patch(`/groups/edit/${editingGroup.id}`, {
        request_id: myProfile.request_id,
        title: newTitle,
      });

      setGroups(
        groups.map((g) => (g.id === editingGroup.id ? response.data.group : g))
      );

      setEditingGroup(null);
    } catch (error) {
      console.error("Error updating group:", error);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupTitle) {
      alert("Please provide a title for the new group");
      return;
    }

    try {
      const response = await api.post("/groups/create", {
        request_id: myProfile.request_id,
        title: newGroupTitle,
        users_invited: invitedUsers,
      });

      setGroups([response.data.group, ...groups]);
      setNewGroupTitle("");
      setInvitedUsers([]);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleFriendSelection = (friendId) => {
    setInvitedUsers((prevState) =>
      prevState.includes(friendId)
        ? prevState.filter((id) => id !== friendId)
        : [...prevState, friendId]
    );
  };

  const handleInviteClick = (group) => {
    setSelectedGroup(group);
    setShowInviteModal(true);
    setInvitedUsers([]);
  };

  const handleInviteSubmit = async () => {
    if (!selectedGroup || invitedUsers.length === 0) return;

    try {
      await Promise.all(
        invitedUsers.map(async (userId) => {
          await api.post(`/groups/invite`, {
            group_id: selectedGroup.id,
            user_id: userId,
          });
        })
      );

      setShowInviteModal(false);
      setInvitedUsers([]);
      setSelectedGroup(null);
      fetchGroups();
    } catch (error) {
      console.error("Error inviting users:", error);
    }
  };

  const handleInviteResponse = async (groupId, accepted) => {
    try {
      await api.patch(`/groups/${groupId}/respond`, {
        accepted: accepted,
      });
      fetchPendingInvites();
      fetchGroups();
      fetchAcceptedGroups();
    } catch (error) {
      console.error("Error responding to invite:", error);
    }
  };

  const handleOpenChat = (group) => {
    setActiveChat(group);
    setChatMessage("");
    setIsGroupModalClosed(true);
    fetchGroups();
    fetchAcceptedGroups();
  };

  const handleCloseChat = () => {
    setActiveChat(null);
    setChatMessage("");
    setIsGroupModalClosed(false);
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !activeChat) return;

    try {
      console.log("Sending message:", chatMessage);
      setChatMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleShowMembers = async (group) => {
    try {
      setGroupMembers(group.users_in_group);
      setShowMembersModal(true);
    } catch (error) {
      console.error("Error fetching group members:", error);
    }
  };

  console.log(handleShowMembers);

  const renderChat = () => {
    if (!activeChat) return null;

    const isAdmin = myProfile.id === activeChat.admin_id;

    return (
      <>
        <div className="chat-overlay" onClick={handleCloseChat} />
        <div className="chat-container">
          <div className="chat-header">
            <h2>{activeChat.title}</h2>
            <button className="chat-close-btn" onClick={handleCloseChat}>
              ×
            </button>
          </div>
          <div className="chat-members-section">
            <div className="chat-members-header">
              <h3>Members</h3>
            </div>
            <div className="chat-members-list">
              {activeChat.users_in_group?.map((memberId) => {
                const member =
                  memberId === myProfile.id
                    ? myProfile
                    : friends.find((f) => f.id === memberId);
                if (!member) return null;

                const isMyProfile = memberId === myProfile.id;
                const isAdminMember = memberId === activeChat.admin_id;
                const isSemiAdminMember = memberId === activeChat.semi_admin_id;
                console.log(
                  isAdminMember,
                  "isAdminMember",
                  isSemiAdminMember,
                  "isSemiAdminMember"
                );

                return (
                  <div
                    key={memberId}
                    className={`chat-member-item ${
                      isAdminMember ? "admin-member" : ""
                    } ${isSemiAdminMember ? "semi-admin-member" : ""}`}
                  >
                    <img
                      src={
                        member.picture
                          ? `${STORAGE_URL}/${member.picture}`
                          : defaultBlankPhotoUrl
                      }
                      alt={`${member.name} ${member.lastname}`}
                      className="chat-member-avatar"
                    />
                    <div className="chat-member-info">
                      <span className="chat-member-name">
                        {member.name} {member.lastname}{" "}
                        {isMyProfile ? "(You)" : ""}
                      </span>
                      <span
                        className={`chat-member-status ${
                          isAdminMember ? "admin-status" : ""
                        } ${isSemiAdminMember ? "semi-admin-status" : ""}`}
                      >
                        {isAdminMember
                          ? "Admin"
                          : isSemiAdminMember
                          ? "Semi-Admin"
                          : member.online
                          ? "Online"
                          : "Offline"}
                      </span>
                    </div>
                    {isAdmin && !isMyProfile && !isAdminMember && (
                      <div className="admin-controls">
                        <button
                          className="admin-btn remove-btn"
                          onClick={() => handleRemoveUser(memberId)}
                          title="Remove member"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                        {isSemiAdminMember ? (
                          <button
                            className="admin-btn demote-btn"
                            onClick={() => handleDemoteUser(memberId)}
                            title="Remove Semi-Admin role"
                          >
                            <i className="fas fa-arrow-down"></i>
                          </button>
                        ) : (
                          <button
                            className="admin-btn promote-btn"
                            onClick={() => handlePromoteUser(memberId)}
                            title="Promote to Semi-Admin"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="chat-messages"></div>
          <div className="chat-input-container">
            <textarea
              className="chat-textarea"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSendMessage()
              }
            />
            <button className="chat-send-btn" onClick={handleSendMessage}>
              Send
            </button>
          </div>
        </div>
      </>
    );
  };

  const handleRemoveUser = async (userId) => {
    if (!activeChat) return;

    try {
      const response = await api.patch(`/groups/${activeChat.id}/remove-user`, {
        user_id: userId,
      });

      console.log(`User ${userId} removed successfully`, response.data);

      setActiveChat((prevChat) => ({
        ...prevChat,
        users_in_group: prevChat.users_in_group.filter((id) => id !== userId),
      }));

      fetchGroups();
      fetchAcceptedGroups();
    } catch (error) {
      console.error(
        "Error removing user:",
        error.response?.data || error.message
      );
    }
  };

  const handlePromoteUser = async (userId) => {
    if (!activeChat) return;

    try {
      const response = await api.post(`/group/${activeChat.id}/promote`, {
        user_id: userId,
      });
      console.log(response, "response");
      setActiveChat((prevChat) => ({
        ...prevChat,
        semi_admin_id: userId,
      }));

      if (!isGroupModalClosed) {
        fetchGroups();
        fetchAcceptedGroups();
      }
      fetchGroups();
      fetchAcceptedGroups();
    } catch (error) {
      console.error(
        "Error promoting user:",
        error.response?.data || error.message
      );
    }
  };

  const handleDemoteUser = async (userId) => {
    console.log("Demoting this user", userId);
  };

  const renderGroupMembersModal = () => {
    if (!showMembersModal) return null;

    return (
      <div
        className="group-members-modal"
        onClick={() => setShowMembersModal(false)}
      >
        <div
          className="group-members-content"
          onClick={(e) => e.stopPropagation()}
        >
          <h2>Group Members</h2>
          <div className="group-members-list">
            {groupMembers.map((memberId) => {
              const member = friends.find((f) => f.id === memberId);
              return (
                <div key={memberId} className="member-item">
                  <img
                    src={
                      member?.picture
                        ? `${STORAGE_URL}/${member.picture}`
                        : defaultBlankPhotoUrl
                    }
                    alt={`${member?.first_name} ${member?.last_name}`}
                    className="member-avatar"
                  />
                  <span className="member-name">
                    {member?.first_name} {member?.last_name}
                  </span>
                </div>
              );
            })}
          </div>
          <button onClick={() => setShowMembersModal(false)}>Close</button>
        </div>
      </div>
    );
  };

  const renderGroupList = (groups, isAdmin = false) => (
    <ul>
      {groups.map((group) => (
        <li key={group.id}>
          {editingGroup?.id === group.id ? (
            <div className="edit-group">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter new group title"
              />
              <div className="button-group">
                <button onClick={handleSaveEdit}>Save</button>
                <button onClick={() => setEditingGroup(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="group-info">
              <span className="group-title">{group.title}</span>
              <div className="group-actions">
                {/* <a href={group.group_link} className="group-link">Join</a> */}
                <a
                  href={`${group.group_link}?user=${myProfile.id}`}
                  className="group-link"
                >
                  Join
                </a>
                <button onClick={() => handleOpenChat(group)}>
                  Open Group
                </button>
                {isAdmin && (
                  <>
                    <button onClick={() => handleEditClick(group)}>Edit</button>
                    <button onClick={() => handleInviteClick(group)}>
                      Invite
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const renderInviteModal = () => (
    <div className="dark-vault-group-modal-overlay">
      <div className="dark-vault-group-modal-content">
        <h2>Invite Friends to {selectedGroup?.title}</h2>
        <div className="dark-vault-group-friends-selection-box">
          <h3>Invite Friends</h3>
          <div className="dark-vault-group-friends-list">
            {friends.map((friend) => {
              const isMember = selectedGroup?.users_in_group?.includes(
                friend.id
              );
              const isInvited = selectedGroup?.users_invited?.includes(
                friend.id
              );

              return (
                <div key={friend.id} className="dark-vault-group-friend-item">
                  <img
                    src={
                      friend.picture
                        ? `${STORAGE_URL}/${friend.picture}`
                        : defaultBlankPhotoUrl
                    }
                    alt={`${friend.first_name} ${friend.last_name}`}
                    className="dark-vault-group-friend-avatar"
                  />
                  <span className="dark-vault-group-friend-name">
                    {friend.name} {friend.lastname}
                  </span>
                  {isMember ? (
                    <div className="dark-vault-group-status-icon member">
                      <i className="fas fa-check"></i>
                    </div>
                  ) : isInvited ? (
                    <div className="dark-vault-group-loading-spinner"></div>
                  ) : (
                    <button
                      onClick={() => handleFriendSelection(friend.id)}
                      className={`dark-vault-group-friend-invite-btn ${
                        invitedUsers.includes(friend.id) ? "selected" : ""
                      }`}
                    >
                      Invite
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="dark-vault-group-modal-actions">
          <button
            onClick={handleInviteSubmit}
            disabled={invitedUsers.length === 0}
            className="dark-vault-group-submit-btn"
          >
            Send Invites
          </button>
          <button
            onClick={() => setShowInviteModal(false)}
            className="dark-vault-group-cancel-btn"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderPendingInvites = () => {
    if (!Array.isArray(pendingInvites) || pendingInvites.length === 0) {
      return (
        <div className="pending-invites-section">
          <h2>Pending Invites</h2>
          <p className="no-invites">No pending invites</p>
        </div>
      );
    }

    const adminName = pendingInvites.map((invite) => {
      const admin = invite.invited_by;

      if (myProfile.id === admin) {
        return myProfile.name;
      }
      const friend = friends.find((f) => f.id === admin);
      return friend ? friend.name : "test";
    });
    return (
      <div className="pending-invites-section">
        <div className="pending-invites-grid">
          {pendingInvites.map((invite) => (
            <div key={invite.code} className="pending-invite-card">
              <div className="invite-info">
                <h3>Group Code: {invite.code}</h3>
                <p>
                  Group Name: <strong>{invite.group_name}</strong>
                </p>
                <p>
                  Invited by: <strong>{adminName}</strong>
                </p>
                <p>
                  Members:{" "}
                  <strong>
                    {Array.isArray(invite.users_in_group)
                      ? invite.users_in_group.length
                      : 0}
                  </strong>
                </p>
              </div>
              <div className="invite-actions">
                <button
                  className="accept-btn"
                  onClick={() => handleInviteResponse(invite.group_id, true)}
                >
                  Accept
                </button>
                <button
                  className="decline-btn"
                  onClick={() => handleInviteResponse(invite.group_id, false)}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className="group-container">
      <h1>My Groups</h1>

      <div className="my-groups-section">
        <h2>My Groups</h2>
        {groups.length === 0 ? (
          <p className="no-invites">No groups found.</p>
        ) : (
          renderGroupList(groups, true)
        )}
      </div>

      <div className="accepted-groups-section">
        <h2>Accepted Groups</h2>
        {acceptedGroups.length === 0 ? (
          <p className="no-invites">No accepted groups found.</p>
        ) : (
          renderGroupList(acceptedGroups, false)
        )}
      </div>

      <div className="pending-invites-section">
        {/* <h2>Pending Invites</h2> */}
        {renderPendingInvites()}
      </div>

      <div className="create-group">
        <h2>Create a New Group</h2>
        <input
          type="text"
          placeholder="Group Title"
          value={newGroupTitle}
          onChange={(e) => setNewGroupTitle(e.target.value)}
        />
        <div className="friends-selection-box">
          <h3>Invite Friends</h3>
          <div className="friends-list">
            {friends.map((friend) => (
              <div key={friend.id} className="group-friend-item">
                <img
                  src={
                    friend.picture
                      ? `${STORAGE_URL}/${friend.picture}`
                      : defaultBlankPhotoUrl
                  }
                  alt={`${friend.first_name} ${friend.last_name}`}
                  className="friend-avatar"
                />
                <span className="niger">
                  {friend.name} {friend.lastname}
                </span>
                <button
                  onClick={() => handleFriendSelection(friend.id)}
                  className={invitedUsers.includes(friend.id) ? "selected" : ""}
                >
                  {invitedUsers.includes(friend.id) ? "Remove" : "Invite"}
                </button>
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleCreateGroup}>Create Group</button>
      </div>

      {showInviteModal && renderInviteModal()}
      {renderChat()}
      {renderGroupMembersModal()}
    </div>
  );
};

export default Groups;
