import React from 'react';
import UploadSection from '../components/UploadSection';
import AuthHeader from '../components/AuthHeader';

const Upload = () => {
    return (
        <div id="upload-screen" className="screen">
             <div className="header" id="upload-header">
                <h2 className="screen-title">Tải Ảnh</h2>
                <AuthHeader />
            </div>
            <UploadSection />
        </div>
    );
};

export default Upload;