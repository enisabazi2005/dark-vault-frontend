import React from "react";
import api from "../../api";
import useStorageStore from "../../Store/storageStore";

const Muted = ({ selectedUserId, onMuteToggle }) => {

    const userId = localStorage.getItem("user_id");
    const { usersMuted ,addMutedUser , removeMutedUser } = useStorageStore();

    const isMuted = usersMuted.includes(selectedUserId);

    const handleMuteToggle = async () => {
      try {
        const response = await api.post("/mute-unmute", {
          dark_users_id: userId,
          muted_id: selectedUserId,
          muted: !isMuted, 
        });
        if (response.status === 200) {
          onMuteToggle(!isMuted); 

          if(!isMuted) { 
            addMutedUser(selectedUserId);
          } else { 
            removeMutedUser(selectedUserId);
          }
        }
      } catch (error) {
        console.error("Error muting/unmuting user:", error);
      }
    };
  
    return (
      <div>
        <button onClick={handleMuteToggle}>
          {isMuted ? "Unmute" : "Mute"}
        </button>
      </div>
    );
  };
  
export default Muted;
