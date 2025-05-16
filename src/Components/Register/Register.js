import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import "../Register/Register.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEyeSlash,
  faEye,
  faCheckDouble,
  faCheckCircle,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { GoogleLogin } from "@react-oauth/google";
import { BASE_URL } from "../../api";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    gender: "",
    age: "",
    picture: null,
    birthdate: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, showPasswordStrength] = useState("");
  const [haveFile, setHaveFile] = useState(false);
  const [redirectCount, setRedirectCount] = useState(3);

const handleGoogleRegister = async (googleToken) => {
  try {
    console.log('Sending token to backend:', googleToken);
    
    const response = await fetch(`${BASE_URL}/google-auth`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ token: googleToken }),
    });

    const data = await response.json();
    console.log('Backend response:', data);

    if (response.ok) {
      localStorage.setItem('token', data.token);
      console.log('User logged in:', data.user);
    } else {
      console.error('Google Auth failed:', data);
    }
  } catch (err) {
    console.error('Request failed:', err);
  }
};
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "password") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));

      const hasLetters = /[a-zA-Z]/.test(value);
      const hasNumbers = /[0-9]/.test(value);
      const hasSymbols = /[^a-zA-Z0-9]/.test(value);

      if (hasLetters && hasNumbers && hasSymbols) {
        showPasswordStrength("Strong");
      } else if (hasLetters && hasNumbers) {
        showPasswordStrength("Normal");
      } else if (hasLetters) {
        showPasswordStrength("Weak");
      } else if ((hasLetters && hasSymbols) || (hasNumbers && hasSymbols)) {
        showPasswordStrength("Normal");
      } else {
        showPasswordStrength("");
      }
    }

    if (name === "picture") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: e.target.files[0],
      }));
      setHaveFile(true);
    } else { 
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    let timer;
    if (isModalVisible) {
      timer = setInterval(() => {
        setRedirectCount((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = "/login";
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isModalVisible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      formDataToSend.append("password_confirmation", formData.password);

      const response = await api.post("/register", formDataToSend, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Your account has been created successfully!");
      setModalVisible(true);
      console.log("Response:", response.data);

      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
      
    } catch (error) {
      console.error("Error registering:", error.response?.data || error);
      setError(error.response?.data?.message || "Registration failed.");
    }
  };


  return (
    <>
      {isModalVisible && (
        <div className="success-modal">
          <div className="success-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <h3 className="success-title">Registration Successful!</h3>
          <p className="success-message">{success}</p>
          <p className="success-redirect">
            Redirecting to login in {redirectCount} seconds...
          </p>
          <div className="success-progress">
            <div className="success-progress-bar"></div>
          </div>
        </div>
      )}
      
      {isModalVisible && <div className="modal-overlay"></div>}
      
      <div className="container-layout">
        <div className="ocean-section">
          <div className="ocean-animation"></div>
          <div className="ocean-overlay"></div>
          <div className="ocean-content">
            <h1>Create Account</h1>
            <p>Join our secure platform and start protecting your digital assets today. Your security is our top priority.</p>
          </div>
        </div>

        <div className="form-section register">
          <form onSubmit={handleSubmit} className="form">
            <h2>Register</h2>
            {error && <p className="error">{error}</p>}

            <input
              className="inputs"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              required
            />
            <input
              className="inputs"
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="Lastname"
              required
            />
            <input
              className="inputs"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="E-mail"
              required
            />
            <div className="password-check">
              <input
                className="inputs"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
              {
                <div className={`password-strength-bar${passwordStrength}`}>
                  {passwordStrength === "Weak" && <span>Weak</span>}
                  {passwordStrength === "Normal" && <span>Normal</span>}
                  {passwordStrength === "Strong" && <span>Strong</span>}
                </div>
              }
              <button
                className="show-password-btn show-password-btn-3"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <FontAwesomeIcon icon={faEye} />
                ) : (
                  <FontAwesomeIcon icon={faEyeSlash} />
                )}
              </button>
            </div>
            <div className="row">
              <div className="col">
                <select
                  className="selects"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="col">
                <input
                  className="inputs"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Age"
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col">
                <div className="file-input-container">
                  <label htmlFor="fileInput" className="custom-file-upload">
                    <FontAwesomeIcon icon={faUpload} />
                    Choose Profile Picture
                  </label>
                  <input
                    id="fileInput"
                    className="file-input"
                    type="file"
                    name="picture"
                    onChange={handleChange}
                    accept="image/*"
                  />
                  {haveFile && (
                    <span className="checkFileUpload">
                      <FontAwesomeIcon icon={faCheckDouble} />
                    </span>
                  )}
                </div>
              </div>
              <div className="col">
                <input
                  className="inputs"
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

          <div className="register-btn-flex">
             <button type="submit" className="registerButton">
              Register
            </button>
<GoogleLogin
  onSuccess={credentialResponse => {
    // Directly use the credential (ID token) from Google
    handleGoogleRegister(credentialResponse.credential);
  }}
  onError={(error) => {
    console.error('Google Login Error:', error);
  }}
  useOneTap
  flow="implicit"
/>
         </div>
          </form>
          <div className="textLink">
            <p>
              Have already an account? <Link to="/login">Click Here</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;