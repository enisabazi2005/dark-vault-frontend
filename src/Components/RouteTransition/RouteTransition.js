import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./RouteTransition.css";


const LoadingAnimation = () => {
  return (
    <div className="loading-container">
      <div className="splash-animation">
        <div className="droplet"></div>
        <div className="ripple r1"></div>
        <div className="ripple r2"></div>
        <div className="ripple r3"></div>
        <div className="splash s1"></div>
        <div className="splash s2"></div>
        <div className="splash s3"></div>
        <div className="splash s4"></div>
        <div className="splash s5"></div>
        <div className="splash s6"></div>
      </div>
    </div>
  );
};

const RouteTransition = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [prevPath, setPrevPath] = useState("");
  
  useEffect(() => {
    if (prevPath && prevPath !== location.pathname) {
      setIsLoading(true);
      
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500); 
      
      return () => clearTimeout(timer);
    }
    
    setPrevPath(location.pathname);
  }, [location.pathname, prevPath]);
  
  return (
    <>
      {isLoading && <LoadingAnimation />}
      {children}
    </>
  );
};

export default RouteTransition;