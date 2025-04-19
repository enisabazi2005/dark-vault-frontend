import React, { useState, useEffect } from "react";
import "../StoreNotes/Notes.css";
import api from "../../api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import Storage from "../Storage/Storage";
import useStorageStore from "../../Store/storageStore";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState({ type: "", id: null });
  const [editNote, setEditNote] = useState("");
  const [editNoteId, setEditNoteId] = useState(null);
  const [deleteNoteId, setDeleteNoteId] = useState(null);
  const [viewNote, setViewNote] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const location = useLocation();
  const MAX_STORAGE = location.state?.MAX_STORAGE || 5;  
  const { totalStored, updateTotalStored } = useStorageStore();
  const [isStorageLimitReached, setIsStorageLimitReached] = useState(false);

  useEffect(() => {
    if (totalStored >= MAX_STORAGE) {
      setIsStorageLimitReached(true);
    } else {
      setIsStorageLimitReached(false);
    }
  }, [totalStored, MAX_STORAGE]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await api.get("/store-notes");
        setNotes(response.data);
      } catch (error) {
        console.error("Error fetching notes", error);
      }
    };

    fetchNotes();
  }, []);

  const handleSaveNote = async () => {
    if (totalStored >= MAX_STORAGE) {
      return;
    }

    try {
      const response = await api.post("/store-note", { name, notes: note });
      setNotes([...notes, response.data]);
      setName("");
      setNote("");
      updateTotalStored(totalStored + 1);
    } catch (error) {
      console.error("Error saving note", error);
    }
  };

  const handleEditNote = (id, currentName, currentNote) => {
    setEditNote({ name: currentName, notes: currentNote });
    setEditNoteId(id);
    setSelectedNoteId(id); // Set the selected note ID
    setIsModalOpen({ type: "edit", id });
  };

  const handleSaveChanges = async () => {
    if (editNote.name && editNote.notes) {
      try {
        await api.put(`/store-note/${editNoteId}`, editNote);
        setNotes(
          notes.map((entry) =>
            entry.id === editNoteId ? { ...entry, ...editNote } : entry
          )
        );
        closeModals();
      } catch (error) {
        console.error("Error saving changes", error);
      }
    }
  };

  const handleDeleteNote = (id) => {
    setDeleteNoteId(id);
    setSelectedNoteId(id); // Set the selected note ID
    setIsModalOpen({ type: "delete", id });
  };

  const confirmDeleteNote = async () => {
    try {
      await api.delete(`/store-note/${deleteNoteId}`);
      setNotes(notes.filter((entry) => entry.id !== deleteNoteId));
      closeModals();
    } catch (error) {
      console.error("Error deleting note", error);
    }
  };

  const handleViewNote = (noteContent, id) => {
    setViewNote(noteContent);
    setSelectedNoteId(id); // Ensure selectedNoteId is set for viewing
    setIsModalOpen({ type: "view", id }); // Open modal for viewing
  };

  const closeModals = () => {
    setIsModalOpen({ type: "", id: null });
    setEditNote({ name: "", notes: "" });
    setDeleteNoteId(null);
    setViewNote(""); // Reset the view note
    setSelectedNoteId(null); // Reset selected note ID
  };

  return (
    <>
      {isStorageLimitReached && (
        <Storage />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">Your Notes</h2>
          <p>Save and manage your notes easily.</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="notesHeader">Create a Note</h2>
          <input
            type="text"
            className={`password-input ${isStorageLimitReached ? 'input-disabled' : ''}`}
            placeholder={isStorageLimitReached ? "Storage limit reached" : "Enter note title"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isStorageLimitReached}
          />
          <textarea
            className={`password-input password-input-1 ${isStorageLimitReached ? 'input-disabled' : ''}`}
            placeholder={isStorageLimitReached ? "Storage limit reached" : "Enter your note"}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isStorageLimitReached}
          ></textarea>
          <button 
            className={`save-password-button ${isStorageLimitReached ? 'button-disabled' : ''}`}
            onClick={handleSaveNote}
            disabled={isStorageLimitReached}
          >
            {isStorageLimitReached ? 'Storage Limit Reached' : 'Save Note'}
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="notesHeader">Stored Notes</h2>
          <div className="passwordsGrid">
            {notes.length > 0 ? (
              notes.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`passwordItem  ${
                    selectedNoteId === entry.id ? "selected" : ""
                  }`} // Apply selected class
                >
                 <div className="edit-delete-buttons">
                 <button
                    className="passwordButton"
                    onClick={() => handleViewNote(entry.notes, entry.id)} // Pass both content and ID
                  >
                    {entry.name}
                  </button>
                  <button
                    className="editButton"
                    onClick={() =>
                      handleEditNote(entry.id, entry.name, entry.notes)
                    }
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="deleteButton"
                    onClick={() => handleDeleteNote(entry.id)}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                 </div>
                </div>
              ))
            ) : (
              <p>No notes stored yet.</p>
            )}
          </div>
        </div>

        {isModalOpen.type === "edit" && (
          <div className="content-modal">
            <div className="modal-content-password">
              <h3>Edit Note</h3>
              <input
                type="text"
                className="save-password-button"
                placeholder="Edit Note Title..."
                value={editNote.name}
                onChange={(e) =>
                  setEditNote({ ...editNote, name: e.target.value })
                }
              />
              <textarea
                className="save-password-button"
                placeholder="Edit Note Content..."
                value={editNote.notes}
                onChange={(e) =>
                  setEditNote({ ...editNote, notes: e.target.value })
                }
              ></textarea>
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

        {isModalOpen.type === "delete" && (
          <div className="content-modal">
            <div className="modal-content-password">
              <h3>Are you sure you want to delete this note?</h3>
              <div className="modal-actions">
                <button className="confirmDelete" onClick={confirmDeleteNote}>
                  Delete
                </button>
                <button className="confirmClose" onClick={closeModals}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isModalOpen.type === "view" && (
          <div className="content-modal">
            <div className="modal-content-password">
              <h3>View Note</h3>
              <p className="viewNote">{viewNote}</p>
              <div className="modal-actions">
                <button className="closeModalViewPassword" onClick={closeModals}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Notes;
