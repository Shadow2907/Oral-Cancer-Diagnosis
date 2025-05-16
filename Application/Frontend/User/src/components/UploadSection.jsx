import React, { useState, useRef } from "react";
import Webcam from "react-webcam";

const UploadSection = ({ onUpload, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "webcam.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
        setPreviewUrl(imageSrc);
        setShowWebcam(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="upload-section">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="file-upload">Chọn ảnh để tải lên:</label>
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowWebcam(true)}
            disabled={isLoading}
            style={{ marginLeft: 8 }}
          >
            Chụp ảnh
          </button>
        </div>
        {showWebcam && (
          <div
            style={{
              margin: "16px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={220}
              videoConstraints={{ facingMode: "user" }}
            />
            <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
              <button type="button" onClick={capture}>
                Chụp ảnh
              </button>
              <button type="button" onClick={() => setShowWebcam(false)}>
                Đóng
              </button>
            </div>
          </div>
        )}
        {previewUrl && (
          <div style={{ margin: "16px 0" }}>
            <img
              src={previewUrl}
              alt="Demo"
              style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8 }}
            />
          </div>
        )}
        <button
          type="submit"
          className="auth-submit"
          disabled={isLoading || !selectedFile}
        >
          {isLoading ? "Đang chẩn đoán..." : "Dự đoán"}
        </button>
      </form>
    </div>
  );
};

export default UploadSection;
