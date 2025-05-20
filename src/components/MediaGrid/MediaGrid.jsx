import { useState, useEffect } from "react";
import { app } from "../../firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import "./MediaGrid.scss";
import Button from "../Button";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import FullScreenMediaModal from "../FullScreenMediaModal";

const functions = getFunctions(app);
const listMediaPaginated = httpsCallable(functions, "listMediaPaginated");
const deleteMediaItemCallable = httpsCallable(functions, "deleteMediaItem");
const ITEMS_PER_LOAD = 9;

const MediaGridDisplay = ({
  isLoading,
  mediaItems,
  isVideo,
  allMediaLoaded,
  nextPageToken,
  isLoadingMore,
  onLoadMore,
  currentUser,
  onDelete,
  onMediaClick,
}) => {
  if (isLoading && mediaItems.length === 0) {
    return <div className="status-message loading">Loading media...</div>;
  }

  if (!isLoading && mediaItems.length === 0) {
    return (
      <div className="status-message no-media">No photos or videos found.</div>
    );
  }

  return (
    <>
      <div className="media-grid">
        {mediaItems.map((item) => (
          <div
            key={item.fullName || item.name}
            className="media-item"
            onClick={() => onMediaClick(item)} // Call onMediaClick
          >
            {isVideo(item.name) ? (
              <video
                src={item.url}
                autoPlay
                muted
                loop
                playsInline
                draggable="false"
                alt={`Video ${item.name}`}
                title="Press and hold to download"
              />
            ) : (
              <img
                src={item.url}
                alt={`Photo ${item.name}`}
                draggable="false"
                title="Press and hold to download"
              />
            )}
            {currentUser && (
              <button
                className="delete-media-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.fullName);
                }}
                title="Delete Media"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>
      {!allMediaLoaded && nextPageToken && (
        <div className="load-more-container">
          <Button
            title={isLoadingMore ? "Loading..." : "Load More"}
            onClick={onLoadMore}
            disabled={isLoadingMore}
          />
        </div>
      )}
      {isLoadingMore && (
        <div className="status-message loading-more">Loading more...</div>
      )}
    </>
  );
};

const MediaGrid = ({ refreshKey }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [allMediaLoaded, setAllMediaLoaded] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMediaItems([]);
    setNextPageToken(null);
    setAllMediaLoaded(false);
    fetchMediaItems(true); // true for initial load
  }, [refreshKey]);

  const fetchMediaItems = async (
    isInitialLoad = false,
    tokenForNextPage = null,
  ) => {
    if (!isInitialLoad && isLoadingMore) return; // Prevent multiple "load more" requests
    if (allMediaLoaded && !isInitialLoad) return; // Don't fetch if all loaded

    if (isInitialLoad) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const result = await listMediaPaginated({
        pageSize: ITEMS_PER_LOAD,
        pageToken: isInitialLoad ? null : tokenForNextPage,
      });

      const newItemsWithUrls = result.data.mediaItems;

      setMediaItems((prevItems) =>
        isInitialLoad ? newItemsWithUrls : [...prevItems, ...newItemsWithUrls],
      );

      if (result.data.nextPageToken) {
        setNextPageToken(result.data.nextPageToken);
        setAllMediaLoaded(false);
      } else {
        setNextPageToken(null);
        setAllMediaLoaded(true);
      }
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  const isVideo = (fileName) => {
    const videoExtensions = [".mp4", ".mov", ".webm", ".quicktime", ".mkv"];
    return videoExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));
  };

  const handleDeleteMedia = async (fullName) => {
    // Add a confirmation dialog here
    // if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await deleteMediaItemCallable({ fullName });
      // Remove the item from the local state to update UI immediately
      setMediaItems((prevItems) =>
        prevItems.filter((item) => item.fullName !== fullName),
      );
      console.log("Successfully deleted:", fullName);
    } catch (err) {
      console.error("Error deleting media:", err);
    }
  };

  const handleMediaClick = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
  };

  return (
    <div className="media-grid-container">
      <h2>Gallery</h2>

      <MediaGridDisplay
        isLoading={isLoading}
        mediaItems={mediaItems}
        isVideo={isVideo}
        allMediaLoaded={allMediaLoaded}
        nextPageToken={nextPageToken}
        isLoadingMore={isLoadingMore}
        onLoadMore={() => fetchMediaItems(false, nextPageToken)}
        currentUser={currentUser}
        onDelete={handleDeleteMedia}
        onMediaClick={handleMediaClick}
      />
      <p className="media-grid-instruction">
        Press and hold an image or video to download.
      </p>
      <Button
        title="Share your media"
        onClick={() => {
          navigate("/upload");
        }}
        className="upload-button-spacing"
      />
      {isModalOpen && selectedMedia && (
        <FullScreenMediaModal
          media={selectedMedia}
          onClose={handleCloseModal}
          isVideo={isVideo}
        />
      )}
    </div>
  );
};

export default MediaGrid;
