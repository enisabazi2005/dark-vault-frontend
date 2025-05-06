import React from "react";
import "./Paypal.css";
import { PAYPAL_CLIENT_ID } from "../../api";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { BASE_URL } from "../../api";

const Paypal = () => {
  const clientID = PAYPAL_CLIENT_ID; 
  const token = localStorage.getItem("token");

  return (
    <PayPalScriptProvider options={{ "client-id": clientID }}>
      <div className="paypal-container">
        <div className="paypal-row">
          <div className="paypal-col">
            <h2>Pay with PayPal</h2>
            {/* Make sure the PayPalButtons is rendered here */}
            <div className="paypal-button-container">
              <PayPalButtons
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          value: "200.00", // Can be dynamically set
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
                    //   alert('Transaction completed successfully', transactionId);
                  
                      await fetch(`${BASE_URL}/verify-paypal`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${token}`, 
                        },
                        body: JSON.stringify({ transaction_id: transactionId }),
                      });
                    } catch (err) {
                      console.error("Capture failed:", err);
                    }
                  }}
                onError={(err) => {
                  console.error("PayPal error", err);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default Paypal;
