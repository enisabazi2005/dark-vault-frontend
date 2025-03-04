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
      // Populate the form data with user info
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

  // Call fetchUser when component mounts
  useEffect(() => {
    fetchUser();
  }, []);

  const [successMessage, setSuccessMessage] = useState("");

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle Image Upload
  const handleImageUpload = (e) => {
    setFormData({ ...formData, picture: e.target.files[0] });
  };

  // Handle Form Submission
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
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Profile</h2>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                className="update-settings-input"
                type="text"
                name="name"
                placeholder={user ? user.name : "Name"} 
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastname">Last Name</label>
              <input
                className="update-settings-input"
                type="text"
                name="lastname"
                placeholder={user ? user.lastname : "Last Name"} 
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                className="update-settings-input"
                type="email"
                name="email"
                placeholder={user ? user.email : "Email"} 
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="form-row form-row-password">
            <div className="form-group">
              <label htmlFor="current_password">Current Password</label>
              <input
                className="update-settings-input"
                type="password"
                name="current_password"
                placeholder="Current Password"
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                className="update-settings-input"
                type="password"
                name="password"
                placeholder="New Password"
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password_confirmation">
                Confirm New Password
              </label>
              <input
                className="update-settings-input"
                type="password"
                name="password_confirmation"
                placeholder="Confirm New Password"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="birthdate">Birthdate</label>
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

          <button className="save-changes-button" type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
