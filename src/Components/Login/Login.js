import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import OtpVerificationModal from "./OtpVerificationModal";
import "../Login/Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye, faCheck } from "@fortawesome/free-solid-svg-icons";
import { GoogleLogin } from "@react-oauth/google";

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
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("remember_email");
    const savedPassword = localStorage.getItem("remember_password");

    if (savedEmail && savedPassword) {
      setFormData({ email: savedEmail, password: savedPassword });
      setRememberMe(true);
    }
  }, []);

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

    if (rememberMe) {
      localStorage.setItem("remember_email", formData.email);
      localStorage.setItem("remember_password", formData.password);
    } else {
      localStorage.removeItem("remember_email");
      localStorage.removeItem("remember_password");
    }
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

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const response = await api.post("/google-auth", {
        token: credentialResponse.credential,
      });

      console.log("Backend response:", response.data);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("user_id", response.data.user.id);
        localStorage.setItem("request_id", response.data.user.request_id);
        localStorage.setItem("is_verified", response.data.is_verified);

        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate("/dashboard");
        }, 3000);
      }
    } catch (error) {
      console.error("Google login failed:", error);
      setError(error.response?.data?.error || "Google login failed");
    }
  };

  return (
    <div className="container-layout">
      <div className="ocean-section">
        <div className="ocean-animation"></div>
        <div className="ocean-overlay"></div>
        <div className="ocean-content">
          <h1>Welcome Back</h1>
          <p>
            Secure your digital assets with our advanced encryption technology.
            Your security is our top priority.
          </p>
        </div>
      </div>

      <div className="form-section">
        <form
          onSubmit={handleSubmit}
          className={`form ${
            showSuccessModal ? "register-container-blur" : ""
          }`}
        >
          <h2>Login</h2>
          {success && <p className="success">{success}</p>}
          {error && <p className="error">{error}</p>}

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
              {showPassword ? (
                <FontAwesomeIcon icon={faEye} />
              ) : (
                <FontAwesomeIcon icon={faEyeSlash} />
              )}
            </button>
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
          </div>
          <button type="submit" className="registerButton">
            Login
          </button>

          <div className="google-login-container google-login-container-div">
            <div className="or-divider">OR</div>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.error("Google Login Failed");
                setError("Google login failed");
              }}
              useOneTap
              flow="implicit"
            />
          </div>
        </form>

        <div className="textLink">
          <p>
            Forgot your password?{" "}
            <a href="/forgot-password">Reset Password here</a>
          </p>
        </div>
        <div className="textLink">
          <p>
            Don't have an account? <a href="/register">Click here</a>
          </p>
        </div>
      </div>

      {showSuccessModal && (
        <>
          <div className="modal-overlay"></div>
          <div className="success-modal">
            <div className="success-icon">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <div className="success-title">Login Successful!</div>
            <div className="success-message">
              You will be redirected to your dashboard.
            </div>
            <div className="success-redirect">
              Redirecting in a few seconds...
            </div>
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
