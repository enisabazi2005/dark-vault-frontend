import React from 'react';
import '../StoreEmail/EmailSkeleton.css';

const EmailSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {/* First Card Skeleton */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
      </div>

      {/* Second Card Skeleton - Store Email Input */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="skeleton-title"></div>
        <div className="skeleton-input"></div>
        <div className="skeleton-input"></div>
        <div className="skeleton-button"></div>
      </div>

      {/* Third Card Skeleton - Stored Emails */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="skeleton-title"></div>
        <div className="passwordsGrid passwordsGrid-2">
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

export default EmailSkeleton; 