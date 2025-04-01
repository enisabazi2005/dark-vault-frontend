import React, { useState, useEffect } from "react";
import "../Settings/Settings.css";
import api from "../../api";

const Settings = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    current_password: "",
    password: "",
    gender: "",
    birthdate: "",
    picture: null,
  });
  const [user, setUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      console.error('onClose prop is not a function');
    }
  };

  const fetchUser = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        console.error("No user ID or token found");
        return;
      }

      const response = await api.get(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
      setFormData((prevData) => ({
        ...prevData,
        name: response.data.name,
        lastname: response.data.lastname,
        email: response.data.email,
        gender: response.data.gender,
        birthdate: response.data.birthdate,
      }));
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    setFormData({ ...formData, picture: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) formDataToSend.append(key, formData[key]);
      });

      await api.post("/update-settings", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMessage("Changes saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

      fetchUser();
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={handleClose}>×</button>
        <h2>Edit Profile</h2>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-section">
            <h3 className="form-section-title">Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">First Name</label>
                <input
                  className="update-settings-input"
                  type="text"
                  name="name"
                  placeholder={user ? user.name : "Enter your first name"}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastname">Last Name</label>
                <input
                  className="update-settings-input"
                  type="text"
                  name="lastname"
                  placeholder={user ? user.lastname : "Enter your last name"}
                  value={formData.lastname}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  className="update-settings-input"
                  type="email"
                  name="email"
                  placeholder={user ? user.email : "Enter your email"}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  className="update-settings-input"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="birthdate">Birth Date</label>
                <input
                  className="update-settings-input"
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="picture">Profile Picture</label>
                <input
                  className="update-settings-input"
                  type="file"
                  name="picture"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Security</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="current_password">Current Password</label>
                <input
                  className="update-settings-input"
                  type="password"
                  name="current_password"
                  placeholder="Enter your current password"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  className="update-settings-input"
                  type="password"
                  name="password"
                  placeholder="Enter your new password"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password_confirmation">Confirm New Password</label>
                <input
                  className="update-settings-input"
                  type="password"
                  name="password_confirmation"
                  placeholder="Confirm your new password"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button className="save-changes-button" type="submit">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
