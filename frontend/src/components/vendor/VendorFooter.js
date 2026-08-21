import { FiGlobe, FiShare2, FiMail } from 'react-icons/fi';

export default function VendorFooter() {
  return (
    <footer className="vendor-footer">
      <div className="vendor-footer-grid">
        <div>
          <h4>Marketplace</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Sell on Pro Vendor</a></li>
            <li><a href="#">Affiliate Program</a></li>
            <li><a href="#">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4>Customer care</h4>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Returns &amp; Refunds</a></li>
            <li><a href="#">Shipping Info</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Cookie Settings</a></li>
          </ul>
        </div>
        <div>
          <h4>Follow the marketplace</h4>
          <div className="vendor-footer-social">
            <a href="#" aria-label="Website"><FiGlobe /></a>
            <a href="#" aria-label="Share"><FiShare2 /></a>
            <a href="#" aria-label="Email"><FiMail /></a>
          </div>
        </div>
      </div>
      <div className="vendor-footer-bottom">© 2026 Pro Vendor Marketplace. All rights reserved.</div>
    </footer>
  );
}
