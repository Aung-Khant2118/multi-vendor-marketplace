import VendorRegisterForm from '../../components/Auth/VendorRegisterForm';

export default function VendorRegisterPage() {
  return (
    <div className="auth-container">
      {/* Card */}
      <VendorRegisterForm />

      {/* Footer - OUTSIDE the card */}
      <div className="auth-footer">
        <p className="brand">ZayLink</p>
        <p className="copyright">© 2026 ZayLink. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </div>
  );
}