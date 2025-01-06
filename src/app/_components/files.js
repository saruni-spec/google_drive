"use client";
import { useState, useEffect } from "react";
import "./GoogleDriveFolderBrowser.css";
import Gallery from "./_components/Gallery";

export default function Home() {
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch folders when component mounts
  useEffect(() => {
    const fetchFolders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:3000/api/folders");
        console.log(response);
        setFolders(response.data);
      } catch (err) {
        setError("Failed to fetch folders");
        console.log(err);
      }
      setIsLoading(false);
    };

    fetchFolders();
  }, []);

  
  // Handle folder selection
  const handleFolderSelect = (folder) => {
    setSelectedFolder(folder);
    setImages([]); // Clear previous images
  };

  // Render loading state
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  // Render error state
  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <>
      <div className="folder-browser-container">
        <h1 className="main-title">Google Drive Folder Browser</h1>

        {/* Folders List */}
        <div className="folders-section">
          <h2 className="section-title">Folders</h2>
          <div className="folders-grid">
            {folders &&
              folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleFolderSelect(folder)}
                  className={`folder-button ${
                    selectedFolder?.id === folder.id ? "selected" : ""
                  }`}
                >
                  {folder.name}
                </button>
              ))}
          </div>
        </div>

        {/* Images Grid */}
        {selectedFolder && (
          <div className="images-section">
            <h2 className="section-title">Images in {selectedFolder.name}</h2>
            {images.length === 0 ? (
              <p className="no-images-message">
                No images found in this folder.
              </p>
            ) : (
              <div className="images-grid">
                <Gallery images={images} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
