import { useState, useEffect, useRef } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../firebase";
import Button from "../Button";
import "./MediaUploader.scss";
import { useNavigate } from "react-router";

const storage = getStorage(app);

const MediaUploader = ({ onUploadSuccess }) => {
  const fileInputRef = useRef(null);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const selectedFilesArray = Array.from(event.target.files);

    if (selectedFilesArray.length === 0) {
      if (event.target) event.target.value = null;
      return;
    }

    const uniqueNewFiles = selectedFilesArray.filter(
      (newFile) =>
        !filesToUpload.some(
          (existingFile) => existingFile.name === newFile.name,
        ),
    );

    if (uniqueNewFiles.length > 0) {
      const newFilesWithPreviews = uniqueNewFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      );
      setFilesToUpload((currentFilesToUpload) =>
        currentFilesToUpload.concat(newFilesWithPreviews),
      );
    }
    setError(null);

    // Clear the input's value to allow selecting the same file(s) again
    if (event.target) {
      event.target.value = null;
    }
  };

  // Effect for cleaning up preview URLs when the component unmounts or files change
  useEffect(() => {
    return () =>
      filesToUpload.forEach((file) => {
        if (file.preview && file.preview.startsWith("blob:")) {
          URL.revokeObjectURL(file.preview);
        }
      });
  }, [filesToUpload]);

  const handleUpload = async () => {
    if (filesToUpload.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const storageRef = ref(storage, `photos/${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });
      const urls = await Promise.all(uploadPromises);
      console.log("Uploaded file URLs:", urls);
      setFilesToUpload([]);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      navigate("/");
    } catch (err) {
      setError("Failed to upload photos: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileName) => {
    setFilesToUpload((prevFiles) => {
      const fileToRemove = prevFiles.find((file) => file.name === fileName);
      if (
        fileToRemove &&
        fileToRemove.preview &&
        fileToRemove.preview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prevFiles.filter((file) => file.name !== fileName);
    });
  };

  return (
    <div className="photos-page-container">
      <h1>Share Your Moments</h1>
      <p className="page-description">
        Upload your favorite photos and videos from our time together!
      </p>
      <div className="media-uploader">
        <div className="file-input-container">
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={handleFileChange}
            accept="image/jpeg, image/png, image/gif, image/webp, video/mp4, video/quicktime, video/x-matroska, video/webm"
            className="hidden-file-input"
          />
          <Button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            title={filesToUpload.length ? "Add more files" : "Select Files"}
          />
        </div>
        {filesToUpload.length > 0 && (
          <div className="previews">
            <div className="preview-grid">
              {filesToUpload.map((file) => (
                <div key={file.name} className="preview-item">
                  {file.preview && file.type.startsWith("image/") ? (
                    <img src={file.preview} alt={`Preview of ${file.name}`} />
                  ) : file.preview && file.type.startsWith("video/") ? (
                    <video
                      src={file.preview}
                      autoPlay
                      muted
                      loop
                      playsInline // Important for iOS
                      // controls // Optionally add controls
                      alt={`Preview of ${file.name}`}
                    />
                  ) : (
                    <div className="file-icon-placeholder">
                      {file.type.startsWith("video/") ? "🎬" : "📄"}
                    </div>
                  )}
                  <span className="file-name">{file.name}</span>
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={() => removeFile(file.name)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <Button
          onClick={handleUpload}
          disabled={filesToUpload.length === 0 || uploading}
          title={uploading ? "Uploading..." : "Upload Photos"}
        />
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default MediaUploader;
