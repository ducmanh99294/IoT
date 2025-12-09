import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/footer.css';

interface FooterProps {
  isAuthPage?: boolean;
}

const Footer: React.FC<FooterProps> = ({ isAuthPage = false }) => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Xử lý hiển thị nút back to top
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Xử lý đăng ký newsletter
    console.log('Newsletter email:', newsletterEmail);
    setNewsletterEmail('');
    alert('Cảm ơn bạn đã đăng ký nhận tin!');
  };

  const footerLinks = {
    quickLinks: [
      { path: '/', label: 'Trang chủ', icon: '🏠' },
      { path: '/devices', label: 'Thiết bị', icon: '💡' },
      { path: '/schedules', label: 'Lịch hẹn giờ', icon: '⏰' },
      { path: '/security', label: 'An ninh', icon: '🔒' },
      { path: '/statistics', label: 'Thống kê', icon: '📊' },
    ],
    support: [
      { path: '/help', label: 'Nguyen Duc Manh', icon: '👥' },
      { path: '/faq', label: 'Nguyen Dinh Canh', icon: '👥' },
      { path: '/contact', label: 'Huynh Huu Nghia', icon: '👥' },
    ],
    legal: [
      { path: '/privacy', label: 'Chính sách bảo mật' },
      { path: '/terms', label: 'Điều khoản dịch vụ' },
      { path: '/cookies', label: 'Cookie Policy' },
    ]
  };

  const contactInfo = [
    { icon: '📍', text: '44 Xo Viet Nghe Tinh' },
    { icon: '📞', text: '(+84) 123 456 789' },
    { icon: '✉️', text: 'nguyenducmanh1809@gmail.com' },
    { icon: '🕒', text: 'Thứ 2 - Thứ 6: 8:00 - 17:00' },
  ];

  const socialLinks = [
    { platform: 'Facebook', icon: 'f', url: 'https://facebook.com' },
    { platform: 'Instagram', icon: '📷', url: 'https://instagram.com' },
    { platform: 'Youtube', icon: 'Y', url: 'https://youtube.com' },
    { platform: 'LinkedIn', icon: 'in', url: 'https://linkedin.com' },
  ];

  if (isAuthPage) {
    return (
      <footer className="footer auth-footer">
        <div className="footer-container">
          <div className="footer-bottom">
            <p className="copyright">
              © 2024 Smart Home Management. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            {/* Logo và mô tả */}
            <div className="footer-section">
              <Link to="/" className="footer-logo">
                <div className="footer-logo-icon">🏠</div>
                <div className="footer-logo-text">
                  <span className="footer-logo-title">Smart Home</span>
                  <span className="footer-logo-subtitle">Quản lý thông minh</span>
                </div>
              </Link>
              <p className="footer-description">
                Hệ thống quản lý nhà thông minh giúp bạn điều khiển và giám sát 
                ngôi nhà của mình một cách dễ dàng và an toàn từ mọi nơi.
              </p>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3 className="footer-heading">Liên kết nhanh</h3>
              <ul className="footer-links">
                {footerLinks.quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="footer-link">
                      <span className="footer-icon">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="footer-section">
              <h3 className="footer-heading">Hỗ trợ</h3>
              <ul className="footer-links">
                {footerLinks.support.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="footer-link">
                      <span className="footer-icon">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact và Social */}
            <div className="footer-section">
              <h3 className="footer-heading">Liên hệ</h3>
              <div className="contact-info">
                {contactInfo.map((item, index) => (
                  <div key={index} className="contact-item">
                    <span className="contact-icon">{item.icon}</span>
                    <span className="contact-text">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="social-media">
                <h4 className="social-heading">Theo dõi chúng tôi</h4>
                <p className="social-description">
                  Cập nhật tin tức và tính năng mới nhất
                </p>
                <div className="social-links">
                  {socialLinks.map((social) => (
                    <a
                      key={social.platform}
                      href={social.url}
                      className="social-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.platform}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="newsletter">
                <h4 className="social-heading">Nhận tin mới nhất</h4>
                <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    className="newsletter-input"
                    placeholder="Nhập email của bạn"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="newsletter-button">
                    Đăng ký
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <p className="copyright">
              © 2024 Smart Home Management. Tất cả quyền được bảo lưu.
            </p>
            <div className="footer-legal">
              {footerLinks.legal.map((link) => (
                <Link key={link.path} to={link.path} className="legal-link">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Lên đầu trang"
      >
        ↑
      </button>
    </>
  );
};

export default Footer;