import React, { useEffect, useState } from "react";
import Card from "../../components/Card";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const SystemMonitoring = () => {
  const [logsData, setLogsData] = useState([]);

  useEffect(() => {
    const fetchDiagnoses = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `${apiUrl}/api/api/admin/diagnosis/?skip=0&limit=1000`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          const logs = data.slice(0, 10).map((diag) => ({
            timestamp: getVNTime(diag.created_at),
            message: "Bản ghi chẩn đoán đã được cập nhật.",
          }));
          setLogsData(logs);
        }
      } catch {
        setLogsData([]);
      }
    };
    fetchDiagnoses();
  }, []);

  
  const getVNTime = (isoString) => {
  if (!isoString) return "Không rõ";
  const date = new Date(isoString);
  date.setHours(date.getHours() + 7);
  return date.toLocaleString("vi-VN");
};

  return (
    <div id="system-screen" className="screen">
      <h2 className="screen-title">Theo Dõi Hệ Thống</h2>
      <Card>
        <h3>Trạng Thái Máy Chủ</h3>
        <p>
          Trạng Thái Hiện Tại:{" "}
          <span className="status-indicator status-up">Đang Chạy</span>
        </p>
      </Card>
      <Card>
        <h3>Nhật Ký Hệ Thống</h3>
        {logsData.length === 0 ? (
          <p>Không có nhật ký.</p>
        ) : (
          logsData.map((log, index) => (
            <div key={index} className="log-entry">
              {log.timestamp} - {log.message}
            </div>
          ))
        )}
      </Card>
    </div>
  );
};

export default SystemMonitoring;
