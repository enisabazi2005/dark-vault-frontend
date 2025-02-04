import React, { useState, useEffect } from "react";
import "../StoreEmail/Email.css";
import api from "../../api";

const StoreEmail = () => {
  const [emails, setEmails] = useState([]); 
  const [name, setName] = useState(""); 
  const [email, setEmail] = useState(""); 

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await api.get("/store-emails");
        setEmails(response.data); 
      } catch (error) {
        console.error("Error fetching emails", error);
      }
    };

    fetchEmails(); 
  }, []); 

  const handleSaveEmail = async () => {
    try {
      const response = await api.post("/store-email", { name, email });
      setEmails([...emails, response.data]); 
      setName("");
      setEmail("");
    } catch (error) {
      console.error("Error saving email", error);
    }
  };

  const handleEditEmail = (id) => {
    const updatedName = prompt("Edit the name:");
    const updatedEmail = prompt("Edit the email:");
    if (updatedName && updatedEmail) {
      api.put(`/store-email/${id}`, { name: updatedName, email: updatedEmail })
        .then(() => {
          setEmails(emails.map((entry) => 
            entry.id === id ? { ...entry, name: updatedName, email: updatedEmail } : entry
          ));
        })
        .catch((error) => console.error("Error editing email", error));
    }
  };

  const handleDeleteEmail = (id) => {
    if (window.confirm("Are you sure you want to delete this email?")) {
      api.delete(`/store-email/${id}`)
        .then(() => {
          setEmails(emails.filter((entry) => entry.id !== id)); 
        })
        .catch((error) => console.error("Error deleting email", error));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold">Store Emails here</h2>
        <p>100% safe</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="storeEmailsHeader">Store Emails</h2>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleSaveEmail}>Save Email</button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="storeEmailsHeader">Stored Emails</h2>
        <div className="emailsGrid">
          {emails.length > 0 ? (
            emails.map((entry, index) => (
              <div key={entry.id} className="emailItem">
                <button
                  className="emailButton"
                  onClick={() =>
                    alert(`Email ${index + 1}: ${entry.name} - ${entry.email}`)
                  }
                >
                  {entry.name} ({entry.email})
                </button>
              </div>
            ))
          ) : (
            <p>No emails stored yet.</p>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="storeEmailsHeader">Editable and Deletable Emails</h2>
        <div className="emailsGrid">
          {emails.length > 0 ? (
            emails.map((entry, index) => (
              <div key={entry.id} className="emailItem">
                <button
                  className="emailButton"
                  onClick={() =>
                    alert(`Email ${index + 1}: ${entry.name} - ${entry.email}`)
                  }
                >
                  {entry.name} ({entry.email})
                </button>
                <button
                  className="editButton"
                  onClick={() => handleEditEmail(entry.id)}
                >
                  Edit
                </button>
                <button
                  className="deleteButton"
                  onClick={() => handleDeleteEmail(entry.id)}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p>No emails stored yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreEmail;
