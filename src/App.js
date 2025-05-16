import React, { useEffect } from "react";
import Register from "./Components/Register/Register";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Components/Login/Login";
import Dashboard from "./Components/Dashboard/Dashboard";
import Password from "./Components/StorePassword/Password";
import Email from "./Components/StoreEmail/Email";
import PrivateInfo from "./Components/PrivateInfo/PrivateInfo";
import Notes from "./Components/StoreNotes/Notes";
import Chatroom from "./Components/Chatroom/Chatroom";
import Settings from "./Components/Settings/Settings";
import Friends from "./Components/Friends/Friends";
import ResetPassword from "./Components/ResetPassword/ResetPassword";
import Groups from "./Components/Groups/Groups";
import Bot from "./Components/Bot/Bot";
import RouteTransition from "./Components/RouteTransition/RouteTransition";
import "./App.css";
import { StoreProvider } from "./Store/store";
import MeetingRoom from "./Components/MettingRoom/MettingRoom";
import ErrorPage from "./Components/ErrorPage/ErrorPage";
import Paypal from "./Components/Paypal/Paypal";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "./api";


const App = () => {
  useEffect(() => {
    if (window.location.pathname === "/") {
      window.location.href = "/login"; 
    }
  }, []); 
  console.log("Google Client ID:", GOOGLE_CLIENT_ID);


  return (
    <div className="container">
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <StoreProvider>
        <Router>
          <RouteTransition>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ResetPassword />} />
              {/* <Route path="meeting/:code" element={<MeetingRoom />} /> */}

              <Route path="/dashboard" element={<Dashboard />}>
                <Route path="bot" element={<Bot />}></Route>
                <Route path="store-password" element={<Password />} />
                <Route path="store-email" element={<Email />} />
                <Route path="private-info" element={<PrivateInfo />} />
                <Route path="store-notes" element={<Notes />} />
                <Route path="chatroom" element={<Chatroom />} />
                <Route path="settings" element={<Settings />}></Route>
                <Route path="friends" element={<Friends />}></Route>
                <Route path="groups" element={<Groups />}></Route>
                <Route path="meeting/:code" element={<MeetingRoom />} />
                <Route path="paypal-payment" element={<Paypal />} />
                </Route>

              {/* <Route path="/payout" element={<Payout />} /> */}
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </RouteTransition>
        </Router>
      </StoreProvider>
      </GoogleOAuthProvider>
    </div>
  );
};

export default App;
