import React from 'react';
import Card from './Card'; // Assuming Card is a styled container

// Example: Pass props like date and result
const HistoryItem = ({ date, result }) => {
    // Determine result style based on content if needed
    const resultStyle = result?.toLowerCase().includes('nghi ngờ') ? { color: 'red' } : {};

    return (
        // Using Card component or directly the .history-item class
        <Card className="history-item">
             <div><p>Ngày: {date}</p></div>
             <div><p style={resultStyle}>Kết Quả: {result}</p></div>
        </Card>
    );
};

export default HistoryItem;