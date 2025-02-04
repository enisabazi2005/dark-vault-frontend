import React, { useState, useEffect } from "react";
import "../PrivateInfo/PrivateInfo.css";
import api from "../../api";

const PrivateInfo = () => {
  const [privateInfos, setPrivateInfos] = useState([]);
  const [name, setName] = useState("");
  const [info1, setInfo1] = useState("");
  const [info2, setInfo2] = useState("");
  const [info3, setInfo3] = useState("");

  useEffect(() => {
    const fetchPrivateInfos = async () => {
      try {
        const response = await api.get("/store-private-infos");
        setPrivateInfos(response.data);
      } catch (error) {
        console.error("Error fetching private info", error);
      }
    };

    fetchPrivateInfos();
  }, []);

  const handleSavePrivateInfo = async () => {
    try {
      const response = await api.post("/store-private-info", {
        name,
        info_1: info1,
        info_2: info2,
        info_3: info3,
      });
      setPrivateInfos([...privateInfos, response.data]);
      setName("");
      setInfo1("");
      setInfo2("");
      setInfo3("");
    } catch (error) {
      console.error("Error saving private info", error);
    }
  };

  const handleEditPrivateInfo = (id) => {
    const updatedName = prompt("Edit the name:");
    const updatedInfo1 = prompt("Edit Info 1:");
    const updatedInfo2 = prompt("Edit Info 2:");
    const updatedInfo3 = prompt("Edit Info 3:");
    
    if (updatedName && updatedInfo1 && updatedInfo2 && updatedInfo3) {
      api.put(`/store-private-info/${id}`, {
        name: updatedName,
        info_1: updatedInfo1,
        info_2: updatedInfo2,
        info_3: updatedInfo3,
      })
        .then(() => {
          setPrivateInfos(privateInfos.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  name: updatedName,
                  info_1: updatedInfo1,
                  info_2: updatedInfo2,
                  info_3: updatedInfo3,
                }
              : entry
          ));
        })
        .catch((error) => console.error("Error editing private info", error));
    }
  };

  const handleDeletePrivateInfo = (id) => {
    if (window.confirm("Are you sure you want to delete this private info?")) {
      api.delete(`/store-private-info/${id}`)
        .then(() => {
          setPrivateInfos(privateInfos.filter((entry) => entry.id !== id));
        })
        .catch((error) => console.error("Error deleting private info", error));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold">Store Private Info here</h2>
        <p>100% safe & encrypted</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="privateInfoHeader">Store Private Info</h2>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Info 1"
          value={info1}
          onChange={(e) => setInfo1(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Info 2"
          value={info2}
          onChange={(e) => setInfo2(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Info 3"
          value={info3}
          onChange={(e) => setInfo3(e.target.value)}
        />
        <button onClick={handleSavePrivateInfo}>Save Info</button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="privateInfoHeader">Stored Private Info</h2>
        <div className="privateInfoGrid">
          {privateInfos.length > 0 ? (
            privateInfos.map((entry, index) => (
              <div key={entry.id} className="privateInfoItem">
                <button
                  className="privateInfoButton"
                  onClick={() =>
                    alert(
                      `Info ${index + 1}: ${entry.name}\n1: ${entry.info_1}\n2: ${entry.info_2}\n3: ${entry.info_3}`
                    )
                  }
                >
                  {entry.name}
                </button>
              </div>
            ))
          ) : (
            <p>No private info stored yet.</p>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="privateInfoHeader">Editable and Deletable Private Info</h2>
        <div className="privateInfoGrid">
          {privateInfos.length > 0 ? (
            privateInfos.map((entry, index) => (
              <div key={entry.id} className="privateInfoItem">
                <button
                  className="privateInfoButton"
                  onClick={() =>
                    alert(
                      `Info ${index + 1}: ${entry.name}\n1: ${entry.info_1}\n2: ${entry.info_2}\n3: ${entry.info_3}`
                    )
                  }
                >
                  {entry.name}
                </button>
                <button
                  className="editButton"
                  onClick={() => handleEditPrivateInfo(entry.id)}
                >
                  Edit
                </button>
                <button
                  className="deleteButton"
                  onClick={() => handleDeletePrivateInfo(entry.id)}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p>No private info stored yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateInfo;
