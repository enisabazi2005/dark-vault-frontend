import React from "react";
import api from "../../api";

const Unfriend = ({ selectedUserId, isFriend, onUnfriendToggle }) => {

    const handleUnfriend = async () => {
      try {
        const response = await api.post(`/remove-friend/${selectedUserId}`);
        console.log(selectedUserId, 'selectedUserId');
        if (response.status === 200) {
          onUnfriendToggle(false); 
        }
      } catch (error) {
        console.error("Error removing friend:", error);
      }
    };
  
    return (
      <div>
        <button onClick={handleUnfriend}>
          {isFriend ? "Unfriend" : "You are not friends"}
        </button>
      </div>
    );
};

export default Unfriend;
