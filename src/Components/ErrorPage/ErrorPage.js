import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPage.css';

const ErrorPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const createStars = () => {
      const starContainer = document.querySelector('.stars-container');
      if (!starContainer) return;
      
      starContainer.innerHTML = '';
      
      for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        star.style.width = `${Math.random() * 3 + 1}px`;
        star.style.height = star.style.width;
        starContainer.appendChild(star);
      }
    };

    createStars();
    window.addEventListener('resize', createStars);
    
    return () => {
      window.removeEventListener('resize', createStars);
    };
  }, []);

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="error-page">
      <div className="stars-container"></div>
      
      <div className="content-container">
        <div className="rocket-container">
          <div className="rocket">
            <div className="rocket-body">
              <div className="window"></div>
            </div>
            <div className="rocket-fin fin-left"></div>
            <div className="rocket-fin fin-right"></div>
            <div className="rocket-fire"></div>
            
            <div className="astronaut">
              <div className="astronaut-helmet">
                <div className="astronaut-glass"></div>
              </div>
              <div className="astronaut-body"></div>
            </div>
          </div>
          
          <div className="smoke-particles"></div>
        </div>
        
        <div className="text-container">
          <h1 className="error-code">404</h1>
          <h2 className="error-message">Houston, We've Reached No Page!</h2>
          <p className="error-description">
            The page you're looking for has either been launched into space or never existed.
          </p>
          <button className="home-button" onClick={handleGoHome}>
            Return to Mission Control
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;