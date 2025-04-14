import React, { useState, useEffect } from "react";
import "../StorePassword/Password.css";
import { useLocation } from "react-router-dom";
import api from "../../api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import PasswordSkeleton from "./PasswordSkeleton";
import Storage from "../Storage/Storage";
import useStorageStore from "../../Store/storageStore";

const StorePassword = () => {
  const [passwords, setPasswords] = useState([]);
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState({ type: "", id: null });
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordId, setEditPasswordId] = useState(null);
  const [deletePasswordId, setDeletePasswordId] = useState(null);
  const [viewPassword, setViewPassword] = useState("");
  const [selectedPasswordId, setSelectedPasswordId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const MAX_STORAGE = location.state?.MAX_STORAGE || 1;  
  const [isStorageLimitReached, setIsStorageLimitReached] = useState(false);
  const { totalStored, updateTotalStored } = useStorageStore();

  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/store-passwords");
        setPasswords(response.data);
      } catch (error) {
        console.error("Error fetching passwords", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPasswords();
  }, []);

  useEffect(() => {
    if (totalStored >= MAX_STORAGE) {
      setIsStorageLimitReached(true);
    } else {
      setIsStorageLimitReached(false);
    }
  }, [totalStored, MAX_STORAGE]);

  const handleSavePassword = async () => {
    if (totalStored >= MAX_STORAGE) {
      return;
    }

    try {
      const response = await api.post("/store-password", { password });
      setPasswords([...passwords, response.data]);
      setPassword("");
      updateTotalStored(totalStored + 1);
    } catch (error) {
      console.error("Error saving password", error);
    }
  };

  const handleEditPassword = (id, currentPassword) => {
    setEditPassword(currentPassword);
    setEditPasswordId(id);
    setSelectedPasswordId(id); 
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
    setSelectedPasswordId(id); 
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
    setSelectedPasswordId(null); 
  };

  if (isLoading) {
    return <PasswordSkeleton />;
  }

  return (
    <>
      {isStorageLimitReached && (
        <Storage />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">Store Passwords here</h2>
          <p className="text-center">100% safe</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="storePasswordsHeader">Store Passwords</h2>
          <input
            type="password"
            placeholder={isStorageLimitReached ? "Storage limit reached" : "Write your password here"}
            className={`password-input ${isStorageLimitReached ? 'input-disabled' : ''}`}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isStorageLimitReached}
          />
          <button 
            className={`save-password-button ${isStorageLimitReached ? 'button-disabled' : ''}`}
            onClick={handleSavePassword}
            disabled={isStorageLimitReached}
          >
            {isStorageLimitReached ? 'Storage Limit Reached' : 'Save Password'}
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="storePasswordsHeader">Stored Passwords</h2>
          <div className="passwordsGrid">
            {passwords.length > 0 ? (
              passwords.map((storedPassword, index) => (
                <div key={storedPassword.id} 
                  className={`passwordItem ${selectedPasswordId === storedPassword.id ? "selected" : ""}`} 
                  id={storedPassword.id}>
                  <div className="edit-delete-buttons">
                    <button
                      className="passwordButton"
                      onClick={() => handleViewPassword(storedPassword.password)} 
                    >
                      Password {index + 1}
                    </button>
                    <div className="action-buttons">
                      <button
                        className="editButton"
                        onClick={() => handleEditPassword(storedPassword.id, storedPassword.password)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="deleteButton"
                        onClick={() => handleDeletePassword(storedPassword.id)}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No passwords stored yet.</p>
            )}
          </div>
        </div>

        {isModalOpen.type === "edit" && (
          <div className="content-modal">
            <div className="modal-content-password">
              <h3>Edit Password</h3>
                <input
                  type="password"
                  placeholder="Edit Password..."
                  className="password-input"
                  onChange={(e) => setEditPassword(e.target.value)}
                />
              <div className="modal-actions">
               <div className="modal-actions-col">
               <button className="handleSaveChangesButton" onClick={handleSaveChanges}>
                  <FontAwesomeIcon icon={faCheck} />
                </button>
               </div>
               <div className="modal-actions-col">
                <button className="handleCloseModalButton" onClick={closeModals}>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
               </div>
              </div>
            </div>
          </div>
        )}

        {isModalOpen.type === "delete" && (
          <div className="content-modal">
            <div className="modal-content-password">
              <h3>Are you sure you want to delete this password?</h3>
              <div className="modal-actions">
                <button className="confirmDelete" onClick={confirmDeletePassword}>Delete</button>
                <button className="confirmClose" onClick={closeModals}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {isModalOpen.type === "view" && (
          <div className="content-modal">
            <div className="modal-content-password">
              <h3>View Password</h3>
              <p className="viewPassword">{viewPassword}</p>
              <div className="modal-actions">
                <button className="closeModalViewPassword" onClick={closeModals}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StorePassword;
