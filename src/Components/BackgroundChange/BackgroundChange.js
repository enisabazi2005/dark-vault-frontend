import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import './BackgroundChange.css';

const BackgroundChange = ({ isOpen, onClose, onBackgroundChange }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentBackground, setCurrentBackground] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();

  const fetchCurrentBackground = useCallback(async () => {
    try {
      const response = await api.get('/background');
      if (response.data && response.data.option) {
        setCurrentBackground(response.data.option);
        setSelectedOption(response.data.option);
        console.log(selectedOption, 'selectedOption');
      }
    } catch (error) {
      console.error('Error fetching background:', error);
    }
  }, [selectedOption]);

  useEffect(() => {
    if (isOpen) {
      fetchCurrentBackground();
    }
  }, [isOpen, fetchCurrentBackground]);

  const handleOptionSelect = async (option) => {
    if (option === 'premium') {
      setShowPaymentModal(true);
      return;
    }
    
    try {
      const response = await api.post('/background', { option });
      if (response.data && response.data.option) {
        setCurrentBackground(response.data.option);
        onBackgroundChange(response.data.option);
      }
    } catch (error) {
      console.error('Error updating background:', error);
    }
  };

  const handlePayment = () => {
    setShowPaymentModal(false);
    navigate('/payout');
  };

  const backgroundOptions = [
    { value: 'purple_white', label: 'Purple & White', preview: 'linear-gradient(to bottom, #6862cc, #ffffff)' },
    { value: 'blue_white', label: 'Blue & White', preview: 'linear-gradient(to bottom, #3498db, #ffffff)' },
    { value: 'green_black', label: 'Green & Black', preview: 'linear-gradient(to bottom, #2ecc71, #1a1a1a)' },
    { value: 'red_black', label: 'Red & Black', preview: 'linear-gradient(to bottom, #e74c3c, #1a1a1a)' },
    { value: 'gray_black', label: 'Gray & Black', preview: 'linear-gradient(to bottom, #95a5a6, #1a1a1a)' },
    { value: 'premium', label: 'Premium Themes', preview: 'linear-gradient(to bottom, #f1c40f, #f39c12)', isPremium: true }
  ];

  if (!isOpen) return null;

  return (
    <div className="background-change-modal">
      <div className="background-change-content">
        <h2>Customize Background</h2>
        <div className="background-options">
          {backgroundOptions.map((option) => (
            <div
              key={option.value}
              className={`background-option ${currentBackground === option.value ? 'selected' : ''} ${option.isPremium ? 'premium' : ''}`}
              onClick={() => handleOptionSelect(option.value)}
            >
              <div className="color-preview" style={{ background: option.preview }}></div>
              <span>{option.label}</span>
              {option.isPremium && <span className="premium-badge">$0.50/month</span>}
            </div>
          ))}
        </div>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>

      {showPaymentModal && (
        <div className="payment-modal">
          <div className="payment-content">
            <h2>Unlock Premium Themes</h2>
            <div className="payment-details">
              <p>Get access to all premium themes for just $0.50/month</p>
              <div className="payment-amount">
                <span className="currency">$</span>
                <span className="amount">0.50</span>
                <span className="period">/month</span>
              </div>
            </div>
            <div className="payment-buttons">
              <button className="cancel-button" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button className="pay-button" onClick={handlePayment}>Subscribe Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundChange;
