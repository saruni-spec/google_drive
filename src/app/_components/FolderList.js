// components/FolderList.js
export default function FolderList({
  folders,
  selectedFolder,
  onFolderSelect,
}) {
  return (
    <div className="folders-section">
      <h2 className="section-title">Folders</h2>
      <div className="folders-grid">
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onFolderSelect(folder)}
            className={`folder-button ${
              selectedFolder?.id === folder.id ? "selected" : ""
            }`}
          >
            {folder.name}
          </button>
        ))}
      </div>
    </div>
  );
}
