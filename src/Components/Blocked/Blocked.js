import React from "react";
import api from "../../api";

const Blocked = ({ selectedUserId, isBlocked, onBlockToggle }) => {

    const handleBlockToggle = async () => {
      try {
        const response = await api.post(`/block-user/${selectedUserId}`)
        if (response.status === 200) {
          onBlockToggle(!isBlocked); 
        }
      } catch (error) {
        console.error("Error blocking/unblocking user:", error);
      }
    };
  
    return (
      <div>
        <button onClick={handleBlockToggle}>
          {isBlocked ? "Unblock" : "Block"}
        </button>
      </div>
    );
};

export default Blocked;
