import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

const UploadSection = ({ onUpload, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);

  // Hàm crop ảnh về 256x256
  const cropImageTo256 = (file) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");

        // Tính toán crop vùng giữa ảnh
        const minSize = Math.min(img.width, img.height);
        const sx = (img.width - minSize) / 2;
        const sy = (img.height - minSize) / 2;

        ctx.drawImage(
          img,
          sx, sy, minSize, minSize, 
          0, 0, 256, 256 
        );
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type }));
          } else {
            reject(new Error("Không thể crop ảnh"));
          }
        }, file.type);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));

    const img = new window.Image();
    img.onload = async () => {
      if (img.width !== 256 || img.height !== 256) {
        const cropped = await cropImageTo256(file);
        setSelectedFile(cropped);
        setPreviewUrl(URL.createObjectURL(cropped));
      } else {
        setSelectedFile(file);
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };


  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const res = await fetch(imageSrc);
    const blob = await res.blob();
    const file = new File([blob], "webcam.jpg", { type: "image/jpeg" });


    const img = new window.Image();
    img.onload = async () => {
      if (img.width !== 256 || img.height !== 256) {
        const cropped = await cropImageTo256(file);
        setSelectedFile(cropped);
        setPreviewUrl(URL.createObjectURL(cropped));
      } else {
        setSelectedFile(file);
        setPreviewUrl(imageSrc);
      }
    };
    img.src = URL.createObjectURL(file);
    setShowWebcam(false);
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
              style={{ width: 256, height: 256, objectFit: "cover", borderRadius: 8 }}
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
