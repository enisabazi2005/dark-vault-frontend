import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { PAYPAL_CLIENT_ID, BASE_URL } from "../../api";
import { useStore } from "../../Store/store";
import { useNavigate } from "react-router-dom";
import "./Paypal.css";

const Paypal = () => {
  const clientID = PAYPAL_CLIENT_ID;
  const token = localStorage.getItem("token");
  const { myProfile } = useStore();
  const [transactionComplete, setTransactionComplete] = useState(false);
  const navigate = useNavigate();

  const redirectToDashboard = () => {
    setTimeout(() => {
      navigate("/dashboard");
      window.location.reload();
    }, 3000);
  };

  if (!myProfile) {
    return (
      <div className="paypal-container">
        <div className="paypal-loading-spinner">
          <div className="paypal-spinner"></div>
          <p className="paypal-loading-text">Loading Paypal...</p>
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ "client-id": clientID }}>
      <div className="paypal-container">
        <div className="paypal-pro-feature-box">
          {transactionComplete ? (
            <div className="paypal-success-message">
              <div className="paypal-success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="paypal-success-title">Thank You for Your Purchase!</h2>
              <p className="paypal-success-text">Your Pro subscription has been activated successfully.</p>
              <p className="paypal-redirect-text">You will be redirected to your dashboard shortly...</p>
              {redirectToDashboard()}
            </div>
          ) : (
            <>
              <div className="paypal-feature-header">
                <h2 className="paypal-header-title">Pro Feature</h2>
                <p className="paypal-header-subtitle">Upgrade to unlock premium features</p>
              </div>
              
              <div className="paypal-feature-list">
                <ul className="paypal-benefits">
                  <li className="paypal-benefit-item">
                    <svg className="paypal-check-icon" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="paypal-benefit-text">Storage up to 50</span>
                  </li>
                  <li className="paypal-benefit-item">
                    <svg className="paypal-check-icon" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="paypal-benefit-text">Customization of dashboard</span>
                  </li>
                  <li className="paypal-benefit-item">
                    <svg className="paypal-check-icon" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="paypal-benefit-text">Verified profile</span>
                  </li>
                  <li className="paypal-benefit-item">
                    <svg className="paypal-check-icon" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="paypal-benefit-text">Refund everytime</span>
                  </li>
                </ul>
              </div>

              {myProfile?.has_pro ? (
                <div className="paypal-already-subscribed">
                  <p className="paypal-subscribed-text">You have already purchased Pro. No need to subscribe twice.</p>
                </div>
              ) : (
                <div className="paypal-button-wrapper">
                  <PayPalButtons
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: "20.00", 
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      try {
                        const details = await actions.order.capture();
                        const transactionId = details.id;
                        console.log("Transaction completed:", details);
                        
                        await fetch(`${BASE_URL}/verify-paypal`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                          },
                          body: JSON.stringify({ transaction_id: transactionId }),
                        });
                        
                        setTransactionComplete(true);
                      } catch (err) {
                        console.error("Capture failed:", err);
                      }
                    }}
                    onError={(err) => {
                      console.error("PayPal error", err);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default Paypal;