import React from 'react';
import '../StorePassword/PasswordSkeleton.css';

const PasswordSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* First Card Skeleton */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
      </div>

      {/* Second Card Skeleton - Store Password Input */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="skeleton-title"></div>
        <div className="skeleton-input"></div>
        <div className="skeleton-button"></div>
      </div>

      {/* Third Card Skeleton - Stored Passwords */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="skeleton-title"></div>
        <div className="passwordsGrid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="passwordItem">
              <div className="edit-delete-buttons">
                <div className="skeleton-password-button"></div>
                <div className="action-buttons">
                  <div className="skeleton-action-button"></div>
                  <div className="skeleton-action-button"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PasswordSkeleton; 