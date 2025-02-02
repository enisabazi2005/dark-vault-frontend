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
        const { user, token } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user_id", user.id); 

        setSuccess("Logged in successfully!");

        const userResponse = await api.get(`/users/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        localStorage.setItem("user", JSON.stringify(userResponse.data));

        setTimeout(() => {
            navigate("/dashboard");
        }, 2000);
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
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="E-mail"
          required
        />
        <input
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
          Don't have an account? <a href="/register">Click here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
