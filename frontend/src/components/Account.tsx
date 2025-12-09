import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/account.css';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<any>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  
  // Profile state
  const [profile, setProfile] = useState<any>({
    firstName: 'Nguyễn Văn',
    lastName: 'A',
    email: 'nguyenvana@example.com',
    phone: '0987654321',
    address: '123 Đường ABC',
    city: 'Hồ Chí Minh',
    country: 'Việt Nam',
    avatar: '',
    role: 'Chủ nhà',
    joinedDate: '15/01/2023'
  });

  // Security state
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false
  });

  // Devices state
  const [devices, setDevices] = useState<any[]>([
    { id: 1, name: 'iPhone 13 Pro', type: 'Điện thoại', lastSeen: '2 phút trước', status: 'online', location: 'Hồ Chí Minh' },
    { id: 2, name: 'MacBook Pro', type: 'Máy tính', lastSeen: '5 giờ trước', status: 'online', location: 'Hồ Chí Minh' },
    { id: 3, name: 'iPad Air', type: 'Máy tính bảng', lastSeen: '2 ngày trước', status: 'offline', location: 'Hà Nội' },
    { id: 4, name: 'Google Pixel', type: 'Điện thoại', lastSeen: '1 tuần trước', status: 'offline', location: 'Unknown' },
  ]);

  // Sessions state
  const [sessions, setSessions] = useState<any[]>([
    { id: 1, device: 'iPhone 13 Pro', browser: 'Safari', ip: '192.168.1.100', location: 'Hồ Chí Minh', lastActive: '2 phút trước', current: true },
    { id: 2, device: 'MacBook Pro', browser: 'Chrome', ip: '192.168.1.101', location: 'Hồ Chí Minh', lastActive: '5 giờ trước', current: false },
    { id: 3, device: 'Windows PC', browser: 'Firefox', ip: '203.0.113.25', location: 'Hà Nội', lastActive: '2 ngày trước', current: false },
  ]);

  // Modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize from localStorage or API
  useEffect(() => {
    // TODO: Fetch user data from API
    // const fetchUserData = async () => {
    //   try {
    //     const response = await fetch('/api/user/profile');
    //     const data = await response.json();
    //     setProfile(data);
    //   } catch (error) {
    //     console.error('Error fetching user data:', error);
    //   }
    // };
    // fetchUserData();
  }, []);

  const menuItems = [
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: '👤' },
    { id: 'security', label: 'Bảo mật & Đăng nhập', icon: '🔒' },
    { id: 'devices', label: 'Thiết bị đã kết nối', icon: '📱' },
    { id: 'notifications', label: 'Thông báo', icon: '🔔' },
    { id: 'billing', label: 'Thanh toán', icon: '💳' },
  ];

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSecurityToggle = (setting: keyof typeof security) => {
    setSecurity(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};

    if (!profile.firstName.trim()) {
      newErrors.firstName = 'Vui lòng nhập họ';
    }

    if (!profile.lastName.trim()) {
      newErrors.lastName = 'Vui lòng nhập tên';
    }

    if (!profile.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!profile.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      setAlert({ type: 'error', message: 'Vui lòng kiểm tra lại thông tin' });
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Call API to update profile
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(profile)
      // });
      
      // if (!response.ok) {
      //   throw new Error('Cập nhật thất bại');
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAlert({ type: 'success', message: 'Cập nhật hồ sơ thành công!' });
      
      // Clear alert after 3 seconds
      setTimeout(() => setAlert(null), 3000);
      
    } catch (error) {
      setAlert({ type: 'error', message: 'Đã xảy ra lỗi khi cập nhật' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const passwordErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      passwordErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!passwordData.newPassword) {
      passwordErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordData.newPassword.length < 8) {
      passwordErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (!passwordData.confirmPassword) {
      passwordErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      passwordErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    if (Object.keys(passwordErrors).length > 0) {
      setErrors(passwordErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Call API to change password
      // const response = await fetch('/api/user/change-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     currentPassword: passwordData.currentPassword,
      //     newPassword: passwordData.newPassword
      //   })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAlert({ type: 'success', message: 'Đổi mật khẩu thành công!' });
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => setAlert(null), 3000);
      
    } catch (error) {
      setAlert({ type: 'error', message: 'Đổi mật khẩu thất bại. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDevice = (deviceId: number) => {
    setDevices(prev => prev.filter(device => device.id !== deviceId));
    setAlert({ type: 'success', message: 'Đã xóa thiết bị' });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleTerminateSession = (sessionId: number) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    setAlert({ type: 'success', message: 'Đã kết thúc phiên đăng nhập' });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setAlert({ type: 'error', message: 'File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.' });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setAlert({ type: 'error', message: 'Vui lòng chọn file hình ảnh.' });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setProfile((prev:any) => ({ ...prev, avatar: result }));
          setAlert({ type: 'success', message: 'Cập nhật ảnh đại diện thành công!' });
          setTimeout(() => setAlert(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = () => {
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  };

  const renderProfileTab = () => (
    <div className="account-form">
      {alert && (
        <div className={`alert-message alert-${alert.type}`}>
          <span>{alert.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{alert.message}</span>
        </div>
      )}
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="firstName" className="required">Họ</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className={`form-input ${errors.firstName ? 'error' : ''}`}
            value={profile.firstName}
            onChange={handleProfileChange}
            disabled={isLoading}
            style={{ backgroundColor: 'var(--background)' }} 
          />
          {errors.firstName && <div className="error-text">⚠️ {errors.firstName}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="required">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            value={profile.email}
            onChange={handleProfileChange}
            disabled={isLoading}
            style={{ backgroundColor: 'var(--background)' }} 
          />
          {errors.email && <div className="error-text">⚠️ {errors.email}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="phone" className="required">Số điện thoại</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className={`form-input ${errors.phone ? 'error' : ''}`}
            value={profile.phone}
            onChange={handleProfileChange}
            disabled={isLoading}
            style={{ backgroundColor: 'var(--background)' }} 
          />
          {errors.phone && <div className="error-text">⚠️ {errors.phone}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="address">Địa chỉ</label>
          <input
            type="text"
            id="address"
            name="address"
            className="form-input"
            value={profile.address}
            onChange={handleProfileChange}
            disabled={isLoading}
            style={{ backgroundColor: 'var(--background)' }} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">Thành phố</label>
          <input
            type="text"
            id="city"
            name="city"
            className="form-input"
            value={profile.city}
            onChange={handleProfileChange}
            disabled={isLoading}
            style={{ backgroundColor: 'var(--background)' }} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="country">Quốc gia</label>
          <div className="select-wrapper">
            <select
              id="country"
              name="country"
              className="form-input"
              value={profile.country}
              onChange={handleProfileChange}
              disabled={isLoading}
            >
              <option value="Việt Nam">Việt Nam</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          className="btn btn-primary"
          onClick={handleSaveProfile}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Đang lưu...
            </>
          ) : (
            'Lưu thay đổi'
          )}
        </button>
        <button
          className="btn btn-outline"
          onClick={() => navigate('/')}
          disabled={isLoading}
        >
          Hủy
        </button>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="security-grid">
      {alert && (
        <div className={`alert-message alert-${alert.type}`}>
          <span>{alert.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{alert.message}</span>
        </div>
      )}
      
      <div className="security-card">
        <div className="security-header">
          <h3>Xác thực hai yếu tố (2FA)</h3>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={security.twoFactorEnabled}
              onChange={() => handleSecurityToggle('twoFactorEnabled')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <p className="security-description">
          Thêm một lớp bảo mật bổ sung cho tài khoản của bạn bằng cách yêu cầu mã xác thực từ điện thoại khi đăng nhập.
        </p>
        {!security.twoFactorEnabled && (
          <div className="security-actions">
            <button className="btn btn-primary" onClick={() => handleSecurityToggle('twoFactorEnabled')}>
              Bật 2FA
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/security-guide')}>
              Tìm hiểu thêm
            </button>
          </div>
        )}
      </div>

      <div className="security-card">
        <div className="security-header">
          <h3>Đổi mật khẩu</h3>
          <span className="security-status inactive">Cần cập nhật</span>
        </div>
        <p className="security-description">
          Thay đổi mật khẩu định kỳ để đảm bảo tài khoản của bạn được bảo vệ tốt nhất.
        </p>
        <div className="security-actions">
          <button className="btn btn-primary" onClick={() => setShowPasswordModal(true)}>
            Đổi mật khẩu
          </button>
        </div>
      </div>

      <div className="security-card">
        <div className="security-header">
          <h3>Phiên đăng nhập hiện tại</h3>
        </div>
        <div className="sessions-list">
          {sessions.map(session => (
            <div key={session.id} className={`session-item ${session.current ? 'session-current' : ''}`}>
              <div className="session-info">
                <div className="session-icon">📱</div>
                <div className="session-details">
                  <div className="session-device">{session.device}</div>
                  <div className="session-meta">
                    <span>{session.browser}</span>
                    <span>•</span>
                    <span>{session.location}</span>
                    <span>•</span>
                    <span>{session.lastActive}</span>
                  </div>
                </div>
              </div>
              {!session.current && (
                <button
                  className="btn btn-outline"
                  onClick={() => handleTerminateSession(session.id)}
                >
                  Kết thúc
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDevicesTab = () => (
    <div className="devices-grid">
      {devices.map(device => (
        <div key={device.id} className="device-item">
          <div className="device-header">
            <div className="device-icon">
              {device.type === 'Điện thoại' ? '📱' : device.type === 'Máy tính' ? '💻' : '📱'}
            </div>
            <div>
              <div className="device-name">{device.name}</div>
              <div className="device-type">{device.type}</div>
            </div>
          </div>
          <div className="device-status">
            <div>Trạng thái: <strong style={{ color: device.status === 'online' ? 'var(--success)' : 'var(--alert)' }}>
              {device.status === 'online' ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </strong></div>
            <div>Lần cuối: {device.lastSeen}</div>
            <div>Vị trí: {device.location}</div>
          </div>
          <div className="device-actions">
            <button
              className="btn btn-outline"
              onClick={() => handleRemoveDevice(device.id)}
            >
              Xóa thiết bị
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="notification-settings">
      <div className="notification-category">
        <div className="category-header">
          <span className="category-icon">💡</span>
          <h3>Thông báo thiết bị</h3>
        </div>
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-name">Thông báo đèn</div>
              <div className="setting-description">Nhận thông báo khi đèn được bật/tắt</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={security.pushNotifications}
                onChange={() => handleSecurityToggle('pushNotifications')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-name">Cảnh báo an ninh</div>
              <div className="setting-description">Thông báo khi phát hiện chuyển động hoặc xâm nhập</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={security.smsAlerts}
                onChange={() => handleSecurityToggle('smsAlerts')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="notification-category">
        <div className="category-header">
          <span className="category-icon">📧</span>
          <h3>Thông báo email</h3>
        </div>
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-name">Báo cáo hàng tuần</div>
              <div className="setting-description">Nhận báo cáo tổng quan về hoạt động nhà thông minh</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={security.emailNotifications}
                onChange={() => handleSecurityToggle('emailNotifications')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-name">Cập nhật hệ thống</div>
              <div className="setting-description">Thông báo về cập nhật phần mềm và bảo trì</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={security.emailNotifications}
                onChange={() => handleSecurityToggle('emailNotifications')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBillingTab = () => (
    <div className="account-form">
      <div className="alert-message alert-warning">
        <span>ℹ️</span>
        <span>Chức năng thanh toán đang được phát triển. Tính năng này sẽ sớm có mặt!</span>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label>Gói dịch vụ hiện tại</label>
          <input
            type="text"
            className="form-input"
            value="Gói Cơ Bản"
            disabled
          />
        </div>
        
        <div className="form-group">
          <label>Ngày hết hạn</label>
          <input
            type="text"
            className="form-input"
            value="31/12/2024"
            disabled
          />
        </div>
        
        <div className="form-group">
          <label>Phương thức thanh toán</label>
          <input
            type="text"
            className="form-input"
            value="Thẻ Visa ****1234"
            disabled
          />
        </div>
      </div>
      
      <div className="form-actions">
        <button className="btn btn-primary" disabled>
          Nâng cấp gói
        </button>
        <button className="btn btn-outline" disabled>
          Quản lý thanh toán
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'security':
        return renderSecurityTab();
      case 'devices':
        return renderDevicesTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'billing':
        return renderBillingTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>👤 Tài khoản & Cài đặt</h1>
        <p>Quản lý thông tin cá nhân và cài đặt tài khoản của bạn</p>
      </div>

      <div className="account-layout">
        {/* Sidebar */}
        <div className="account-sidebar">
          <div className="profile-card">
            <div 
              className="profile-avatar"
              onClick={() => setShowAvatarModal(true)}
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile" />
              ) : (
                <span>{getInitials()}</span>
              )}
              <div className="avatar-upload">Đổi ảnh</div>
            </div>
            <div className="profile-name">{profile.firstName} {profile.lastName}</div>
            <div className="profile-email">{profile.email}</div>
            <div className="profile-role">{profile.role}</div>
            <div className="profile-joined" style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Tham gia từ {profile.joinedDate}
            </div>
          </div>

          <nav className="sidebar-menu">
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id as any)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="account-content">
          <div className="content-header">
            <div>
              <h2>{menuItems.find(item => item.id === activeTab)?.label}</h2>
              <p>Quản lý cài đặt {menuItems.find(item => item.id === activeTab)?.label.toLowerCase()}</p>
            </div>
          </div>

          {renderContent()}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Đổi mật khẩu</h2>
              <button className="close-modal" onClick={() => setShowPasswordModal(false)}>
                ×
              </button>
            </div>
            
            <div className="form-group">
              <label htmlFor="currentPassword" className="required">Mật khẩu hiện tại</label>
              <input
                type="password"
                id="currentPassword"
                className={`form-input ${errors.currentPassword ? 'error' : ''}`}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                disabled={isLoading}
              />
              {errors.currentPassword && <div className="error-text">⚠️ {errors.currentPassword}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword" className="required">Mật khẩu mới</label>
              <input
                type="password"
                id="newPassword"
                className={`form-input ${errors.newPassword ? 'error' : ''}`}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                disabled={isLoading}
              />
              {errors.newPassword && <div className="error-text">⚠️ {errors.newPassword}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword" className="required">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                disabled={isLoading}
              />
              {errors.confirmPassword && <div className="error-text">⚠️ {errors.confirmPassword}</div>}
            </div>
            
            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={handleChangePassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Đang xử lý...
                  </>
                ) : (
                  'Đổi mật khẩu'
                )}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setShowPasswordModal(false)}
                disabled={isLoading}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Đổi ảnh đại diện</h2>
              <button className="close-modal" onClick={() => setShowAvatarModal(false)}>
                ×
              </button>
            </div>
            
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="profile-avatar" style={{ margin: '0 auto 20px' }}>
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" />
                ) : (
                  <span>{getInitials()}</span>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Tải lên ảnh đại diện mới. Hỗ trợ JPG, PNG, GIF (tối đa 5MB)
              </p>
            </div>
            
            <input
              type="file"
              id="avatarUpload"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
            
            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={() => document.getElementById('avatarUpload')?.click()}
              >
                Chọn ảnh
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setShowAvatarModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;