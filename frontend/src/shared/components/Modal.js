import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, role }) => {
  return (
    <div className="layout">
      <Header />
      <div className="main-content">
        <Sidebar role={role} />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;