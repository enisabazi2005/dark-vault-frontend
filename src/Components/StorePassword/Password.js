import React, { useState, useEffect } from "react";
import "../StorePassword/Password.css";
import api from "../../api";

const StorePassword = () => {
  const [passwords, setPasswords] = useState([]);
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState({ type: "", id: null }); // Manage only one modal at a time
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordId, setEditPasswordId] = useState(null);
  const [deletePasswordId, setDeletePasswordId] = useState(null);
  const [viewPassword, setViewPassword] = useState("");
  

  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        const response = await api.get("/store-passwords");
        setPasswords(response.data);
      } catch (error) {
        console.error("Error fetching passwords", error);
      }
    };

    fetchPasswords();
  }, []);

  const handleSavePassword = async () => {
    try {
      const response = await api.post("/store-password", { password });
      setPasswords([...passwords, response.data]);
      setPassword("");
    } catch (error) {
      console.error("Error saving password", error);
    }
  };

  const handleEditPassword = (id, currentPassword) => {
    setEditPassword(currentPassword);
    setEditPasswordId(id);
    setIsModalOpen({ type: "edit", id });
  };

  const handleSaveChanges = async () => {
    if (editPassword) {
      try {
        await api.put(`/store-password/${editPasswordId}`, { password: editPassword });
        setPasswords(
          passwords.map((pwd) =>
            pwd.id === editPasswordId ? { ...pwd, password: editPassword } : pwd
          )
        );
        closeModals();
      } catch (error) {
        console.error("Error saving changes", error);
      }
    }
  };

  const handleDeletePassword = (id) => {
    setDeletePasswordId(id);
    setIsModalOpen({ type: "delete", id });
  };

  const confirmDeletePassword = async () => {
    try {
      await api.delete(`/store-password/${deletePasswordId}`);
      setPasswords(passwords.filter((pwd) => pwd.id !== deletePasswordId));
      closeModals();
    } catch (error) {
      console.error("Error deleting password", error);
    }
  };

  const handleViewPassword = (password) => {
    setViewPassword(password);
    setIsModalOpen({ type: "view" });
  };

  const closeModals = () => {
    setIsModalOpen({ type: "", id: null });
    setEditPassword("");
    setDeletePasswordId(null);
    setViewPassword("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold">Store Passwords here</h2>
        <p>100% safe</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="storePasswordsHeader">Store Passwords</h2>
        <input
          type="password"
          placeholder="Write your password here"
          value={password}
          className="password-input"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleSavePassword}>Save Password</button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="storePasswordsHeader">Stored Passwords</h2>
        <div className="passwordsGrid">
          {passwords.length > 0 ? (
            passwords.map((storedPassword, index) => (
              <div key={storedPassword.id} className="passwordItem">
                <button
                  className="passwordButton"
                  onClick={() => handleViewPassword(storedPassword.password)} // Show password in modal
                >
                  Password {index + 1}
                </button>
                <button
                  className="editButton"
                  onClick={() => handleEditPassword(storedPassword.id, storedPassword.password)}
                >
                  Edit
                </button>
                <button
                  className="deleteButton"
                  onClick={() => handleDeletePassword(storedPassword.id)}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p>No passwords stored yet.</p>
          )}
        </div>
      </div>

      {/* Edit Modal for editing password */}
      {isModalOpen.type === "edit" && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Password</h3>
            <label>
              Change this password:
              <input
                type="password"
                value={editPassword}
                className="password-input"
                onChange={(e) => setEditPassword(e.target.value)}
              />
            </label>
            <div className="modal-actions">
              <button onClick={handleSaveChanges}>Save Changes</button>
              <button onClick={closeModals}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isModalOpen.type === "delete" && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete this password?</h3>
            <div className="modal-actions">
              <button onClick={confirmDeletePassword}>Delete</button>
              <button onClick={closeModals}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* View Password Modal */}
      {isModalOpen.type === "view" && (
        <div className="modal">
          <div className="modal-content">
            <h3>View Password</h3>
            <p>{viewPassword}</p>
            <div className="modal-actions">
              <button onClick={closeModals}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorePassword;
