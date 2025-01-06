// components/ErrorDisplay.js
export default function ErrorDisplay({ message }) {
  return (
    <div className="error-container">
      <div className="error-message">Error: {message}</div>
    </div>
  );
}
