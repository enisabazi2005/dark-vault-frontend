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
    
    const defaultBlankPhotoUrl =
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    const fetchGroups = useCallback(async () => {
        try {
            const response = await api.get(`/groups?request_id=${myProfile.request_id}`);
            setGroups(response.data); 
        } catch (error) {
            console.error("Error fetching admin groups:", error);
        }
    }, [myProfile?.request_id]);

    const fetchAcceptedGroups = useCallback(async () => {
        try {
            const response = await api.get(`/groups/member?request_id=${myProfile.request_id}`);
            setAcceptedGroups(response.data);
        } catch (error) {
            console.error("Error fetching accepted groups:", error);
        }
    }, [myProfile?.request_id]);

    const fetchPendingInvites = useCallback(async () => {
        try {
            const response = await api.get('/groups/pending');
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

            setGroups(groups.map(g => g.id === editingGroup.id ? response.data.group : g));

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
        setInvitedUsers(prevState =>
            prevState.includes(friendId)
                ? prevState.filter(id => id !== friendId)
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
            await api.post(`/groups/${selectedGroup.id}/invite`, {
                users_invited: invitedUsers
            });
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
                accepted: accepted
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
    };

    const handleCloseChat = () => {
        setActiveChat(null);
        setChatMessage("");
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
            // Add your API call here to fetch group members
            // For now, we'll use the users_in_group array
            setGroupMembers(group.users_in_group);
            setShowMembersModal(true);
        } catch (error) {
            console.error("Error fetching group members:", error);
        }
    };

    const renderChat = () => {
        if (!activeChat) return null;

        return (
            <>
                <div className="chat-overlay" onClick={handleCloseChat} />
                <div className="chat-container">
                    <div className="chat-header" onClick={() => handleShowMembers(activeChat)}>
                        <h2>{activeChat.title}</h2>
                        <button className="chat-close-btn" onClick={handleCloseChat}>×</button>
                    </div>
                    <div className="-messages">
                    </div>
                    <div className="chat-input-container">
                        <textarea
                            className="chat-textarea"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Type your message..."
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        />
                        <button className="chat-send-btn" onClick={handleSendMessage}>
                            Send
                        </button>
                    </div>
                </div>
            </>
        );
    };

    const renderGroupMembersModal = () => {
        if (!showMembersModal) return null;

        return (
            <div className="group-members-modal" onClick={() => setShowMembersModal(false)}>
                <div className="group-members-content" onClick={e => e.stopPropagation()}>
                    <h2>Group Members</h2>
                    <div className="group-members-list">
                        {groupMembers.map(memberId => {
                            const member = friends.find(f => f.id === memberId);
                            return (
                                <div key={memberId} className="member-item">
                                    <img
                                        src={member?.picture ? `${STORAGE_URL}/${member.picture}` : defaultBlankPhotoUrl}
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
                                <a href={group.group_link} className="group-link">Join</a>
                                <button onClick={() => handleOpenChat(group)}>Open Group</button>
                                {isAdmin && (
                                    <>
                                        <button onClick={() => handleEditClick(group)}>Edit</button>
                                        <button onClick={() => handleInviteClick(group)}>Invite</button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );

    const renderCreateGroup = () => (
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
                    {friends.map(friend => (
                        <div key={friend.id} className="friend-item">
                            <img
                                src={
                                    friend.picture
                                        ? `${STORAGE_URL}/${friend.picture}`
                                        : defaultBlankPhotoUrl
                                }
                                alt={`${friend.first_name} ${friend.last_name}`}
                                className="friend-avatar"
                            />
                            <span>{friend.first_name} {friend.last_name}</span>
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
    );

    const renderInviteModal = () => (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Invite Friends to {selectedGroup?.title}</h2>
                <div className="friends-list">
                    {friends.map(friend => (
                        <div key={friend.id} className="friend-item">
                            <img
                                src={
                                    friend.picture
                                        ? `${STORAGE_URL}/${friend.picture}` 
                                        : defaultBlankPhotoUrl
                                }
                                alt={`${friend.first_name} ${friend.last_name}`}
                                className="friend-avatar"
                            />
                            <span>{friend.first_name} {friend.last_name}</span>
                            <button
                                onClick={() => handleFriendSelection(friend.id)}
                                className={invitedUsers.includes(friend.id) ? "selected" : ""}
                            >
                                {invitedUsers.includes(friend.id) ? "Remove" : "Invite"}
                            </button>
                        </div>
                    ))}
                </div>
                <div className="modal-actions">
                    <button onClick={handleInviteSubmit} disabled={invitedUsers.length === 0}>
                        Send Invites
                    </button>
                    <button onClick={() => setShowInviteModal(false)}>Cancel</button>
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

        return (
            <div className="pending-invites-section">
                <div className="pending-invites-grid">
                    {pendingInvites.map((invite) => (
                        <div key={invite.code} className="pending-invite-card">
                            <div className="invite-info">
                                <h3>Group Code: {invite.code}</h3>
                                <p>Invited by: {invite.invited_by}</p>
                                <p>Members: {Array.isArray(invite.users_in_group) ? invite.users_in_group.length : 0}</p>
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
                        {friends.map(friend => (
                            <div key={friend.id} className="friend-item">
                                <img
                                    src={
                                        friend.picture
                                            ? `${STORAGE_URL}/${friend.picture}`
                                            : defaultBlankPhotoUrl
                                    }
                                    alt={`${friend.first_name} ${friend.last_name}`}
                                    className="friend-avatar"
                                />
                                <span>{friend.first_name} {friend.last_name}</span>
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
