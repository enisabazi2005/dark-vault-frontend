import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api";
import { useEffect } from "react";

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [myProfile, setMyProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const userId = localStorage.getItem("user_id");
  const request_id = localStorage.getItem("request_id");

  // Fetch profile data function
  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!userId || !token) {
        console.error("No user ID or token found");
        return;
      }

      // Fetching the profile data
      const profileResponse = await api.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyProfile(profileResponse.data);

    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, [userId]); // Now `userId` is part of the dependency array

  // Fetch friends data function
  const fetchFriends = useCallback(async () => {
    if (!request_id) return; // Make sure request_id is available before fetching

    try {
      const token = localStorage.getItem("token");
      const friendsResponse = await api.get(`/friend-request/${request_id}/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Debugging the friends response
      console.log("Friends Response:", friendsResponse.data);

      // Ensure data is valid before updating state
      if (friendsResponse.data) {
        setFriends(friendsResponse.data);
      } else {
        console.error("No friends data found.");
        setFriends([]);
      }

    } catch (error) {
      console.error("Error fetching friends:", error);
      setFriends([]); // Ensure an empty list in case of error
    }
  }, [request_id]); // Now `request_id` is part of the dependency array

  useEffect(() => {
    // Fetch profile first
    fetchProfile();
  }, [fetchProfile]); // Dependency array with `fetchProfile`

  // Once profile is loaded, fetch friends
  useEffect(() => {
    if (myProfile) {
      fetchFriends();
    }
  }, [myProfile, fetchFriends]); // Dependency array with `myProfile` and `fetchFriends`

  return (
    <StoreContext.Provider value={{ myProfile, setMyProfile, friends, setFriends }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
