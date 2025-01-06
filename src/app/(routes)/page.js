import { useState, useEffect, Suspense } from "react";
import "./GoogleDriveFolderBrowser.css";
import Gallery from "../_components/Gallery";
import LoadingSpinner from "../_components/LoadingSpinner";

export const Folders = () => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);

  // Fetch folders when component mounts
  useEffect(() => {
    const fetchFolders = async () => {
      setError(null);
      try {
        const response = await fetch("/api/folders");
        setFolders(response.data);
      } catch (err) {
        setError("Failed to fetch folders");
        console.error(err);
      }
    };

    fetchFolders();
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      if (!selectedFolder) return;

      setError(null);
      try {
        const response = await fetch(`/api/images?folder=${selectedFolder.id}`);
        const results = response.data;
        console.log(results.images);
        setImages(results.images);
      } catch (err) {
        setError("Failed to fetch images");
        console.error(err);
      }
    };

    fetchImages();
  }, [selectedFolder]);

  // Handle folder selection
  const handleFolderSelect = (folder) => {
    setSelectedFolder(folder);
    setImages([]); // Clear previous images
  };

  // Render error state
  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="folder-browser-container">
        <h1 className="main-title">Google Drive Folder Browser</h1>

        {/* Folders List */}
        <div className="folders-section">
          <h2 className="section-title">Folders</h2>
          <div className="folders-grid">
            {folders.map((folder) => (
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
    </Suspense>
  );
};

export default Folders;
