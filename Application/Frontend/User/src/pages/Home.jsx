import React from 'react';
import Card from '../components/Card';
import AuthHeader from '../components/AuthHeader';

const Home = () => {
    return (
        <div id="home-screen" className="screen">
            <div className="header" id="home-header">
                <h2 className="screen-title">Trang Chủ</h2>
                <AuthHeader /> {/* Use AuthHeader component */}
            </div>
            <Card>
                <p>
                    Ứng dụng hỗ trợ chẩn đoán ung thư vòm họng sử dụng trí tuệ nhân tạo.
                    Chúng tôi cung cấp giải pháp nhanh chóng và chính xác để phân tích
                    hình ảnh y tế và đưa ra cảnh báo sớm.
                </p>
            </Card>
            {/* Add more content if needed */}
        </div>
    );
};

export default Home;