import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiLogOut, FiLayout } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard" className="logo">
          <FiLayout className="logo-icon" />
          <span>ProjectSync</span>
        </Link>
      </div>

      <div className="navbar-menu">
        {user ? (
          <div className="user-profile">
            <span className="username">{user.username}</span>
            <button onClick={handleLogout} className="btn btn-outline" title="Logout">
              <FiLogOut /> Logout
            </button>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="btn btn-text">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
