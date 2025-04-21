import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import HistoryItem from '../components/HistoryItem';
import AuthHeader from '../components/AuthHeader';
import Card from '../components/Card'; // Use Card for the login prompt

const History = () => {
    const { isLoggedIn } = useAuth();

    // Mock data - replace with actual data fetching later
    const historyData = [
        { id: 1, date: "05/03/2025", result: "Không Ung Thư" },
        { id: 2, date: "01/03/2025", result: "Nghi Ngờ Ung Thư" },
    ];

    return (
        <div id="history-screen" className="screen">
             <div className="header" id="history-header">
                <h2 className="screen-title">Lịch Sử</h2>
                 <AuthHeader />
            </div>

            <div id="history-content"> {/* Keep this div for potential styling */}
                {isLoggedIn ? (
                     // Use history-grid for desktop layout via CSS
                    <div className="history-grid">
                        {historyData.length > 0 ? (
                            historyData.map(item => (
                                <HistoryItem key={item.id} date={item.date} result={item.result} />
                            ))
                        ) : (
                            <Card><p>Chưa có lịch sử chẩn đoán.</p></Card>
                        )}
                    </div>
                ) : (
                     // Use Card for consistent prompt styling
                     <Card className="login-prompt">
                        <p>Vui lòng đăng nhập để xem lịch sử</p>
                     </Card>
                )}
            </div>
        </div>
    );
};

export default History;