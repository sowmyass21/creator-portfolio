import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col selection:bg-brand-purple/30 selection:text-brand-purple">
      <Navbar />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
