import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../api";

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [myProfile, setMyProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [myProfileGroups, setMyProfileGrups] = useState([]);
  const [myProfileAcceptedGroups, setMyProfileAcceptedGroups] = useState([]);
  const userId = localStorage.getItem("user_id");
  const request_id = localStorage.getItem("request_id");
  const token = localStorage.getItem("token");

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!userId || !token) {
        console.error("No user ID or token found");
        return;
      }

      const profileResponse = await api.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyProfile(profileResponse.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, [userId]);

  const fetchFriends = useCallback(async () => {
    if (!request_id) return;

    try {
      const token = localStorage.getItem("token");
      const friendsResponse = await api.get(
        `/friend-request/${request_id}/friends`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (friendsResponse.data) {
        setFriends(friendsResponse.data);
      } else {
        console.error("No friends data found.");
        setFriends([]);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      setFriends([]);
    }
  }, [request_id]);

  const fetchGroups = useCallback(async () => {
    if (!myProfile) return;

    try {
      const groupResponse = await api.get(
        `/groups?request_id=${myProfile.request_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (groupResponse) {
        setMyProfileGrups(groupResponse.data);
      } else {
        setMyProfileGrups([]);
      }
    } catch (error) {
      console.error("Error fetching groups", error);
      setMyProfileGrups([]);
    }
  }, [myProfile]);

  const fetchAcceptedGroups = useCallback(async () => {
    if (!myProfile) return;

    try {
      const response = await api.get(
        `/groups/member?request_id=${myProfile.request_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response) {
        setMyProfileAcceptedGroups(response.data);
      } else {
        setMyProfileAcceptedGroups([]);
      }
    } catch (error) {
      console.error("Error fetching accepted groups", error);
      myProfileAcceptedGroups([]);
    }
  }, [myProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (myProfile) {
      fetchFriends();
      fetchGroups();
      fetchAcceptedGroups();
    }
  }, [myProfile, fetchFriends, fetchGroups, fetchAcceptedGroups]);

  return (
    <StoreContext.Provider
      value={{
        myProfile,
        setMyProfile,
        friends,
        setFriends,
        myProfileGroups,
        setMyProfileGrups,
        myProfileAcceptedGroups,
        setMyProfileAcceptedGroups,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
