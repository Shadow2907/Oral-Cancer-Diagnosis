import React, { useState } from 'react';

const UploadSection = ({ onUpload, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
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
        </div>
        <button
          type="submit"
          className="auth-submit"
          disabled={isLoading || !selectedFile}
        >
          {isLoading ? 'Đang chẩn đoán...' : 'Tải Ảnh Lên'}
        </button>
      </form>
    </div>
  );
};

export default UploadSection;