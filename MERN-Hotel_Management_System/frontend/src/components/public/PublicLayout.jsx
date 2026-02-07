import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const PublicLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-white dark:bg-navy-900 flex flex-col transition-colors duration-500">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
