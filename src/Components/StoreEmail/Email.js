import React, { useState, useEffect } from "react";
import "../StoreEmail/Email.css";
import api from "../../api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";

const StoreEmail = () => {
  const [emails, setEmails] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState({ type: "", id: null });
  const [editEmail, setEditEmail] = useState("");
  const [editEmailId, setEditEmailId] = useState(null);
  const [deleteEmailId, setDeleteEmailId] = useState(null);
  const [viewEmail, setViewEmail] = useState("");
  const [selectedEmailId, setSelectedEmailId] = useState(null);

  const fetchEmails = async () => {
    try {
      const response = await api.get("/store-emails");
      setEmails(response.data);
    } catch (error) {
      console.error("Error fetching emails", error);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleSaveEmail = async () => {
    try {
      const response = await api.post("/store-email", { name, email });
      setEmails((prevEmails) => [...prevEmails, response.data]);
      setName("");
      setEmail("");
      fetchEmails();  // Refresh the email list
    } catch (error) {
      console.error("Error saving email", error);
    }
  };

  const handleEditEmail = (id, currentEmail) => {
    setEditEmail(currentEmail);
    setEditEmailId(id);
    setSelectedEmailId(id);
    setIsModalOpen({ type: "edit", id });
  };

  const handleSaveChanges = async () => {
    if (editEmail) {
      try {
        await api.put(`/store-email/${editEmailId}`, { name: editEmail.name, email: editEmail.email });
        setEmails(
          emails.map((emailEntry) =>
            emailEntry.id === editEmailId ? { ...emailEntry, name: editEmail.name, email: editEmail.email } : emailEntry
          )
        );
        closeModals();
      } catch (error) {
        console.error("Error saving changes", error);
      }
    }
  };

  const handleDeleteEmail = (id) => {
    setDeleteEmailId(id);
    setSelectedEmailId(id);
    setIsModalOpen({ type: "delete", id });
  };

  const confirmDeleteEmail = async () => {
    try {
      await api.delete(`/store-email/${deleteEmailId}`);
      setEmails(emails.filter((emailEntry) => emailEntry.id !== deleteEmailId));
      closeModals();
    } catch (error) {
      console.error("Error deleting email", error);
    }
  };

  const handleViewEmail = (emailContent) => {
    setViewEmail(emailContent);
    setIsModalOpen({ type: "view" });
  };

  const closeModals = () => {
    setIsModalOpen({ type: "", id: null });
    setEditEmail("");
    setDeleteEmailId(null);
    setViewEmail("");
    setSelectedEmailId(null);
  };

  const maskEmail = (email) => {
    const [username, domain] = email.split('@');
    const maskedUsername = username.charAt(0) + '**' + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">

      {/* First Card: Store Emails Here */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold">Store Emails Here</h2>
        <p>100% safe</p>
      </div>

      {/* Second Card: Store Email Input */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold">Store Email</h2>
        <input
          type="text"
          className="password-input password-input-2"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          className="password-input"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="save-password-button" onClick={handleSaveEmail}>
          Save Email
        </button>
      </div>

      {/* Third Card: Display Stored Emails */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold">Stored Emails</h2>
        <div className="passwordsGrid passwordsGrid-2">
          {emails.length > 0 ? (
            emails.map((entry) => (
              <div
                key={entry.id}
                className={`passwordItem  ${selectedEmailId === entry.id ? "selected" : ""}`} // Apply selected class
              >
                <div className="edit-delete-buttons">
                <button
  className="passwordButton passwordButton-2"
  onClick={() => handleViewEmail(entry.email)} // Pass email content
>
  ({maskEmail(entry.email)})
</button>
                  <button
                    className="editButton"
                    onClick={() => handleEditEmail(entry.id, entry)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="deleteButton"
                    onClick={() => handleDeleteEmail(entry.id)}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No emails stored yet.</p>
          )}
        </div>
      </div>

      {/* Modal for Edit Email */}
      {isModalOpen.type === "edit" && (
        <div className="content-modal">
          <div className="modal-content-password">
            <h3>Edit Email</h3>
            <input
              type="text"
              className="save-password-button"
              placeholder="Edit Name"
              value={editEmail.name}
              onChange={(e) => setEditEmail({ ...editEmail, name: e.target.value })}
            />
            <input
              type="email"
              className="save-password-button"
              placeholder="Edit Email"
              value={editEmail.email}
              onChange={(e) => setEditEmail({ ...editEmail, email: e.target.value })}
            />
            <div className="modal-actions">
              <button
                className="handleSaveChangesButton"
                onClick={handleSaveChanges}
              >
                <FontAwesomeIcon icon={faCheck} />
              </button>
              <button className="handleCloseModalButton" onClick={closeModals}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Delete Email */}
      {isModalOpen.type === "delete" && (
        <div className="content-modal">
          <div className="modal-content-password">
            <h3>Are you sure you want to delete this email?</h3>
            <div className="modal-actions">
              <button className="confirmDelete" onClick={confirmDeleteEmail}>
                Delete
              </button>
              <button className="confirmClose" onClick={closeModals}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for View Email */}
      {isModalOpen.type === "view" && (
        <div className="content-modal">
          <div className="modal-content-password">
            <h3>View Email</h3>
            <p className="viewEmail">{viewEmail}</p>
            <div className="modal-actions">
              <button className="closeModalViewEmail" onClick={closeModals}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreEmail;
