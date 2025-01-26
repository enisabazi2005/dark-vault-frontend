import React, { useState, useEffect } from "react";
import api from "./api";
import styles from "./App.css";
import Register from "./Components/Register/Register";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Components/Login/Login";

const App = () => {
    useEffect(() => {
        // Check if the current page is the root (localhost:3000)
        if (window.location.pathname === "/") {
            window.location.href = "/login"; // Redirect to login
        }
    }, []); // This hook runs only once when the app first loads

    return ( <
        div className = "container" >
        <
        Router >
        <
        Routes >
        <
        Route path = "/register"
        element = { < Register / > }
        />{" "} <
        Route path = "/login"
        element = { < Login / > }
        />{" "} <
        /Routes>{" "} <
        /Router>{" "} <
        /div>
    );
};

export default App;