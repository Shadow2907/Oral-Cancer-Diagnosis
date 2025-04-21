import React from 'react';
import Card from '../../components/Card';

const SystemMonitoring = () => {
  const logsData = [
    { timestamp: '2025-03-05 10:00:00', message: 'Máy chủ khởi động thành công.' },
    { timestamp: '2025-03-05 10:05:00', message: 'Người dùng đăng nhập: nguyenvana@example.com' },
    { timestamp: '2025-03-05 10:10:00', message: 'Bản ghi chẩn đoán đã được cập nhật.' },
  ];

  const handleCheckServerStatus = () => {
    alert('Đang kiểm tra trạng thái máy chủ...');
    // Add API call to check server status
  };

  return (
    <div id="system-screen" className="screen">
      <h2 className="screen-title">Theo Dõi Hệ Thống</h2>
      <Card>
        <h3>Trạng Thái Máy Chủ</h3>
        <p>
          Trạng Thái Hiện Tại: <span className="status-indicator status-up">Đang Chạy</span>
        </p>
        <button className="submit-button" onClick={handleCheckServerStatus}>
          Kiểm Tra Trạng Thái Máy Chủ
        </button>
      </Card>
      <Card>
        <h3>Nhật Ký Hệ Thống</h3>
        {logsData.map((log, index) => (
          <div key={index} className="log-entry">
            {log.timestamp} - {log.message}
          </div>
        ))}
      </Card>
    </div>
  );
};

export default SystemMonitoring;