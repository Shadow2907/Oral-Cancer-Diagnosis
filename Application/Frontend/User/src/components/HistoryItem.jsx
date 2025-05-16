import React from "react";
import Card from "./Card";

const HistoryItem = ({ result, photoUrl, createdAt }) => {
  const resultStyle = result?.toLowerCase().includes("nghi ngờ")
    ? { color: "red" }
    : {};

  const getVNTime = (isoString) => {
    if (!isoString) return "Không rõ";
    const date = new Date(isoString);
    date.setHours(date.getHours() + 7);
    return date.toLocaleString("vi-VN");
  };

  return (
    <Card className="history-item">
      {photoUrl && (
        <div style={{ marginBottom: 8 }}>
          <img
            src={photoUrl}
            alt="Ảnh chẩn đoán"
            style={{ maxWidth: 120, borderRadius: 6 }}
          />
        </div>
      )}
      <div>
        <p>
          Thời gian chẩn đoán: {createdAt ? getVNTime(createdAt) : "Không rõ"}
        </p>
      </div>
      <div>
        <p style={resultStyle}>Kết Quả: {result}</p>
      </div>
    </Card>
  );
};

export default HistoryItem;
