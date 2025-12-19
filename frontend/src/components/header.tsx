import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../assets/header.css';


const Header: React.FC<any> = ({ isAuthPage = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, type: 'alert', message: 'Có người đi qua cửa trước', time: '14:30', icon: '🚨', read: false },
    { id: 2, type: 'normal', message: 'Đèn phòng ngủ đã bật theo lịch', time: '06:30', icon: '✅', read: true },
    { id: 3, type: 'normal', message: 'Camera cửa sau đã tắt', time: '09:15', icon: '📹', read: true },
    { id: 4, type: 'alert', message: 'Phát hiện chuyển động ở hành lang', time: '23:45', icon: '🚨', read: false },
    { id: 5, type: 'info', message: 'Tất cả thiết bị đã kiểm tra', time: '00:00', icon: '🔧', read: true },
    { id: 6, type: 'alert', message: 'Cửa sổ phòng khách mở', time: '08:20', icon: '🪟', read: false },
    { id: 7, type: 'normal', message: 'Hẹn giờ đèn đã được kích hoạt', time: '18:00', icon: '⏰', read: true },
  ]);
  
  // Mock user data
  const user = {
    name: 'Nguyễn Văn A',
    role: 'Chủ nhà',
    avatarInitials: 'NA'
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const navItems = [
    { path: '/', label: 'Trang chủ', icon: '🏠' },
    { path: '/devices', label: 'Thiết bị', icon: '💡' },
    { path: '/schedules', label: 'Lịch hẹn', icon: '⏰' },
    { path: '/notifications', label: 'Thông báo', icon: '🔔' },
    { path: '/account', label: 'Tài khoản', icon: '👤' },
  ];

  const dropdownItems = [
    { path: '/profile', label: 'Hồ sơ cá nhân', icon: '👤' },
    { path: '/security', label: 'Bảo mật', icon: '🔒' },
    { path: '/help', label: 'Trợ giúp', icon: '❓' },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (isNotificationOpen) setIsNotificationOpen(false);
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (isDropdownOpen) setIsDropdownOpen(false);
    
    // Mark all notifications as read when opening
    if (!isNotificationOpen) {
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
    setIsNotificationOpen(false);
  };

  const handleNotificationClick = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    
    // TODO: Xử lý khi click vào thông báo
    console.log('Notification clicked:', id);
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-btn') && !target.closest('.notification-dropdown')) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isNotificationOpen]);

  if (isAuthPage) {
    return (
      <header className="header auth-header">
        <div className="header-container">
          <div className="header-content">
            <Link to="/" className="logo">
              <div className="logo-icon">🏠</div>
              <div className="logo-text">
                <span className="logo-title">Smart Home</span>
                <span className="logo-subtitle">Quản lý thông minh</span>
              </div>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon">🏠</div>
            <div className="logo-text">
              <span className="logo-title">Smart Home</span>
              <span className="logo-subtitle">Quản lý thông minh</span>
            </div>
          </Link>

          {/* Mobile Menu Toggle */}
          <button className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? '✕' : '☰'}
          </button>

          {/* Navigation Menu */}
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            {/* Navigation Links */}
            <nav className="nav-links">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="user-menu">
              {/* Notification Button with Dropdown */}
              <div className="notification-wrapper">
                <button 
                  className="notification-btn" 
                  onClick={toggleNotification}
                  aria-label="Thông báo"
                >
                  <span>🔔</span>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h3>Thông báo</h3>
                      <div className="notification-actions">
                        <button 
                          className="notification-action-btn"
                          onClick={handleMarkAllAsRead}
                        >
                          Đánh dấu đã đọc
                        </button>
                        <button 
                          className="notification-action-btn"
                          onClick={handleClearAll}
                        >
                          Xóa tất cả
                        </button>
                      </div>
                    </div>
                    
                    <div className="notification-list">
                      {notifications.length === 0 ? (
                        <div className="notification-empty">
                          <div className="empty-icon">📭</div>
                          <p>Không có thông báo mới</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`notification-item ${notification.type} ${!notification.read ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(notification.id)}
                          >
                            <div className="notification-icon">{notification.icon}</div>
                            <div className="notification-content">
                              <div className="notification-message">{notification.message}</div>
                              <div className="notification-time">{notification.time}</div>
                            </div>
                            {!notification.read && <div className="notification-dot"></div>}
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="notification-footer">
                      <Link to="/notifications" onClick={() => setIsNotificationOpen(false)}>
                        Xem tất cả thông báo
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className={`dropdown ${isDropdownOpen ? 'active' : ''}`}>
                <div className="user-profile" onClick={toggleDropdown}>
                  <div className="user-avatar">
                    {user.avatarInitials}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-role">{user.role}</span>
                  </div>
                </div>

                <div className="dropdown-menu">
                  {dropdownItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="dropdown-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      <span className="dropdown-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <span className="dropdown-icon">🚪</span>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;