// MeetingRoom.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api'; 
import { useStore } from '../../Store/store';
import "./MeetingRoom.css";

const MeetingRoom = () => {
  const { code } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { myProfile } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!myProfile) return;
    
    const fetchGroup = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/groups/code/${code}`);
        const groupData = res.data;

        const isInGroup = groupData.users_in_group.some(user => user.id === myProfile.id);
        if (!isInGroup) {
          setError("unauthorized");
          setLoading(false);
          return;
        }

        setGroup(groupData);
        setLoading(false);
      } catch (err) {
        setError("error");
        setLoading(false);
        console.error("Error fetching group:", err);
      }
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

  if (loading) {
    return (
      <div className="meeting-container">
        <div className="meeting-status-card">
          <div className="loading-spinner"></div>
          <h2 className="status-title">Waiting for meeting...</h2>
          <p className="status-message">Preparing your video call</p>
        </div>
      </div>
    );
  }

  if (error === "unauthorized") {
    return (
      <div className="meeting-container">
        <div className="meeting-status-card error">
          <div className="status-icon unauthorized"></div>
          <h2 className="status-title">Unauthorized</h2>
          <p className="status-message">You don't have access to this meeting</p>
          <button 
            onClick={() => navigate('/dashboard/groups')}
            className="return-button"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (error === "error") {
    return (
      <div className="meeting-container">
        <div className="meeting-status-card error">
          <div className="status-icon error-icon"></div>
          <h2 className="status-title">Something went wrong</h2>
          <p className="status-message">Unable to load the meeting</p>
          <button 
            onClick={() => navigate('/dashboard/groups')}
            className="return-button"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="meeting-container">
      <div className="meeting-wrapper">
        <div className="meeting-header">
          <div className="meeting-info">
            <div className="video-icon"></div>
            <span>{group?.name || "Video Meeting"}</span>
          </div>
        </div>
        <iframe
          className="meeting-iframe"
          title="Meeting"
          src={`https://meet.jit.si/${code}#configOverwrite={ "startWithAudioMuted": true, "startWithVideoMuted": true, "prejoinPageEnabled": false }`}
          allow="camera; microphone; fullscreen; speaker; display-capture"
        />
      </div>
    </div>
  );
};

export default MeetingRoom;