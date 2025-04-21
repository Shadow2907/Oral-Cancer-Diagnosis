import React, { useState, useRef } from 'react';

const UploadSection = () => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setUploadedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 3500); // Show for 3s, fade out 0.5s
            };
            reader.readAsDataURL(file);
        } else {
            // Handle invalid file type
            alert("Vui lòng chọn một file ảnh.");
            setUploadedFile(null);
            setPreviewUrl(null);
        }
         // Reset file input value so the same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleCheck = () => {
        alert('Đang kiểm tra ảnh: ' + uploadedFile?.name);
        // Add actual check logic here
    };

    const handleDelete = () => {
        setUploadedFile(null);
        setPreviewUrl(null);
         // Reset file input value
         if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleLabelClick = () => {
         if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    return (
        <div className="upload-section">
             {/* Notification */}
             <div className={`notification ${showNotification ? 'show' : ''}`} >
                <i className="bi bi-check-circle" style={{ marginRight: '10px' }}></i>
                Đã tải lên một ảnh thành công!
            </div>

            {/* Upload Area or Image Preview */}
            {!previewUrl ? (
                <div className="upload-area">
                    <input
                        type="file"
                        id="file-upload"
                        accept="image/*"
                        className="file-input"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                    />
                    {/* Make the entire label clickable */}
                    <label htmlFor="file-upload" className="upload-label" onClick={handleLabelClick}>
                        <i className="bi bi-cloud-upload"></i>
                        <p>Kéo và thả một ảnh tại đây hoặc nhấp để chọn</p>
                    </label>
                </div>
            ) : (
                 <img src={previewUrl} alt="Xem trước ảnh tải lên" className="uploaded-image-preview" />
            )}

            {/* Action Buttons */}
            {previewUrl && (
                <>
                    <button id="check-button" className="action-button check-button" onClick={handleCheck}>
                        <i className="bi bi-search"></i> Kiểm Tra
                    </button>
                    <button id="delete-button" className="action-button delete-button" onClick={handleDelete}>
                        <i className="bi bi-trash"></i> Xóa Ảnh
                    </button>
                </>
            )}
        </div>
    );
};

export default UploadSection;