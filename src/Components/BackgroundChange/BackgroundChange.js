import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./BackgroundChange.css";
import { useStore } from "../../Store/store";

const BackgroundChange = ({ isOpen, onClose, onBackgroundChange }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentBackground, setCurrentBackground] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPremiumColors, setShowPremiumColors] = useState(false);
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [customColor1, setCustomColor1] = useState("#6862cc");
  const [customColor2, setCustomColor2] = useState("#ffffff");
  const navigate = useNavigate();
  const { myProfile } = useStore();


  const fetchCurrentBackground = useCallback(async () => {
    try {
      const response = await api.get("/background");
      if (response.data && response.data.option) {
        setCurrentBackground(response.data.option);
        setSelectedOption(response.data.option);
        console.log(selectedOption, "selectedOption");
      }
    } catch (error) {
      console.error("Error fetching background:", error);
    }
  }, [selectedOption]);

  useEffect(() => {
    if (isOpen) {
      fetchCurrentBackground();
    }
  }, [isOpen, fetchCurrentBackground]);

  const handleOptionSelect = async (option) => {
    if (option === "premium") {
      setShowPaymentModal(true);
      return;
    }

    if (option === "custom") {
      setShowCustomColor(true);
      return;
    }


    try {
      const response = await api.post("/background", { option });
      if (response.data && response.data.option) {
        setCurrentBackground(response.data.option);
        onBackgroundChange(response.data.option);
      }
    } catch (error) {
      console.error("Error updating background:", error);
    }
  };

  const handlePayment = () => {
    setShowPaymentModal(false);
    // navigate('/payout');
    navigate("/dashboard/paypal-payment");
  };

  const basicOptions = [
    {
      value: "purple_white",
      label: "Purple & White",
      preview: "linear-gradient(to bottom, #6862cc, #ffffff)",
    },
    {
      value: "blue_white",
      label: "Blue & White",
      preview: "linear-gradient(to bottom, #3498db, #ffffff)",
    },
    {
      value: "green_black",
      label: "Green & Black",
      preview: "linear-gradient(to bottom, #2ecc71, #1a1a1a)",
    },
    {
      value: "red_black",
      label: "Red & Black",
      preview: "linear-gradient(to bottom, #e74c3c, #1a1a1a)",
    },
    {
      value: "gray_black",
      label: "Gray & Black",
      preview: "linear-gradient(to bottom, #95a5a6, #1a1a1a)",
    },
  ];
  
  const premiumOptions = [
    {
      value: "galaxy",
      label: "Galaxy",
      preview: "linear-gradient(to bottom, #0f0c29, #302b63, #24243e)",
    },
    {
      value: "supernova",
      label: "Supernova",
      preview: "linear-gradient(to bottom, #f83600, #f9d423)",
    },
    {
      value: "heart_nebula",
      label: "Heart Nebula",
      preview: "linear-gradient(to bottom, #ee0979, #ff6a00)",
    },
    {
      value: "sunset_vibe",
      label: "Sunset Vibe",
      preview: "linear-gradient(to bottom, #ff7e5f, #feb47b)",
    },
    {
      value: "northern_lights",
      label: "Northern Lights",
      preview: "linear-gradient(to bottom, #43cea2, #185a9d)",
    },
    {
      value: "cosmic_fusion",
      label: "Cosmic Fusion",
      preview: "linear-gradient(to bottom, #ff00cc, #333399)",
    },
    {
      value: "custom",
      label: "CUSTOM",
      preview: `linear-gradient(to bottom, ${customColor1}, ${customColor2})`,
      isCustom: true,
    },
  ];

  const handleCustomColorSubmit = async () => {
    try {
      const option = "custom";
      const colors = { color1: customColor1, color2: customColor2 };
      
      const response = await api.post("/background", { option, colors });
      if (response.data && response.data.option) {
        setCurrentBackground(response.data.option);
        onBackgroundChange(response.data.option);
        setShowCustomColor(false);
      }
    } catch (error) {
      console.error("Error updating custom background:", error);
    }
  };

  const backToBasic = () => {
    setShowPremiumColors(false);
  };

  if (!isOpen) return null;

  return (
    <div className="background-change-modal">
      <div className="background-change-content">
        <h2>Customize Background</h2>
        
        {showCustomColor ? (
          <div className="custom-color-section">
            <h3>Create Custom Background</h3>
            <div className="color-pickers">
              <div className="color-picker">
                <label>Top Color</label>
                <input 
                  type="color" 
                  value={customColor1}
                  onChange={(e) => setCustomColor1(e.target.value)}
                />
              </div>
              <div className="color-picker">
                <label>Bottom Color</label>
                <input 
                  type="color" 
                  value={customColor2}
                  onChange={(e) => setCustomColor2(e.target.value)}
                />
              </div>
            </div>
            <div className="custom-preview">
              <div 
                className="color-preview custom-preview-box" 
                style={{ background: `linear-gradient(to bottom, ${customColor1}, ${customColor2})` }}
              ></div>
            </div>
            <div className="custom-buttons">
              <button 
                className="back-button"
                onClick={() => setShowCustomColor(false)}
              >
                &larr; Back
              </button>
              <button 
                className="apply-button"
                onClick={handleCustomColorSubmit}
              >
                Apply
              </button>
            </div>
          </div>
        ) : (
          <>
            {showPremiumColors && myProfile.has_pro ? (
              <>
                <div className="premium-options-header">
                  <button 
                    className="back-button"
                    onClick={backToBasic}
                  >
                    &larr; Back
                  </button>
                  <h3>Premium Themes</h3>
                </div>
                <div className="background-options">
                  {premiumOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`background-option ${
                        currentBackground === option.value ? "selected" : ""
                      } ${option.isCustom ? "custom-option" : ""}`}
                      onClick={() => handleOptionSelect(option.value)}
                    >
                      <div className="color-preview" style={{ background: option.preview }}></div>
                      <span>{option.label}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="background-options">
                {basicOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`background-option ${
                      currentBackground === option.value ? "selected" : ""
                    }`}
                    onClick={() => handleOptionSelect(option.value)}
                  >
                    <div className="color-preview" style={{ background: option.preview }}></div>
                    <span>{option.label}</span>
                  </div>
                ))}

                {!myProfile.has_pro ? (
                  <div
                    className="background-option premium"
                    onClick={() => handleOptionSelect("premium")}
                  >
                    <div
                      className="color-preview"
                      style={{ background: "linear-gradient(to bottom, #f1c40f, #f39c12)" }}
                    ></div>
                    <span>Premium Themes</span>
                    <span className="premium-badge">$10.00/lifetime</span>
                  </div>
                ) : (
                  <div
                    className="background-option premium"
                    onClick={() => setShowPremiumColors(true)}
                  >
                    <div
                      className="color-preview"
                      style={{ background: "linear-gradient(135deg, #f1c40f, #f39c12)" }}
                    ></div>
                    <span>Premium Themes</span>
                    <span className="premium-badge">Unlocked</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>

      {showPaymentModal && (
        <div className="payment-modal">
          <div className="payment-content">
            <h2>Unlock Premium Themes</h2>
            <div className="payment-details">
              <p>
                Get access to all premium themes and custom backgrounds for just $10.00/lifetime
              </p>
              <div className="payment-amount">
                <span className="currency">$</span>
                <span className="amount">10.00</span>
                <span className="period">/lifetime</span>
              </div>
            </div>
            <div className="payment-buttons">
              <button
                className="cancel-button"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
              <button className="pay-button" onClick={handlePayment}>
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundChange;