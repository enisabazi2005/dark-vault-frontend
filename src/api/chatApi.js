import api from "../api";

// Messages
export const sendMessage = (payload) => api.post("/send-message", payload);
export const getMessages = (senderId, receiverId) =>
  api.get(`/messages/${senderId}/${receiverId}`);

// Reactions
export const reactToMessage = (messageId, payload) =>
  api.post(`/message/${messageId}/react`, payload);
export const removeReaction = (messageId) =>
  api.delete(`message/${messageId}/react`);
export const getGroupedReactions = () => api.get(`/reactions/grouped`);

// Users
export const getAllUsers = (token) =>
  api.get("/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getBlockedUsers = () => api.get("/blocked-users");
export const getBlockedBy = () => api.get("/blocked-by");
export const getSelectedUserFriends = (requestId) =>
  api.get(`/dark-user/${requestId}/get-friends`);

// Friend Requests
export const getPendingRequests = (requestId) =>
  api.get(`/friend-request/${requestId}/pending`);
export const getFriends = (requestId) =>
  api.get(`/friend-request/${requestId}/friends`);
export const respondToRequest = (requestId, action) =>
  api.post(`/friend-request/${requestId}/respond`, { action });