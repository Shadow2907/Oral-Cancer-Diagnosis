import React, { useEffect, useState } from "react";
import Card from "../../components/Card";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const DiagnosisManagement = () => {
  const [diagnosesData, setDiagnosesData] = useState([]);
  const [loading, setLoading] = useState(true);

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
          setDiagnosesData(data);
        } else {
          setDiagnosesData([]);
        }
      } catch (error) {
        setDiagnosesData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDiagnoses();
  }, []);

  const handleEditDiagnosis = async (id) => {
    const token = localStorage.getItem("authToken");
    try {
      // Lấy dữ liệu hiện tại
      const res = await fetch(`${apiUrl}/api/api/admin/diagnosis/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        alert("Không lấy được dữ liệu chẩn đoán!");
        return;
      }
      const data = await res.json();
      const newDiagnosis = prompt(
        "Nhập kết quả chẩn đoán mới:",
        data.diagnosis
      );
      if (!newDiagnosis) return;

      // Gửi cập nhật
      const updateRes = await fetch(`${apiUrl}/api/api/admin/diagnosis/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          acc_id: data.acc_id,
          created_at: data.created_at,
          diagnosis: newDiagnosis,
        }),
      });
      if (updateRes.ok) {
        alert("Cập nhật thành công!");
        // Cập nhật lại danh sách
        window.location.reload();
      } else {
        alert("Cập nhật thất bại!");
      }
    } catch {
      alert("Có lỗi xảy ra!");
    }
  };

  const handleDeleteDiagnosis = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa bản ghi chẩn đoán ${id}?`)) {
      const token = localStorage.getItem("authToken");
      try {
        const res = await fetch(`${apiUrl}/api/api/admin/diagnosis/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          alert("Đã xóa bản ghi chẩn đoán!");
          window.location.reload();
        } else {
          alert("Xóa thất bại!");
        }
      } catch {
        alert("Có lỗi xảy ra!");
      }
    }
  };

  return (
    <div id="diagnoses-screen" className="screen">
      <h2 className="screen-title">Quản Lý Chẩn Đoán</h2>
      <Card>
        <h3>Bản Ghi Chẩn Đoán</h3>
        <div className="table-container">
          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  
                  <th>Người Dùng</th>
                  <th>Ngày</th>
                  <th>Kết Quả</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {diagnosesData.map((diag) => (
                  <tr key={diag.dia_id}>
                    
                    <td>{diag.acc_id}</td>
                    <td>
                      {diag.created_at
                        ? new Date(diag.created_at).toLocaleString()
                        : ""}
                    </td>
                    <td>
                      {diag.diagnosis}
                      {diag.photo_url && (
                        <div>
                          <img
                            src={diag.photo_url}
                            alt="Ảnh chẩn đoán"
                            style={{ maxWidth: 120, marginTop: 4 }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="action-buttons">
                      <button
                        className="action-button edit-button"
                        onClick={() => handleEditDiagnosis(diag.dia_id)}
                      >
                        <i className="bi bi-pencil"></i> Sửa
                      </button>
                      <button
                        className="action-button delete-button"
                        onClick={() => handleDeleteDiagnosis(diag.dia_id)}
                      >
                        <i className="bi bi-trash"></i> Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DiagnosisManagement;
