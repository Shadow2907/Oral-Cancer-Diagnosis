import React, { useState, useRef, useEffect } from 'react';

const Chatbox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Xin chào! Tôi là bot tư vấn. Bạn khỏe không?' },
        { type: 'bot', text: 'Bạn có thể tải ảnh lên để chẩn đoán ung thư vòm họng.' },
    ]);
    const [inputValue, setInputValue] = useState('');
    const chatboxBodyRef = useRef(null);

    useEffect(() => {
        // Scroll to bottom when messages change
        if (chatboxBodyRef.current) {
            chatboxBodyRef.current.scrollTop = chatboxBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = () => {
        const text = inputValue.trim();
        if (text) {
            setMessages(prev => [...prev, { type: 'user', text }]);
            setInputValue('');

            // Simulate bot response
            setTimeout(() => {
                setMessages(prev => [...prev, { type: 'bot', text: 'Cảm ơn bạn! Bạn cần giúp gì thêm không?' }]);
            }, 1000);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <>
            {!isOpen && (
                <div className="chat-icon" id="chat-icon" onClick={toggleChat}>
                    <i className="bi bi-chat-dots"></i>
                </div>
            )}

            {isOpen && (
                <div className="chatbox" id="chatbox">
                    <div className="chatbox-header">
                        <span>Tư Vấn Tự Động</span>
                        <i className="bi bi-x chatbox-close" onClick={toggleChat}></i>
                    </div>
                    <div className="chatbox-body" id="chatbox-body" ref={chatboxBodyRef}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.type}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="chatbox-footer">
                        <input
                            type="text"
                            className="chatbox-input"
                            id="chatbox-input"
                            placeholder="Nhập tin nhắn..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button className="chatbox-send" id="chatbox-send" onClick={handleSend}>Gửi</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbox;