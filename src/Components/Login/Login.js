import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import api from "../../api"; 
import OtpVerificationModal from "./OtpVerificationModal";
import "../Login/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
  
    try {
      const response = await api.post("/login", formData);
      console.log("Login API Response:", response.data);
  
      if (!response || !response.data) {
        throw new Error("Invalid response from the server.");
      }
  
      const { user, token, message, is_verified } = response.data;
  
      if (!user) {
        throw new Error("User data missing in response.");
      }
  
      console.log("User Data:", user);
  
      // Store user data regardless of verification status
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("request_id", user.request_id);
      localStorage.setItem("user", JSON.stringify(user));
  
      // Store verification status in localStorage
      localStorage.setItem("is_verified", is_verified);
  
      // If token exists and verified, navigate to dashboard
      if (token && is_verified) {
        localStorage.setItem("token", token);
        navigate("/dashboard");
        return;
      }
  
      // If no token or not verified, show OTP modal
      setUserId(user.id);
      setShowOtpModal(true);
  
    } catch (error) {
      console.error("Login failed:", error.response?.data || error);
      setError(error.response?.data?.error || error.message || "Login failed.");
    }
  };
  

  const handleOtpVerificationSuccess = (token) => {
    setShowOtpModal(false);
    setSuccess("Logged in successfully!");
    
    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
  };
  
  return (
    <div className="container-layout">
      <h2>Login</h2>

      {success && <p className="success">{success}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="form">
        <input
          className="login-inputs"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="E-mail"
          required
        />
        <input
          className="login-inputs"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <div className="sphereBlack"></div>
        <div className="sphere"></div>
        <button type="submit" className="registerButton">
          Login
        </button>
      </form>

      <div className="textLink">
        <p>
          Forgot your password? <a href="/forgot-password">Reset Password here</a>
        </p>
      </div>
      <div className="textLink">
        <p>
          Don't have an account? <a href="/register">Click here</a>
        </p>
      </div>

      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        userId={userId}
        onVerificationSuccess={handleOtpVerificationSuccess}
      />
    </div>
  );
};

export default Login;
