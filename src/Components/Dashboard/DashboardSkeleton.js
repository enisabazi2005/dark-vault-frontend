import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDatabase,
  faChartPie,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import '../Dashboard/DashboardSkeleton.css';

const DashboardSkeleton = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar Skeleton */}
      <aside className="sidebar">
        <div className="sidebar-content">
          <div className="sidebar-header">
            <div className="skeleton-logo"></div>
          </div>
          <nav className="sidebar-nav">
            {[...Array(7)].map((_, index) => (
              <div key={index} className="skeleton-nav-item"></div>
            ))}
          </nav>
          <div className="skeleton-logout"></div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="main-content">
        <div className="dashboard-grid">
          {/* Welcome Card Skeleton */}
          <div className="dashboard-card welcome-card">
            <div className="card-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-name"></div>
              <div className="skeleton-message"></div>
            </div>
          </div>

          {/* Storage Usage Card Skeleton */}
          <div className="dashboard-card storage-card">
            <div className="card-header">
              <FontAwesomeIcon icon={faDatabase} />
              <div className="skeleton-header"></div>
            </div>
            <div className="card-content">
              <div className="skeleton-gauge"></div>
              <div className="skeleton-storage-info"></div>
            </div>
          </div>

          {/* Data Distribution Card Skeleton */}
          <div className="dashboard-card">
            <div className="card-header">
              <FontAwesomeIcon icon={faChartPie} />
              <div className="skeleton-header"></div>
            </div>
            <div className="card-content">
              <div className="skeleton-chart"></div>
            </div>
          </div>

          {/* Security Status Card Skeleton */}
          <div className="dashboard-card">
            <div className="card-header">
              <FontAwesomeIcon icon={faShieldAlt} />
              <div className="skeleton-header"></div>
            </div>
            <div className="card-content">
              <div className="security-features">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="skeleton-feature"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardSkeleton; 