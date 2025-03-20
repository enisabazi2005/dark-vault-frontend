import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./ResetPassword.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    try {
      setIsLoading(true);
      setError("");
      await api.post("/forgot-password", { email });
      setCurrentStep(2);
      setSuccess("Verification code sent to your email. Please check your spam folder if you don't see it.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send verification code");
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
      await api.post("/reset-password", { email, password, password_confirmation: passwordConfirmation });
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

        {currentStep === 2 && (
          <div className="step-content">
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                disabled={isLoading}
              />
            </div>
            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Confirm new password"
                disabled={isLoading}
              />
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