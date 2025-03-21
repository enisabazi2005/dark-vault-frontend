import React from 'react';
import '../Chatroom/ChatroomSkeleton.css';

const ChatroomSkeleton = () => {
  return (
    <div className="full-width-layout">
      <div className="row-layout">
        {/* Search Section Skeleton */}
        <div className="col-50">
          <div className="skeleton-title"></div>
          <div className="search-layout">
            <div className="skeleton-input"></div>
          </div>
          <div className="dropdown">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="dropdown-item">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-text"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected User Section Skeleton */}
        <div className="col-50">
          <div className="user-card">
            <div className="skeleton-avatar-large"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      </div>

      <div className="row-layout row-layout-friends">
        {/* Pending Requests Section Skeleton */}
        <div className="col-50">
          <div className="skeleton-title"></div>
          <div className="skeleton-list">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="friend-request-name">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-button-group">
                  <div className="skeleton-button-small"></div>
                  <div className="skeleton-button-small"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Friends List Section Skeleton */}
        <div className="col-50">
          <div className="skeleton-title"></div>
          <div className="friends-list">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="friend-item">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-text"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatroomSkeleton; 