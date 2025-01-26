import React, { useState } from "react";
// import styles from "../Login/Login.css";
import styles from "../Login/Login.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Data Submitted:", formData);
    };

    return ( <
        div className = "container-layout" >
        <
        h2 > Login < /h2>{" "} <
        form onSubmit = { handleSubmit }
        className = "form" >
        <
        input type = "email"
        name = "email"
        value = { formData.email }
        onChange = { handleChange }
        placeholder = "E-mail"
        required /
        >
        <
        input type = "password"
        name = "password"
        value = { formData.password }
        onChange = { handleChange }
        placeholder = "Password"
        required /
        >
        <
        div className = "sphereBlack" > < /div> <div className="sphere"> </div > { " " } <
        button type = "submit"
        className = "registerButton" >
        Login { " " } <
        /button>{" "} <
        /form>{" "} <
        div className = "textLink" >
        <
        p >
        Don 't have an account? <a href="/register">Click here</a>{" "} <
        /p>{" "} <
        /div>{" "} <
        /div>
    );
};

export default Login;