import React, { useState, useEffect } from "react";
import "../StorePassword/Password.css";
import api from "../../api";

const StorePassword = () => {
  const [passwords, setPasswords] = useState([]); 
  const [password, setPassword] = useState(""); 

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

  const handleEditPassword = (id) => {
    const updatedPassword = prompt("Edit the password:");
    if (updatedPassword) {
      api.put(`/store-password/${id}`, { password: updatedPassword })
        .then((response) => {
          setPasswords(passwords.map((pwd) => 
            pwd.id === id ? { ...pwd, password: updatedPassword } : pwd
          ));
        })
        .catch((error) => console.error("Error editing password", error));
    }
  };

  const handleDeletePassword = (id) => {
    if (window.confirm("Are you sure you want to delete this password?")) {
      api.delete(`/store-password/${id}`)
        .then(() => {
          setPasswords(passwords.filter((pwd) => pwd.id !== id)); 
        })
        .catch((error) => console.error("Error deleting password", error));
    }
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
                  onClick={() =>
                    alert(`Password ${index + 1}: ${storedPassword.password}`)
                  }
                >
                  Password {index + 1}
                </button>
              </div>
            ))
          ) : (
            <p>No passwords stored yet.</p>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="storePasswordsHeader">Editable and Deletable Passwords</h2>
        <div className="passwordsGrid">
          {passwords.length > 0 ? (
            passwords.map((storedPassword, index) => (
              <div key={storedPassword.id} className="passwordItem">
                <button
                  className="passwordButton"
                  onClick={() =>
                    alert(`Password ${index + 1}: ${storedPassword.password}`)
                  }
                >
                  Password {index + 1}
                </button>
                <button
                  className="editButton"
                  onClick={() => handleEditPassword(storedPassword.id)}
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
    </div>
  );
};

export default StorePassword;
