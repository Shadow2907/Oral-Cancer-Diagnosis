import React, { useState } from "react";
import UploadSection from "../components/UploadSection";
import AuthHeader from "../components/AuthHeader";
import axios from "axios";

const Upload = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  

  const handleUpload = async (file) => {
    if (!file) {
      setError("Vui lòng chọn một file ảnh để tải lên.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiUrl) {
      setError("Lỗi cấu hình phía client. Không tìm thấy địa chỉ API.");
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("authToken");

    const fullUrl = token
      ? `${apiUrl}/api/api/diagnosis/upload`
      : `${apiUrl}/api/api/guest/diagnosis/predict`;

    const headers = token
      ? {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        }
      : {
          "Content-Type": "multipart/form-data",
        };

    try {
      const response = await axios.post(fullUrl, formData, { headers });

      const data = response.data;
      if (typeof data === "string") {
        setResult({ diagnosis: data });
      } else {
        setResult(data);
      }
    } catch (err) {
      let errorMessage = "Tải ảnh thất bại. ";
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage += "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.";
        } else if (err.response.status === 422) {
          errorMessage += "File không hợp lệ. Vui lòng kiểm tra định dạng ảnh.";
        } else {
          errorMessage += `Lỗi máy chủ (${err.response.status}).`;
        }
      } else {
        errorMessage += "Không nhận được phản hồi từ máy chủ.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="upload-screen" className="screen">
      <div className="header" id="upload-header">
        <h2 className="screen-title">Tải Ảnh</h2>
        <AuthHeader />
      </div>
      <UploadSection onUpload={handleUpload} isLoading={isLoading} />
      {error && (
        <p style={{ color: "red", textAlign: "center", marginTop: "15px" }}>
          {error}
        </p>
      )}
      {result && (
        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <h3>Kết quả dự đoán :</h3>
          <p>
            Chẩn đoán:{" "}
            {result.diagnosis
              ? typeof result.diagnosis === "string"
                ? result.diagnosis
                : result.diagnosis.diagnosis
              : "Không có kết quả."}
          </p>
          
          {(result.segmentation_url ||
            (result.diagnosis &&
              typeof result.diagnosis === "object" &&
              result.diagnosis.segmentation_url)) && (
            <div>
              <p>Ảnh kết quả:</p>
              <img
                src={
                  result.segmentation_url
                    ? result.segmentation_url
                    : result.diagnosis.segmentation_url
                }
                alt="Ảnh segmentation"
                style={{ maxWidth: "300px", marginTop: "10px" }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Upload;
