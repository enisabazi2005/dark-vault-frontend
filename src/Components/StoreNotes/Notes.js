import React, { useState, useEffect } from "react";
import "../StoreNotes/Notes.css";
import api from "../../api";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

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
    try {
      const response = await api.post("/store-note", {
        name,
        notes: note,
      });
      setNotes([...notes, response.data]);
      setName("");
      setNote("");
    } catch (error) {
      console.error("Error saving note", error);
    }
  };

  const handleEditNote = (id) => {
    const updatedName = prompt("Edit the note title:");
    const updatedNote = prompt("Edit the note content:");
    
    if (updatedName && updatedNote) {
      api.put(`/store-note/${id}`, {
        name: updatedName,
        notes: updatedNote,
      })
        .then(() => {
          setNotes(notes.map((entry) =>
            entry.id === id
              ? { ...entry, name: updatedName, notes: updatedNote }
              : entry
          ));
        })
        .catch((error) => console.error("Error editing note", error));
    }
  };

  const handleDeleteNote = (id) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      api.delete(`/store-note/${id}`)
        .then(() => {
          setNotes(notes.filter((entry) => entry.id !== id));
        })
        .catch((error) => console.error("Error deleting note", error));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold">Your Notes</h2>
        <p>Save and manage your notes easily.</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="notesHeader">Create a Note</h2>
        <input
          type="text"
          placeholder="Enter note title"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          placeholder="Enter your note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>
        <button onClick={handleSaveNote}>Save Note</button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="notesHeader">Stored Notes</h2>
        <div className="notesGrid">
          {notes.length > 0 ? (
            notes.map((entry, index) => (
              <div key={entry.id} className="noteItem">
                <button
                  className="noteButton"
                  onClick={() =>
                    alert(`Note ${index + 1}: ${entry.name}\n${entry.notes}`)
                  }
                >
                  {entry.name}
                </button>
              </div>
            ))
          ) : (
            <p>No notes stored yet.</p>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="notesHeader">Manage Notes</h2>
        <div className="notesGrid">
          {notes.length > 0 ? (
            notes.map((entry, index) => (
              <div key={entry.id} className="noteItem">
                <button
                  className="noteButton"
                  onClick={() =>
                    alert(`Note ${index + 1}: ${entry.name}\n${entry.notes}`)
                  }
                >
                  {entry.name}
                </button>
                <button
                  className="editButton"
                  onClick={() => handleEditNote(entry.id)}
                >
                  Edit
                </button>
                <button
                  className="deleteButton"
                  onClick={() => handleDeleteNote(entry.id)}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p>No notes stored yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
