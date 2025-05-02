import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api'; 
import { useStore } from '../../Store/store';
import "../MettingRoom/MeetingRoom.css";

const MeetingRoom = () => {
  const { code } = useParams();
  const [group, setGroup] = useState(null);
  const { myProfile } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!myProfile) return;
    const fetchGroup = async () => {
      const res = await api.get(`/groups/code/${code}`);
      const groupData = res.data;

      const isInGroup = groupData.users_in_group.some(user => user.id === myProfile.id);
      if (!isInGroup) {
        alert("Access denied.");
        return;
      }

      setGroup(groupData);
    };

    fetchGroup();

    const handleUnload = () => {
      navigate('/dashboard/groups');
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [code, myProfile?.id, navigate]);

  if (!group) return <div>Loading meeting...</div>;

  return (
    <div className='meeting-container'>
      <iframe
        className='meeting-iframe'
        title="Meeting"
        src={`https://meet.jit.si/${code}#configOverwrite={ "startWithAudioMuted": true, "startWithVideoMuted": true, "prejoinPageEnabled": false }`}
        allow="camera; microphone; fullscreen; speaker; display-capture"
      />
    </div>
  );
};

export default MeetingRoom;
