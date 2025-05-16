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

  // Đưa fetchAccounts ra ngoài useEffect
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

  // Mở form sửa
  const handleEditUser = (id) => {
    const user = usersData.find((u) => u.acc_id === id);
    if (user) {
      setEditingUser(id);
      setEditForm({
        username: user.username,
        email: user.email,
        password: "", // Để trống, chỉ nhập khi muốn đổi
        status: user.status,
      });
    }
  };

  // Gửi request cập nhật
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");
    try {
      // Lấy user hiện tại để lấy password cũ nếu không đổi
      const user = usersData.find((u) => u.acc_id === editingUser);
      const body = {
        username: editForm.username,
        email: editForm.email,
        status: editForm.status,
        password: editForm.password ? editForm.password : user.password, // luôn gửi password
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
      if (res.ok) {
        alert("Cập nhật thành công!");
        setEditingUser(null);
        await fetchAccounts();
      } else {
        alert("Cập nhật thất bại!");
      }
    } catch {
      alert("Có lỗi xảy ra!");
    }
  };

  // Đóng form sửa
  const handleEditCancel = () => {
    setEditingUser(null);
  };

  // Xử lý thay đổi input form sửa
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa người dùng ${id}?`)) {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("authToken");
      try {
        const res = await fetch(`${apiUrl}/api/api/admin/accounts/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          alert("Xóa thành công!");
          await fetchAccounts(); // Cập nhật lại danh sách
        } else {
          alert("Xóa thất bại!");
        }
      } catch {
        alert("Có lỗi xảy ra!");
      }
    }
  };

  const handleResetPassword = async (id) => {
    if (
      window.confirm(`Bạn có chắc muốn đặt lại mật khẩu cho người dùng ${id}?`)
    ) {
      const newPassword = prompt("Nhập mật khẩu mới cho người dùng:");
      if (!newPassword) {
        alert("Bạn chưa nhập mật khẩu mới!");
        return;
      }
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("authToken");
      try {
        // Lấy thông tin user hiện tại để giữ nguyên các trường khác
        const user = usersData.find((u) => u.acc_id === id);
        if (!user) {
          alert("Không tìm thấy người dùng!");
          return;
        }
        const body = {
          username: user.username,
          email: user.email,
          status: user.status,
          password: newPassword, // Mật khẩu do admin nhập
        };
        const res = await fetch(`${apiUrl}/api/api/admin/accounts/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          alert(
            `Đã đặt lại mật khẩu cho người dùng ${id} (mật khẩu mới: ${newPassword})`
          );
        } else {
          alert("Đặt lại mật khẩu thất bại!");
        }
      } catch {
        alert("Có lỗi xảy ra!");
      }
    }
  };

  return (
    <div id="users-screen" className="screen">
      <h2 className="screen-title">Quản Lý Người Dùng</h2>
      <Card>
        <h3>Danh Sách Người Dùng</h3>
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
                        <input
                          name="email"
                          value={editForm.email}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td>
                        <input
                          name="status"
                          value={editForm.status}
                          onChange={handleEditChange}
                        />
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
    </div>
  );
};

export default UserManagement;
