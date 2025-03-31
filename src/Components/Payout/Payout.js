import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import './Payout.css';

const Payout = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const navigate = useNavigate();

  const paymentMethods = [
    { id: 'revolut', name: 'Revolut', icon: '💳' },
    { id: 'paypal', name: 'PayPal', icon: '🔵' },
    { id: 'binance', name: 'Binance', icon: '🟡' }
  ];

  const cryptocurrencies = [
    { 
      id: 'btc', 
      name: 'Bitcoin', 
      symbol: 'BTC', 
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      explorer: 'https://blockstream.info/address/'
    },
    { 
      id: 'eth', 
      name: 'Ethereum', 
      symbol: 'ETH', 
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      explorer: 'https://etherscan.io/address/'
    },
    { 
      id: 'sol', 
      name: 'Solana', 
      symbol: 'SOL', 
      address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      explorer: 'https://explorer.solana.com/address/'
    }
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setSelectedCrypto(null);
    setPaymentStatus(null);
    setTransactionId('');
  };

  const handleCryptoSelect = (crypto) => {
    setSelectedCrypto(crypto);
    setPaymentStatus(null);
    setTransactionId('');
  };

  const verifyCryptoPayment = async () => {
    try {
      const response = await api.post('/verify-crypto-payment', {
        crypto: selectedCrypto,
        address: cryptocurrencies.find(c => c.id === selectedCrypto)?.address,
        transactionId
      });
      
      if (response.data.verified) {
        setPaymentStatus('success');
        // Wait 2 seconds before redirecting
        setTimeout(() => {
          navigate('/dashboard/chatroom');
        }, 2000);
      } else {
        setPaymentStatus('pending');
        // Check again in 30 seconds
        setTimeout(verifyCryptoPayment, 30000);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setPaymentStatus('error');
    }
  };

  const handleTransactionIdSubmit = (e) => {
    e.preventDefault();
    if (transactionId) {
      verifyCryptoPayment();
    }
  };

  const handlePayPalPayment = () => {
    // Redirect to PayPal with return URL
    window.location.href = `${api.defaults.baseURL}/paypal/create-payment?returnUrl=${encodeURIComponent(window.location.origin + '/dashboard/chatroom')}`;
  };

  const handleRevolutPayment = () => {
    // Redirect to Revolut with return URL
    window.location.href = `${api.defaults.baseURL}/revolut/create-payment?returnUrl=${encodeURIComponent(window.location.origin + '/dashboard/chatroom')}`;
  };

  // const handleBackToChatroom = () => {
  //   navigate('/dashboard/chatroom');
  // };

  return (
    <div className="payout-container">
      <div className="payout-content">
        <button className="back-button" onClick={() => navigate('/dashboard/chatroom')}>
          ← Back to Chatroom
        </button>
        <h2>Complete Your Payment</h2>
        <p className="payment-amount">$0.50/month</p>
        
        <div className="payment-methods">
          <h3>Select Payment Method</h3>
          <div className="method-grid">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`method-option ${selectedMethod === method.id ? 'selected' : ''}`}
                onClick={() => handleMethodSelect(method.id)}
              >
                <span className="method-icon">{method.icon}</span>
                <span className="method-name">{method.name}</span>
              </div>
            ))}
          </div>
        </div>

        {selectedMethod === 'binance' && (
          <div className="crypto-options">
            <h3>Select Cryptocurrency</h3>
            <div className="crypto-grid">
              {cryptocurrencies.map((crypto) => (
                <div
                  key={crypto.id}
                  className={`crypto-option ${selectedCrypto === crypto.id ? 'selected' : ''}`}
                  onClick={() => handleCryptoSelect(crypto.id)}
                >
                  <span className="crypto-symbol">{crypto.symbol}</span>
                  <span className="crypto-name">{crypto.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedCrypto && (
          <div className="crypto-payment-details">
            <h3>Payment Details</h3>
            <div className="address-container">
              <p>Send exactly 0.50 Cent in {selectedCrypto.toUpperCase()} to:</p>
              <div className="crypto-address">
                {cryptocurrencies.find(c => c.id === selectedCrypto)?.address}
                <button className="copy-button" onClick={() => navigator.clipboard.writeText(cryptocurrencies.find(c => c.id === selectedCrypto)?.address)}>
                  Copy
                </button>
              </div>
              <a 
                href={`${cryptocurrencies.find(c => c.id === selectedCrypto)?.explorer}${cryptocurrencies.find(c => c.id === selectedCrypto)?.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="explorer-link"
              >
                View on Explorer
              </a>
            </div>
            <form onSubmit={handleTransactionIdSubmit} className="transaction-form">
              <input
                type="text"
                placeholder="Enter Transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="transaction-input"
              />
              <button type="submit" className="verify-button">Verify Payment</button>
            </form>
          </div>
        )}

        {paymentStatus === 'pending' && (
          <div className="payment-status pending">
            <p>Verifying your payment... Please wait.</p>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="payment-status success">
            <p>Payment verified! Redirecting you back...</p>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="payment-status error">
            <p>Error verifying payment. Please try again.</p>
          </div>
        )}

        {selectedMethod === 'revolut' && (
          <div className="revolut-payment">
            <h3>Revolut Payment</h3>
            <p>You will be redirected to Revolut to complete your payment.</p>
            <button className="proceed-button" onClick={handleRevolutPayment}>Proceed to Revolut</button>
          </div>
        )}

        {selectedMethod === 'paypal' && (
          <div className="paypal-payment">
            <h3>PayPal Payment</h3>
            <p>You will be redirected to PayPal to complete your payment.</p>
            <button className="proceed-button" onClick={handlePayPalPayment}>Proceed to PayPal</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payout; 