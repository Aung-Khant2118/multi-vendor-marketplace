import LoginForm from '../../components/Auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="auth-container">
      {/* Card */}
      <LoginForm />

      {/* Footer - OUTSIDE the card */}
      <div className="login-footer">
        <p>© 2026 ZayLink Multi-Vendor E-commerce. All rights reserved.</p>
        <div>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
          <a href="#">Sustainability</a>
        </div>
      </div>
    </div>
  );
}