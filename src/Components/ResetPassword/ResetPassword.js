import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./ResetPassword.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye } from "@fortawesome/free-solid-svg-icons";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoVerified, setIsAutoVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);

  const checkVerificationStatus = async () => {
    try {
      const response = await api.get(
        `/check-verification-status?email=${email}`
      );
      if (response.data.verified) {
        setIsAutoVerified(true);
        setCurrentStep(3);
        setSuccess(
          "Your email has been automatically verified. Please set your new password."
        );
      }
    } catch (error) {
      // Silently fail - manual verification still available
    }
  };

  useEffect(() => {
    if (currentStep === 2 && email) {
      const interval = setInterval(checkVerificationStatus, 5000); 
      return () => clearInterval(interval);
    }
  }, [currentStep, email]);

  const handleSendCode = async () => {
    try {
      setIsLoading(true);
      setError("");
      await api.post("/forgot-password", { email });
      setCurrentStep(2);
      setSuccess(
        "Code sent to your email. Check spam if needed."
      );
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to send verification code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name=code-${index + 1}]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join("");
    if (code.length !== 6) {
      setError("Please enter the complete verification code");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      await api.post("/verify-reset-code", { email, code });
      setCurrentStep(3);
      setSuccess("Code verified successfully. Please set your new password.");
    } catch (error) {
      setError(error.response?.data?.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password !== passwordConfirmation) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      await api.post("/reset-password", {
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Reset Password</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {currentStep === 1 && (
          <div className="step-content">
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendCode}
              disabled={isLoading || !email}
              className="submit-button"
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </button>
          </div>
        )}

        {currentStep === 2 && !isAutoVerified && (
          <div className="step-content">
            <p className="verification-note">
              We've sent a 6-digit code to your email. You can either click the
              link that has been sent!
            </p>

            <div className="verification-code-container">
              <label>Enter Verification Code</label>
              <div className="code-inputs">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    name={`code-${index}`}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    maxLength="1"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleVerifyCode}
              disabled={isLoading || verificationCode.join("").length !== 6}
              className="submit-button"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-content">
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="disabled-input"
              />
            </div>
            <div className="input-group">
              <label>New Password</label>
             <div className="password-check">
             <input
                type={showPassword1 ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                disabled={isLoading}
              />
               <button 
              className="show-password-btn show-password-btn-2"
              type="button"
              onClick={() => setShowPassword1((prev) => !prev)} >
                {showPassword1 ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
              </button>
             </div>
            </div>
            <div className="input-group">
              <label>Confirm Password</label>
              <div className="password-check">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Confirm new password"
                disabled={isLoading}
              />
              <button 
              className="show-password-btn show-password-btn-2"
              type="button"
              onClick={() => setShowPassword((prev) => !prev)} >
                {showPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
              </button>
              </div>
            </div>
            <button
              onClick={handleResetPassword}
              disabled={isLoading || !password || !passwordConfirmation}
              className="submit-button"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
