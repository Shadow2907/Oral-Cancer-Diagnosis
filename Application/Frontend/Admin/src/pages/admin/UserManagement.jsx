import React from 'react';
import Card from '../../components/Card';

const UserManagement = () => {
  const usersData = [
    { id: '001', username: 'Nguyen Van A', email: 'nguyenvana@example.com', gender: 'Nam' },
    { id: '002', username: 'Tran Thi B', email: 'tranthib@example.com', gender: 'Nữ' },
  ];

  const handleEditUser = (id) => {
    alert(`Mở form chỉnh sửa người dùng ${id}`);
    // Implement form logic
  };

  const handleDeleteUser = (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa người dùng ${id}?`)) {
      alert(`Đã xóa người dùng ${id}`);
      // Add API call to delete user
    }
  };

  const handleResetPassword = (id) => {
    if (window.confirm(`Bạn có chắc muốn đặt lại mật khẩu cho người dùng ${id}?`)) {
      alert(`Đã đặt lại mật khẩu cho người dùng ${id}`);
      // Add API call to reset password
    }
  };

  return (
    <div id="users-screen" className="screen">
      <h2 className="screen-title">Quản Lý Người Dùng</h2>
      <Card>
        <h3>Danh Sách Người Dùng</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Người Dùng</th>
                <th>Email</th>
                <th>Giới Tính</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {usersData.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.gender}</td>
                  <td className="action-buttons">
                    <button
                      className="action-button edit-button"
                      onClick={() => handleEditUser(user.id)}
                    >
                      <i className="bi bi-pencil"></i> Sửa
                    </button>
                    <button
                      className="action-button delete-button"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <i className="bi bi-trash"></i> Xóa
                    </button>
                    <button
                      className="action-button reset-button"
                      onClick={() => handleResetPassword(user.id)}
                    >
                      <i className="bi bi-key"></i> Đặt Lại Mật Khẩu
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

export default UserManagement;