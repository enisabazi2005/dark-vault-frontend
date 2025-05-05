import React, { useState, useEffect } from "react";
import "../PrivateInfo/PrivateInfo.css";
import api from "../../api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import Storage from "../Storage/Storage";
import useStorageStore from "../../Store/storageStore";
import { useStore } from "../../Store/store";

const PrivateInfo = () => {
  const [privateInfos, setPrivateInfos] = useState([]);
  const [name, setName] = useState("");
  const [info1, setInfo1] = useState("");
  const [info2, setInfo2] = useState("");
  const [info3, setInfo3] = useState("");
  const [isModalOpen, setIsModalOpen] = useState({ type: "", id: null });
  const [editInfo, setEditInfo] = useState({});
  const [deleteInfoId, setDeleteInfoId] = useState(null);
  const [viewInfo, setViewInfo] = useState({});
  const [selectedPrivateInfoId, setSelectedPrivateInfoId] = useState(null);
  const { totalStored, updateTotalStored } = useStorageStore();
  const [isStorageLimitReached, setIsStorageLimitReached] = useState(false);
  const { myProfile } = useStore();
  const MAX_STORAGE = myProfile?.MAX_STORAGE;

  const handleSelectPrivateInfo = (id) => {
    setSelectedPrivateInfoId(id);
  };

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

  useEffect(() => {
    if (totalStored >= MAX_STORAGE) {
      setIsStorageLimitReached(true);
    } else {
      setIsStorageLimitReached(false);
    }
  }, [totalStored, MAX_STORAGE]);

  const handleSavePrivateInfo = async () => {
    if (totalStored >= MAX_STORAGE) {
      return;
    }

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
      updateTotalStored(totalStored + 1);
    } catch (error) {
      console.error("Error saving private info", error);
    }
  };

  const handleEditPrivateInfo = (id, currentInfo) => {
    setEditInfo(currentInfo);
    setIsModalOpen({ type: "edit", id });
  };

  const handleSaveChanges = async () => {
    const { id, name, info_1, info_2, info_3 } = editInfo;
    try {
      await api.put(`/store-private-info/${id}`, { name, info_1, info_2, info_3 });
      setPrivateInfos(
        privateInfos.map((entry) =>
          entry.id === id ? { ...entry, name, info_1, info_2, info_3 } : entry
        )
      );
      closeModals();
    } catch (error) {
      console.error("Error saving changes", error);
    }
  };

  const handleDeletePrivateInfo = (id) => {
    setDeleteInfoId(id);
    setIsModalOpen({ type: "delete", id });
  };

  const confirmDeletePrivateInfo = async () => {
    try {
      await api.delete(`/store-private-info/${deleteInfoId}`);
      setPrivateInfos(privateInfos.filter((entry) => entry.id !== deleteInfoId));
      closeModals();
    } catch (error) {
      console.error("Error deleting private info", error);
    }
  };

  const handleViewPrivateInfo = (info) => {
    setViewInfo(info);
    setIsModalOpen({ type: "view", id: info.id });
  };

  const closeModals = () => {
    setIsModalOpen({ type: "", id: null });
    setEditInfo({});
    setDeleteInfoId(null);
    setViewInfo({});
  };

  return (
    <>
      {isStorageLimitReached && <Storage />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">Store Private Info here</h2>
          <p className="text-center">100% safe & encrypted</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="privateInfoHeader">Store Private Info</h2>
          <input
            className={`private-info-input ${isStorageLimitReached ? 'input-disabled' : ''}`}
            type="text"
            placeholder={isStorageLimitReached ? "Storage limit reached" : "Enter your name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isStorageLimitReached}
          />
          <input
            className={`private-info-input ${isStorageLimitReached ? 'input-disabled' : ''}`}
            type="text"
            placeholder={isStorageLimitReached ? "Storage limit reached" : "Enter Info 1"}
            value={info1}
            onChange={(e) => setInfo1(e.target.value)}
            disabled={isStorageLimitReached}
          />
          <input
            className={`private-info-input ${isStorageLimitReached ? 'input-disabled' : ''}`}
            type="text"
            placeholder={isStorageLimitReached ? "Storage limit reached" : "Enter Info 2"}
            value={info2}
            onChange={(e) => setInfo2(e.target.value)}
            disabled={isStorageLimitReached}
          />
          <input
            className={`private-info-input ${isStorageLimitReached ? 'input-disabled' : ''}`}
            type="text"
            placeholder={isStorageLimitReached ? "Storage limit reached" : "Enter Info 3"}
            value={info3}
            onChange={(e) => setInfo3(e.target.value)}
            disabled={isStorageLimitReached}
          />
          <button 
            className={`save-password-button ${isStorageLimitReached ? 'button-disabled' : ''}`}
            onClick={handleSavePrivateInfo}
            disabled={isStorageLimitReached}
          >
            {isStorageLimitReached ? 'Storage Limit Reached' : 'Save Info'}
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="privateInfoHeader">Stored Private Info</h2>
          <div className="passwordsGrid privateGrids">
            {privateInfos.length > 0 ? (
              privateInfos.map((entry) => (
                <div
                  key={entry.id}
                  className={`passwordItem ${selectedPrivateInfoId === entry.id ? "selected" : ""}`}
                  onClick={() => handleSelectPrivateInfo(entry.id)}
                >
                  <div className="edit-delete-buttons">
                    <button
                      className="passwordButton"
                      onClick={() => handleViewPrivateInfo(entry)}
                    >
                      {entry.name}
                    </button>
                    <button
                      className="editButton"
                      onClick={() => handleEditPrivateInfo(entry.id, entry)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="deleteButton"
                      onClick={() => handleDeletePrivateInfo(entry.id)}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No private info stored yet.</p>
            )}
          </div>
        </div>

        {/* View Modal */}
        {isModalOpen.type === "view" && (
          <div className="content-modal">
            <div className="modal-content-password">
              <h3>Private Info</h3>
              <p><strong>Name:</strong> {viewInfo.name}</p>
              <p><strong>Info 1:</strong> {viewInfo.info_1}</p>
              <p><strong>Info 2:</strong> {viewInfo.info_2}</p>
              <p><strong>Info 3:</strong> {viewInfo.info_3}</p>
              <button className="closeModalViewPassword closeModalViewPassword-1" onClick={closeModals}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isModalOpen.type === "edit" && (
          <div className="content-modal">
            <div className="modal-content-password">
              <h3>Edit Private Info</h3>
              <input
                className="save-password-button"
                type="text"
                value={editInfo.name}
                onChange={(e) => setEditInfo({ ...editInfo, name: e.target.value })}
                placeholder="Edit Name"
              />
              <input
                className="save-password-button"
                type="text"
                value={editInfo.info_1}
                onChange={(e) => setEditInfo({ ...editInfo, info_1: e.target.value })}
                placeholder="Edit Info 1"
              />
              <input
                className="save-password-button"
                type="text"
                value={editInfo.info_2}
                onChange={(e) => setEditInfo({ ...editInfo, info_2: e.target.value })}
                placeholder="Edit Info 2"
              />
              <input
                className="save-password-button"
                type="text"
                value={editInfo.info_3}
                onChange={(e) => setEditInfo({ ...editInfo, info_3: e.target.value })}
                placeholder="Edit Info 3"
              />
              <button className="handleSaveChangesButtonPrivate" onClick={handleSaveChanges}>
                <FontAwesomeIcon icon={faCheck} />
              </button>
            </div>
          </div>
        )}
        {isModalOpen.type === "delete" && (
          <div className="content-modal">
            <div className="modal-content-password">
              <h3>Are you sure you want to delete this private info?</h3>
              <div className="modal-actions">
                <button className="confirmDelete" onClick={confirmDeletePrivateInfo}>
                  <FontAwesomeIcon icon={faCheck} /> 
                </button>
                <button className="confirmClose" onClick={closeModals}>
                  <FontAwesomeIcon icon={faXmark} /> 
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PrivateInfo;
