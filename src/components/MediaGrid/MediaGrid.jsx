import { useState, useEffect } from "react";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { app } from "../../firebase";
import "./MediaGrid.scss";
import Button from "../Button";
import { useNavigate } from "react-router";

const storage = getStorage(app);

const MediaGrid = ({ refreshKey }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoading(true);
      try {
        const photosRef = ref(storage, "photos/");
        const result = await listAll(photosRef);

        const itemsWithUrls = await Promise.all(
          result.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            return { name: itemRef.name, url };
          }),
        );
        setMediaItems(itemsWithUrls);
      } catch (err) {
        console.error("Error fetching media:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, [refreshKey]);

  const isVideo = (fileName) => {
    const videoExtensions = [".mp4", ".mov", ".webm", ".quicktime", ".mkv"];
    return videoExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));
  };

  if (isLoading) {
    return <div className="media-grid-container loading">Loading media...</div>;
  }

  if (mediaItems.length === 0) {
    return (
      <div className="media-grid-container no-media">
        No photos or videos found.
      </div>
    );
  }

  return (
    <div className="media-grid-container">
      <h2>Gallery</h2>
      <div className="media-grid">
        {mediaItems.map((item) => (
          <div key={item.name} className="media-item">
            {isVideo(item.name) ? (
              <video
                src={item.url}
                autoPlay
                muted
                loop
                playsInline
                alt={`Video ${item.name}`}
              />
            ) : (
              <img src={item.url} alt={`Photo ${item.name}`} />
            )}
          </div>
        ))}
      </div>
      <Button title="Share your media" onClick={() => {
          navigate("/upload");
        }} />
    </div>
  );
};

export default MediaGrid;
