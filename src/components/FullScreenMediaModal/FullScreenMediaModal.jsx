import React, { useEffect } from "react";
import "./FullScreenMediaModal.scss";

const FullScreenMediaModal = ({ media, onClose, isVideo }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);

    // Prevent background scrolling when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEsc);
      // Restore background scrolling when modal is closed
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  if (!media) {
    return null;
  }

  const handleOverlayClick = (e) => {
    // Close modal if click is on the overlay itself, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fullscreen-modal-overlay" onClick={handleOverlayClick}>
      <button className="close-modal-btn" onClick={onClose} title="Close">
        &times;
      </button>
      <div className="fullscreen-modal-content">
        {isVideo(media.name) ? (
          <video
            src={media.url}
            controls
            autoPlay
            playsInline
            loop
            alt={`Video ${media.name}`}
          />
        ) : (
          <img src={media.url} alt={`Photo ${media.name}`} />
        )}
      </div>
    </div>
  );
};

export default FullScreenMediaModal;
