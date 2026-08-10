import VendorRegisterForm from '../../components/Auth/VendorRegisterForm';

export default function VendorRegisterPage() {
  return (
    <div className="auth-container">
      {/* Card */}
      <VendorRegisterForm />

      {/* Footer - OUTSIDE the card */}
      <div className="register-footer">
        <p className="brand">ZayLink</p>
        <p className="copyright">© 2024 ZayLink. All rights reserved.</p>
        <div>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </div>
  );
}