import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Register/Register.css";
const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        lastname: "",
        email: "",
        password: "",
        gender: "",
        age: "",
        picture: "",
        birthdate: "",
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
        h2 > Register < /h2>{" "} <
        form onSubmit = { handleSubmit }
        className = "form" >
        <
        input type = "text"
        name = "name"
        value = { formData.name }
        onChange = { handleChange }
        placeholder = "Name"
        required /
        >
        <
        input type = "text"
        name = "lastname"
        value = { formData.lastname }
        onChange = { handleChange }
        placeholder = "Lastname"
        required /
        >
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
        div className = "row" >
        <
        div className = "col" >
        <
        select name = "gender"
        value = { formData.gender }
        onChange = { handleChange }
        required >
        <
        option value = "" > Select Gender < /option>{" "} <
        option value = "male" > Male < /option>{" "} <
        option value = "female" > Female < /option>{" "} <
        /select>{" "} <
        /div>{" "} <
        div className = "col" >
        <
        input type = "number"
        name = "age"
        value = { formData.age }
        onChange = { handleChange }
        placeholder = "Age"
        required /
        >
        <
        /div>{" "} <
        div className = "sphereBlack" > < /div> <div className="sphere"> </div > { " " } <
        /div>{" "} <
        div className = "row" >
        <
        div className = "col" >
        <
        input type = "file"
        name = "picture"
        value = { formData.picture }
        onChange = { handleChange }
        placeholder = "Upload Picture" /
        >
        <
        /div>{" "} <
        div className = "col" >
        <
        input type = "date"
        name = "birthdate"
        value = { formData.birthdate }
        onChange = { handleChange }
        required /
        >
        <
        /div>{" "} <
        /div>{" "} <
        button type = "submit"
        className = "registerButton" >
        Register { " " } <
        /button>{" "} <
        /form>{" "} <
        div className = "textLink" >
        <
        p > { " " }
        Have already an account ? { " " } <
        p >
        Have already an account ? < Link to = "/login" > Click Here < /Link>{" "} <
        /p>{" "} <
        /p>{" "} <
        /div>{" "} <
        /div>
    );
};

export default Register;