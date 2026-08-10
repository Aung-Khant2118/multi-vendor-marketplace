import RegisterForm from '../../components/Auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="auth-container">
      <RegisterForm />
      
      {/* Footer - Outside the card */}
      <div className="auth-footer">
        <p className="brand">ZayLink</p>
        <p className="copyright">© 2024 ZayLink. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </div>
  );
}