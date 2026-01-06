import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../assets/register.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const api = "https://iot-1-4t8m.onrender.com"

  // const api = 'http://localhost:3000'
  // Tính độ mạnh của mật khẩu
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    
    // Kiểm tra độ dài
    if (formData.password.length >= 8) strength += 1;
    
    // Kiểm tra chữ hoa
    if (/[A-Z]/.test(formData.password)) strength += 1;
    
    // Kiểm tra chữ thường
    if (/[a-z]/.test(formData.password)) strength += 1;
    
    // Kiểm tra số
    if (/\d/.test(formData.password)) strength += 1;
    
    // Kiểm tra ký tự đặc biệt
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return { text: 'Yếu', className: 'weak' };
    if (passwordStrength <= 3) return { text: 'Trung bình', className: 'medium' };
    return { text: 'Mạnh', className: 'strong' };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'Vui lòng chấp nhận điều khoản';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setError('');
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate step 1
      const stepErrors: Record<string, string> = {};
      if (!formData.name.trim()) stepErrors.name = 'Vui lòng nhập tên';
      if (!formData.email.trim()) stepErrors.email = 'Vui lòng nhập email';
      
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
      
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Vui lòng kiểm tra lại thông tin');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${api}/api/users/register`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      }
    )

      if(!res.ok) {
        alert("có lỗi")
        return;
      }
      
      setSuccess('Đăng ký thành công! Đang chuyển hướng...');
      
      // Tự động chuyển hướng sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  const strengthInfo = getPasswordStrengthText();

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>📝 Đăng Ký Tài Khoản</h1>
          <p>Tạo tài khoản để quản lý ngôi nhà thông minh của bạn</p>
        </div>

        {/* Registration Steps */}
        <div className="registration-steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="step-circle">1</div>
            <div className="step-label">Thông tin cá nhân</div>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-circle">2</div>
            <div className="step-label">Thông tin đăng nhập</div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-message">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <>
                <div className="form-group">
                  <label htmlFor="name" className="required">Họ</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Nguyễn Văn"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <div className="error-text">
                      <span>⚠️</span>
                      <span>{errors.name}</span>
                    </div>
                  )}
                </div>

              <div className="form-group">
                <label htmlFor="email" className="required">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="nhap@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                {errors.email && (
                  <div className="error-text">
                    <span>⚠️</span>
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="required">Số điện thoại</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="0987654321"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <div className="error-text">
                    <span>⚠️</span>
                    <span>{errors.phone}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="register-button"
                onClick={handleNextStep}
                disabled={isLoading}
              >
                Tiếp theo →
              </button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="form-group">
                <label htmlFor="password" className="required">Mật khẩu</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ?  "ẩn" : "hiện" }
                  </button>
                </div>
                
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-meter">
                      <div className={`strength-meter-fill ${strengthInfo.className}`}></div>
                    </div>
                    <div className="strength-text">
                      Độ mạnh mật khẩu: <strong>{strengthInfo.text}</strong>
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <div className="error-text">
                    <span>⚠️</span>
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="required">Xác nhận mật khẩu</label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "hiện" : "ẩn"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="error-text">
                    <span>⚠️</span>
                    <span>{errors.confirmPassword}</span>
                  </div>
                )}
              </div>

              <div className="terms">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="termsAccepted">
                  Tôi đồng ý với <Link to="/terms">Điều khoản dịch vụ</Link> và <Link to="/privacy">Chính sách bảo mật</Link>
                </label>
              </div>
              {errors.termsAccepted && (
                <div className="error-text">
                  <span>⚠️</span>
                  <span>{errors.termsAccepted}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="register-button"
                  onClick={handlePrevStep}
                  disabled={isLoading}
                  style={{ backgroundColor: 'var(--text-secondary)' }}
                >
                  ← Quay lại
                </button>
                <button
                  type="submit"
                  className="register-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Đang đăng ký...
                    </>
                  ) : (
                    'Đăng Ký'
                  )}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="register-links">
          <p className="login-link">
            Đã có tài khoản?
            <Link to="/login">Đăng nhập ngay</Link>
          </p>
          <Link to="/" className="back-home">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;