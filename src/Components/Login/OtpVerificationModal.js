import React, { useState, useRef, useEffect } from 'react';
import api from '../../api';
import './OtpVerificationModal.css';

const OtpVerificationModal = ({ isOpen, onClose, userId, onVerificationSuccess }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (isOpen && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [isOpen]);

    const handleChange = (index, value) => {
        if (value.length > 1) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
          setError('Please enter a valid 6-digit OTP');
          return;
        }
      
        setIsLoading(true);
        setError('');
      
        try {
          const response = await api.post('/verify-otp', {
            user_id: userId,
            otp_code: otpCode
          });
      
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
      
            // Set device verified flag
            localStorage.setItem('device_verified', 'true');
            localStorage.setItem('device_verified_user', userId);
      
            onVerificationSuccess(response.data.token);
          }
        } catch (error) {
          setError(error.response?.data?.error || 'Invalid OTP. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      

    if (!isOpen) return null;

    return (
        <div className="otp-modal-overlay">
            <div className="otp-modal-content">
                <h2>Verify Your Identity</h2>
                <p>Please enter the 6-digit verification code sent to your device</p>
                
                <div className="otp-input-container">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="otp-input"
                        />
                    ))}
                </div>

                {error && <p className="otp-error">{error}</p>}

                <button 
                    className="otp-submit-btn"
                    onClick={handleSubmit}
                    disabled={isLoading || otp.join('').length !== 6}
                >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
            </div>
        </div>
    );
};

export default OtpVerificationModal; 