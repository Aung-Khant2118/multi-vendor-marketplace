import { FiInstagram, FiFacebook, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div>
          <h4>Marketplace</h4>
          <ul>
            <li><a href="#">About us</a></li>
            <li><a href="#">Our vendors</a></li>
            <li><a href="#">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4>Customer care</h4>
          <ul>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Help center</a></li>
            <li><a href="#">Shipping &amp; returns</a></li>
          </ul>
        </div>
        <div>
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Privacy policy</a></li>
            <li><a href="#">Terms of service</a></li>
            <li><a href="#">Cookie policy</a></li>
          </ul>
        </div>
        <div>
          <h4>Follow the marketplace</h4>
          <div className="site-footer-social">
            <a href="#" aria-label="Instagram"><FiInstagram /></a>
            <a href="#" aria-label="Facebook"><FiFacebook /></a>
            <a href="#" aria-label="Email"><FiMail /></a>
          </div>
        </div>
      </div>
      <div className="site-footer-bottom">Made for independent commerce</div>
    </footer>
  );
}
