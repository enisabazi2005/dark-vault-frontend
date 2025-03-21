import React from 'react';
import '../MyProfile/MyProfileSkeleton.css';

const MyProfileSkeleton = () => {
  return (
    <div className="profile-settings-wrapper">
      <div className="profile-settings">
        <div className="profile-info-row">
          {/* Notification Skeleton */}
          <div className="profile-info-col profile-info-col-notification">
            <div className="skeleton-notification"></div>
          </div>
          
          {/* Profile Picture Skeleton */}
          <div className="profile-info-col">
            <div className="skeleton-profile-pic"></div>
          </div>
          
          {/* User Info Skeleton */}
          <div className="profile-info-col profile-info-col-user-names">
            <div className="skeleton-user-name"></div>
            <div className="skeleton-user-status"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfileSkeleton; 