import React, { useState , useEffect } from "react";
import "./DailyMessage.css";

const DailyMessage = () => { 
   const [currentTime, setCurrentTime] = useState(new Date());

   useEffect(() => {
     const interval = setInterval(() => { 
       setCurrentTime(new Date());
     }, 1000);

     return () => clearInterval(interval);
   }, []);

   const dayName = currentTime.toLocaleDateString("en-US", { weekday: "long" });
   const formattedTime = currentTime.toLocaleTimeString("en-US", {
     hour: "2-digit",
     minute: "2-digit",
     second: "2-digit",
   });
 
   const formattedDate = currentTime.toLocaleDateString("en-US", {
     year: "numeric",
     month: "long",
     day: "numeric",
   });
 
   const upcomingUpdate = "August 16, 2025";

   return (
    <div className="daily-date-container">
      <h2>Today: <strong>{dayName}</strong></h2>
      <p>Date: <strong>{formattedDate}</strong></p>
      <p>Time: <strong>{formattedTime}</strong></p>
      <p>Upcoming Update: <strong>{upcomingUpdate}</strong></p>
    </div>
  );
}

export default DailyMessage;