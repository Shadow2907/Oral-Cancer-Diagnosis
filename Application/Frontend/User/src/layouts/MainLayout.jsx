
import React from 'react';
import Sidebar from '../components/Sidebar';
import Chatbox from '../components/Chatbox';

const MainLayout = ({ children }) => {
  return (
    <div className="app-container"> {/* Container chính cho layout có sidebar */}
      <Sidebar />
      <div className="content-area"> {/* Khu vực nội dung chính */}
        {children}
      </div>
      {/* <Chatbox /> */}
    </div>
  );
};

export default MainLayout;