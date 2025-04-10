import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import "../Register/Register.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye } from "@fortawesome/free-solid-svg-icons";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    gender: "",
    age: "",
    picture: null,
    birthdate: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "picture") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: e.target.files[0],
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      formDataToSend.append("password_confirmation", formData.password);

      const response = await api.post("/register", formDataToSend, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Account created successfully!");
      setModalVisible(true);
      console.log("Response:", response.data);

      setTimeout(() => {
        setModalVisible(false);
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      console.error("Error registering:", error.response?.data || error);
      setError(error.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div
      className={`container-layout ${
        isModalVisible ? "register-container-blur" : ""
      }`}
    >
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}

      {/* Success Modal */}
      {isModalVisible && (
        <div className="success-modal">
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <input
          className="inputs"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <input
          className="inputs"
          type="text"
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          placeholder="Lastname"
          required
        />
        <input
          className="inputs"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="E-mail"
          required
        />
        <div className="password-check">
        <input
          className="inputs"
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <button
         className="show-password-btn"
         type="button"
         onClick={() => setShowPassword((prev) => !prev)}
         >{showPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}</button>
        </div>
        <div className="row">
          <div className="col">
            <select
              className="selects"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="col">
            <input
              className="inputs"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Age"
              required
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <input
              className="inputs"
              type="file"
              name="picture"
              onChange={handleChange}
              accept="image/*"
            />
          </div>
          <div className="col">
            <input
              className="inputs"
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="registerButton">
          Register
        </button>
      </form>

      <div className="textLink">
        <p>
          Have already an account? <Link to="/login">Click Here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
