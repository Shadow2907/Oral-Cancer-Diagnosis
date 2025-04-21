import React from 'react';
import Card from '../../components/Card';

const DiagnosisManagement = () => {
  const diagnosesData = [
    { id: '001', user: 'Nguyen Van A', date: '05/03/2025', result: 'Không Ung Thư' },
    { id: '002', user: 'Tran Thi B', date: '01/03/2025', result: 'Nghi Ngờ Ung Thư' },
  ];

  const handleEditDiagnosis = (id) => {
    alert(`Mở form chỉnh sửa chẩn đoán ${id}`);
    // Implement form logic (e.g., open modal or navigate to edit page)
  };

  const handleDeleteDiagnosis = (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa bản ghi chẩn đoán ${id}?`)) {
      alert(`Đã xóa bản ghi chẩn đoán ${id}`);
      // Add API call to delete diagnosis
    }
  };

  return (
    <div id="diagnoses-screen" className="screen">
      <h2 className="screen-title">Quản Lý Chẩn Đoán</h2>
      <Card>
        <h3>Bản Ghi Chẩn Đoán</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Người Dùng</th>
                <th>Ngày</th>
                <th>Kết Quả</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {diagnosesData.map((diag) => (
                <tr key={diag.id}>
                  <td>{diag.id}</td>
                  <td>{diag.user}</td>
                  <td>{diag.date}</td>
                  <td>{diag.result}</td>
                  <td className="action-buttons">
                    <button
                      className="action-button edit-button"
                      onClick={() => handleEditDiagnosis(diag.id)}
                    >
                      <i className="bi bi-pencil"></i> Sửa
                    </button>
                    <button
                      className="action-button delete-button"
                      onClick={() => handleDeleteDiagnosis(diag.id)}
                    >
                      <i className="bi bi-trash"></i> Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DiagnosisManagement;