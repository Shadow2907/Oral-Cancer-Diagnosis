import React, { useEffect, useState } from "react";
import Card from "../../components/Card";

const UserManagement = () => {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    password: "",
    status: "",
  });
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUserId, setResetUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); 

  const fetchAccounts = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${apiUrl}/api/api/admin/accounts/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const accounts = await res.json();
      if (Array.isArray(accounts)) {
        const userDetails = await Promise.all(
          accounts.map(async (acc) => {
            const detailRes = await fetch(
              `${apiUrl}/api/api/admin/accounts/${acc.acc_id}`,
              { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            const detail = await detailRes.json();
            return detail;
          })
        );
        setUsersData(userDetails);
      } else {
        setUsersData([]);
      }
    } catch (error) {
      setUsersData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleEditUser = (id) => {
    const user = usersData.find((u) => u.acc_id === id);
    if (user) {
      setEditingUser(id);
      setEditForm({
        username: user.username,
        email: user.email,
        password: "",
        status: user.status,
      });
    }
  };

  const handleEditSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");
    try {
      const user = usersData.find((u) => u.acc_id === editingUser);
      const body = {
        username: editForm.username,
        email: editForm.email,
        status: editForm.status,
        password: editForm.password ? editForm.password : user.password,
      };
      const res = await fetch(
        `${apiUrl}/api/api/admin/accounts/${editingUser}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      // Sau khi sửa hoặc reset mật khẩu thành công, reset tất cả các state liên quan
      if (res.ok) {
        setEditingUser(null);
        setShowEditConfirm(false);
        setResetUserId(null);
        setShowResetModal(false);
        setDeleteUserId(null);
        setShowDeleteConfirm(false);
        setNewPassword("");
        setResetError("");
        await fetchAccounts();
        setSuccessMessage("Thao tác thành công!");
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch {}
  };

  const handleEditCancel = () => {
    setEditingUser(null);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleDeleteUser = (id) => {
    setDeleteUserId(id);
    setShowDeleteConfirm(true);
    setEditingUser(null);
    setShowEditConfirm(false);
    setResetUserId(null);
    setShowResetModal(false);
  };

  const handleConfirmDeleteUser = async () => {
    if (!deleteUserId) return;
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(
        `${apiUrl}/api/api/admin/accounts/${deleteUserId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        await fetchAccounts();
        setSuccessMessage(`Xóa tài khoản ${deleteUserId} thành công!`);
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch {}
    setShowDeleteConfirm(false);
    setDeleteUserId(null);
  };

  const handleResetPassword = (id) => {
    setResetUserId(id);
    setNewPassword("");
    setResetError("");
    setShowResetModal(true);
  };

  const handleConfirmResetPassword = async () => {
    if (!newPassword) {
      setResetError("Bạn chưa nhập mật khẩu mới!");
      return;
    }
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");
    try {
      const user = usersData.find((u) => u.acc_id === resetUserId);
      if (!user) {
        setResetError("Không tìm thấy người dùng!");
        return;
      }
      const body = {
        username: user.username,
        email: user.email,
        status: user.status,
        password: newPassword,
      };
      const res = await fetch(
        `${apiUrl}/api/api/admin/accounts/${resetUserId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      // Sau khi sửa hoặc reset mật khẩu thành công, reset tất cả các state liên quan
      if (res.ok) {
        setEditingUser(null);
        setShowEditConfirm(false);
        setResetUserId(null);
        setShowResetModal(false);
        setDeleteUserId(null);
        setShowDeleteConfirm(false);
        setNewPassword("");
        setResetError("");
        await fetchAccounts();
        setSuccessMessage("Thao tác thành công!");
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        setResetError("Đặt lại mật khẩu thất bại!");
      }
    } catch {
      setResetError("Có lỗi xảy ra!");
    }
  };

  return (
    <div id="users-screen" className="screen">
      <h2 className="screen-title">Quản Lý Người Dùng</h2>
      <Card>
        <h3>Danh Sách Người Dùng</h3>
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
                  <th>ID</th>
                  <th>Tên Người Dùng</th>
                  <th>Email</th>
                  <th>Trạng Thái</th>
                  <th>Vai Trò</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {usersData.map((user) =>
                  editingUser === user.acc_id ? (
                    <tr key={user.acc_id}>
                      <td>{user.acc_id}</td>
                      <td>
                        <input
                          name="username"
                          value={editForm.username}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td>
                        <input name="email" onChange={handleEditChange} />
                      </td>
                      <td>{user.role}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button edit-button"
                            onClick={handleEditSubmit} 
                          >
                            Lưu
                          </button>
                          <button
                            className="action-button delete-button"
                            onClick={handleEditCancel}
                          >
                            Hủy
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={user.acc_id}>
                      <td>{user.acc_id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.status}</td>
                      <td>{user.role}</td>
                      <td className="action-buttons">
                        <button
                          className="action-button edit-button"
                          onClick={() => handleEditUser(user.acc_id)}
                        >
                          <i className="bi bi-pencil"></i> Sửa
                        </button>
                        <button
                          className="action-button delete-button"
                          onClick={() => handleDeleteUser(user.acc_id)}
                        >
                          <i className="bi bi-trash"></i> Xóa
                        </button>
                        <button
                          className="action-button reset-button"
                          onClick={() => handleResetPassword(user.acc_id)}
                        >
                          <i className="bi bi-key"></i> Đặt Lại Mật Khẩu
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>
      {showEditConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Xác nhận lưu chỉnh sửa</h3>
            <p>
              Bạn có chắc muốn lưu thay đổi cho người dùng{" "}
              <b>{editForm.username}</b>?
            </p>
            <div style={{ marginTop: 12 }}>
              <button
                className="action-button edit-button"
                onClick={async () => {
                  setShowEditConfirm(false);
                  await handleEditSubmit(new Event("submit"));
                }}
                style={{ width: "100px" }}
              >
                Xác nhận
              </button>
              <button
                className="action-button delete-button"
                onClick={() => setShowEditConfirm(false)}
                style={{ width: "100px" }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Xác nhận xóa người dùng</h3>
            <p>
              Bạn có chắc muốn xóa người dùng <b>{deleteUserId}</b> không?
            </p>
            <div style={{ marginTop: 12, width: "100px" }}>
              <button
                className="action-button delete-button"
                onClick={handleConfirmDeleteUser}
              >
                Xác nhận
              </button>
              <button
                className="action-button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteUserId(null);
                }}
                style={{ width: "100px" }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Đặt lại mật khẩu</h3>
            <p>
              Nhập mật khẩu mới cho người dùng <b>{resetUserId}</b>:
            </p>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mật khẩu mới"
              style={{ width: "100%", margin: "8px 0", padding: "6px" }}
            />
            {resetError && (
              <div style={{ color: "red", marginBottom: 8 }}>{resetError}</div>
            )}
            <div style={{ marginTop: 12 }}>
              <button
                className="action-button edit-button"
                onClick={handleConfirmResetPassword}
                style={{ width: "100px" }}
              >
                Xác nhận
              </button>
              <button
                className="action-button delete-button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetUserId(null);
                  setNewPassword("");
                  setResetError("");
                }}
                style={{ width: "100px" }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
