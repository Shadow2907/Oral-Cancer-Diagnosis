# Oral Cancer Diagnosis

Oral Cancer Diagnosis là một dự án sử dụng trí tuệ nhân tạo và học máy để hỗ trợ chẩn đoán ung thư miệng thông qua phân tích hình ảnh. Dự án bao gồm một hệ thống backend API, giao diện web cho người dùng và admin, cùng với các mô hình AI được huấn luyện.

## Tính năng chính

- **Chẩn đoán AI**: Sử dụng các mô hình deep learning (DenseNet121, ResNet50, VGG19) để phân tích hình ảnh
- **Phân đoạn hình ảnh**: Tạo bản đồ nhiệt để xác định vùng nghi ngờ ung thư
- **Quản lý người dùng**: Hệ thống đăng nhập và phân quyền user/admin
- **Lưu trữ lịch sử**: Theo dõi và quản lý các lần chẩn đoán
- **Giao diện trực quan**: Frontend thân thiện cho cả người dùng và admin

## Yêu cầu hệ thống

### Backend
- Python 3.12+
- FastAPI
- SQLAlchemy
- PostgreSQL

### Frontend
- Node.js
- React.js
- Vite

## Cài đặt

1. Clone repository:
```bash
git clone https://github.com/Shadow2907/Oral-Cancer-Diagnosis.git
cd Oral-Cancer-Diagnosis
```

2. Cài đặt dependencies cho Backend:
```bash
cd Application/Backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
# hoặc
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

3. Cài đặt dependencies cho Frontend:
```bash
cd Application/Frontend
npm install
```


4. Cấu hình môi trường:
- Tạo file `.env` trong thư mục Backend và cấu hình các biến môi trường cần thiết:
```env
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=
MAIL_PORT=
MAIL_SERVER=
MAIL_STARTTLS=
MAIL_SSL_TLS=

DB_URL=

SECRET_KEY=

pg_user=
pg_password=
pg_db=

REDIS_HOST=
REDIS_PORT=
REDIS_DB=
REDIS_PASSWORD=
REDIS_URL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Sử dụng

### Chạy Backend:
```bash
cd Application/Backend
docker-compose up --build
```

### Chạy Frontend:
```bash
cd Application/Frontend
docker-compose up --build
```
