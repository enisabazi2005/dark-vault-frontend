import React from 'react';
import '../Friends/FriendsSkeleton.css';

const FriendsSkeleton = () => {
  return (
    <div className="flex-friends">
      {/* Friends Section Skeleton */}
      <div className="flex-friends-div">
        <div className="skeleton-count"></div>
        <div className="skeleton-title"></div>
        <div className="user-list">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="user-item">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-text"></div>
              <div className="unblock-div">
                <div className="skeleton-button"></div>
                <div className="skeleton-tooltip"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blocked Users Section Skeleton */}
      <div className="flex-friends-div">
        <div className="skeleton-count"></div>
        <div className="skeleton-title"></div>
        <div className="user-list">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="user-item">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-text"></div>
              <div className="unblock-div">
                <div className="skeleton-button"></div>
                <div className="skeleton-tooltip"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FriendsSkeleton; 