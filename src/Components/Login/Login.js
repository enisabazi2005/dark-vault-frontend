import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import api from "../../api"; 
import OtpVerificationModal from "./OtpVerificationModal";
import "../Login/Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye, faCheck } from "@fortawesome/free-solid-svg-icons";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
  
      const { user, token, is_verified } = response.data;
  
      if (!user) {
        throw new Error("User data missing in response.");
      }
  
      console.log("User Data:", user);
  
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("request_id", user.request_id);
      localStorage.setItem("user", JSON.stringify(user));
  
      document.cookie = `user_id=${user.id}; path=/;`;
      localStorage.setItem("is_verified", is_verified);
  
      if (token && is_verified) {
        localStorage.setItem("token", token);
        setShowSuccessModal(true);
        
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate("/dashboard");
        }, 3000);
        return;
      }
  
      setUserId(user.id);
      setShowOtpModal(true);
  
    } catch (error) {
      console.error("Login failed:", error.response?.data || error);
      setError(error.response?.data?.error || error.message || "Login failed.");
    }
  };
  
  const handleOtpVerificationSuccess = (token) => {
    setShowOtpModal(false);
    setShowSuccessModal(true);
    
    setTimeout(() => {
      setShowSuccessModal(false);
      navigate("/dashboard");
    }, 3000);
  };
  
  return (
    <div className="container-layout">
      <h2>Login</h2>

      {success && <p className="success">{success}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className={`form ${showSuccessModal ? 'register-container-blur' : ''}`}>
        <input
          className="login-inputs"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="E-mail"
          required
        />
        <div className="password-check">
          <input
            className="login-inputs"
            type={showPassword ? "text" : "password"} 
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)} 
            className="show-password-btn"
          >
            {showPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
          </button>
        </div>
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

      {showSuccessModal && (
        <>
          <div className="modal-overlay"></div>
          <div className="success-modal">
            <div className="success-icon">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <div className="success-title">Login Successful!</div>
            <div className="success-message">You will be redirected to your dashboard.</div>
            <div className="success-redirect">Redirecting in a few seconds...</div>
            <div className="success-progress">
              <div className="success-progress-bar"></div>
            </div>
          </div>
        </>
      )}

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