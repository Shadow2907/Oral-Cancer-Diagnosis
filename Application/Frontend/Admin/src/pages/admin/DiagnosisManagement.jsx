import React, { useEffect, useState } from "react";
import Card from "../../components/Card";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const DiagnosisManagement = () => {
  const [diagnosesData, setDiagnosesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userMap, setUserMap] = useState({}); 


  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteDiagnosisId, setDeleteDiagnosisId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(""); 

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
          setDiagnosesData(data);

          
          const accIds = [...new Set(data.map((d) => d.acc_id))];
          const tokenHeader = token ? { Authorization: `Bearer ${token}` } : {};
          const userFetches = accIds.map((acc_id) =>
            fetch(`${apiUrl}/api/api/admin/accounts/${acc_id}`, {
              headers: tokenHeader,
            })
              .then((res) => (res.ok ? res.json() : null))
              .then((user) => ({ acc_id, username: user?.username || acc_id }))
              .catch(() => ({ acc_id, username: acc_id }))
          );
          const users = await Promise.all(userFetches);
          const map = {};
          users.forEach(({ acc_id, username }) => {
            map[acc_id] = username;
          });
          setUserMap(map);
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


  const handleDeleteDiagnosis = (id) => {
    setDeleteDiagnosisId(id);
    setShowDeleteConfirm(true);
  };


  const handleConfirmDeleteDiagnosis = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(
        `${apiUrl}/api/api/admin/diagnosis/${deleteDiagnosisId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setDiagnosesData((prev) =>
          prev.filter((d) => d.dia_id !== deleteDiagnosisId)
        );
        setSuccessMessage("Xóa bản ghi chẩn đoán thành công!");
        setTimeout(() => setSuccessMessage(""), 4000); // Ẩn sau 4 giây
      } else {
        alert("Xóa thất bại!");
      }
    } catch {
      alert("Có lỗi xảy ra!");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteDiagnosisId(null);
    }
  };

  const getVNTime = (isoString) => {
    if (!isoString) return "Không rõ";
    const date = new Date(isoString);
    date.setHours(date.getHours() + 7);
    return date.toLocaleString("vi-VN");
  };

  return (
    <div id="diagnoses-screen" className="screen">
      <h2 className="screen-title">Quản Lý Chẩn Đoán</h2>
      <Card>
        <h3>Bản Ghi Chẩn Đoán</h3>
        {/* Hiển thị thông báo thành công */}
        {successMessage && (
          <div style={{ color: "green", marginBottom: 12, fontWeight: 500 }}>
            {successMessage}
          </div>
        )}
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
                    <td>{userMap[diag.acc_id] || diag.acc_id}</td>
                    <td>{getVNTime(diag.created_at)}</td>
                    <td>
                      {diag.diagnosis}
                      {diag.segmentation_url && (
                        <div>
                          <img
                            src={diag.segmentation_url}
                            alt="Ảnh chẩn đoán"
                            style={{ maxWidth: 120, marginTop: 4 }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="action-buttons">
                      {showDeleteConfirm &&
                      deleteDiagnosisId === diag.dia_id ? (
                        <div style={{ marginTop: 8 }}>
                          <p>Xác nhận xóa?</p>
                          <button
                            className="action-button delete-button"
                            onClick={handleConfirmDeleteDiagnosis}
                            style={{
                              color: "white",
                              background: "red",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: 4,
                              cursor: "pointer",
                              marginRight: 8,
                              width: "100px",
                            }}
                          >
                            Xác nhận
                          </button>
                          <button
                            className="action-button"
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeleteDiagnosisId(null);
                            }}
                            style={{
                              color: "black",
                              background: "#eee",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: 4,
                              cursor: "pointer",
                              width: "100px",
                            }}
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          className="action-button delete-button"
                          onClick={() => handleDeleteDiagnosis(diag.dia_id)}
                          style={{
                            marginTop: 8,
                            color: "white",
                            background: "red",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          <i className="bi bi-trash"></i> Xóa
                        </button>
                      )}
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
