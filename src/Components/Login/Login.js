import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import api from "../../api"; 
import "../Login/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate(); 

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
  
      // Check if the response has the expected data
      if (response) {
        const { user, token } = response.data;
  
        // Store in localStorage if response is valid
        localStorage.setItem("token", token);
        localStorage.setItem("user_id", user.id);
        localStorage.setItem("request_id", user.request_id);
  
        setSuccess("Logged in successfully!");
  
        // Fetch user data
        const userResponse = await api.get(`/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(userResponse.data));
  
        // Wait to ensure data is stored before navigating
        setTimeout(() => {
          navigate("/dashboard");
        }, 500); // Reduced delay for smoother transition
      } else {
        throw new Error("Invalid login response, missing user or token.");
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error);
      setError(error.response?.data?.error || "Login failed.");
    }
  };
  
  return (
    <div className="container-layout">
      <h2>Login</h2>

      {success && <p className="success">{success}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="form">
        <input
          className="login-inputs"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="E-mail"
          required
        />
        <input
          className="login-inputs"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
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
    </div>
  );
};

export default Login;
