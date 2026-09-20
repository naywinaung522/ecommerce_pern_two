import React from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import '../../styles/App.css';

const Layout = ({ children }) => {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;