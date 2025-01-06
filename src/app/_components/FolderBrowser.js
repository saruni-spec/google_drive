// components/FolderBrowser.js
"use client";
import { useState, useEffect, Suspense } from "react";
import FolderList from "./FolderList";
import ErrorDisplay from "./ErrorDisplay";
import Gallery from "./Gallery";
import LoadingSpinner from "./LoadingSpinner";

export default function FolderBrowser() {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchFolders = async () => {
      try {
        const response = await fetch("/api/folders");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setFolders(data);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to fetch folders");

          console.error("Folder fetch error:", err);
        }
      }
    };
    fetchFolders();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchImages = async () => {
      if (!selectedFolder) return;

      setError(null);
      try {
        const response = await fetch(`/api/images?folder=${selectedFolder.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setImages(data.images || []);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to fetch images");

          console.error("Image fetch error:", err);
        }
      }
    };
    fetchImages();
    return () => {
      isMounted = false;
    };
  }, [selectedFolder]);

  const handleFolderSelect = (folder) => {
    setSelectedFolder(folder);
    setImages([]);
  };

  async function save_images() {
    await fetch("/api/images", {
      method: "POST",
      body: JSON.stringify({
        // Stringify the body
        images: images,
        folder: selectedFolder,
      }),
    });
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="folder-browser-container">
        <h1 className="main-title">Google Drive Folder Browser</h1>
        <button onClick={save_images}>Save Images</button>
        <FolderList
          folders={folders}
          selectedFolder={selectedFolder}
          onFolderSelect={handleFolderSelect}
        />
        {selectedFolder && <Gallery images={images} />}
      </div>
    </Suspense>
  );
}
