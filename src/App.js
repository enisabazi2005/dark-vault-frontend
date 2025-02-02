import React, { useEffect } from "react";
import Register from "./Components/Register/Register";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Components/Login/Login";
import Dashboard from "./Components/Dashboard/Dashboard";
import Password from "./Components/StorePassword/Password";
import Email from "./Components/StoreEmail/Email";
// import "./App.css";
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

          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="store-password" element={<Password />} />
            <Route path="store-email" element={<Email />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
