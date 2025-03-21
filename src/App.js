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
import ResetPassword from "./Components/ResetPassword/ResetPassword"
import "./App.css";

const App = () => {
  useEffect(() => {
    if (window.location.pathname === "/") {
      window.location.href = "/login"; 
    }
  }, []); 

  return (
    <div className="container">
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ResetPassword />} />

          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="store-password" element={<Password />} />
            <Route path="store-email" element={<Email />} />
            <Route path="private-info" element={<PrivateInfo />} />
            <Route path="store-notes" element={<Notes />} />
            <Route path="chatroom" element={<Chatroom />} />
            <Route path="settings" element={<Settings />}></Route>
            <Route path="friends" element={<Friends />}></Route>
          </Route>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
