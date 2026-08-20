import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { customerAPI, addressAPI } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';

const PAYMENT_METHODS = ['CASH_ON_DELIVERY', 'CARD', 'WALLET', 'BANK_TRANSFER'];

const SHIPPING_FLAT_RATE = 5.0;
const FREE_SHIPPING_THRESHOLD = 50.0;
const TAX_RATE = 0.08;

export default function Checkout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [shippingAddressId, setShippingAddressId] = useState('');
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddressId, setBillingAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    recipientName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    addressType: 'SHIPPING',
    isDefault: true,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    Promise.all([customerAPI.getCart(), addressAPI.getAddresses()])
      .then(([c, a]) => {
        setCart(c.data?.data || null);
        setAddresses(a.data?.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load checkout data'));
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, it) => sum + Number(it.subtotal || 0), 0);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;

  const createAddress = async () => {
    try {
      const res = await addressAPI.createAddress(addressForm);
      const created = res.data?.data;
      setAddresses((prev) => [...prev, created]);
      if (!shippingAddressId) setShippingAddressId(String(created.id));
      setShowAddressForm(false);
      toast.success('Address saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save address');
    }
  };

  const placeOrder = async () => {
    if (!shippingAddressId) {
      toast.error('Select or add a shipping address');
      return;
    }
    setPlacing(true);
    try {
      const payload = {
        shippingAddressId: Number(shippingAddressId),
        billingAddressId: billingSameAsShipping
          ? Number(shippingAddressId)
          : Number(billingAddressId),
        paymentMethod,
        notes: notes || undefined,
      };
      if (!billingSameAsShipping && !billingAddressId) {
        throw new Error('Select a billing address');
      }
      const res = await customerAPI.checkout(payload);
      toast.success(`Order #${res.data?.data?.id} placed`);
      router.push(`/orders/${res.data?.data?.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Checkout failed');
    } finally {
      setPlacing(false);
    }
  };

  const addressOptions = (list) =>
    list.map((a) => (
      <option key={a.id} value={a.id}>
        {a.recipientName} — {a.line1}, {a.city}, {a.country}
        {a.isDefault ? ' (default)' : ''}
      </option>
    ));

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '720px' }}>
        <h1 className="auth-title">Checkout</h1>
        <p className="auth-link">
          <Link href="/cart">Back to cart</Link> · <Link href="/products">Continue shopping</Link>
        </p>
        {error && <p className="form-error">{error}</p>}

        <div className="dashboard-section">
          <h2 className="dashboard-subtitle">Shipping address</h2>
          {addresses.length > 0 ? (
            <select
              className="form-input"
              value={shippingAddressId}
              onChange={(e) => setShippingAddressId(e.target.value)}
            >
              <option value="">Select an address</option>
              {addressOptions(addresses)}
            </select>
          ) : (
            <p>No saved addresses yet.</p>
          )}
          <button className="btn-outline" onClick={() => setShowAddressForm((v) => !v)}>
            {showAddressForm ? 'Cancel' : '+ Add new address'}
          </button>
          {showAddressForm && (
            <div style={{ marginTop: '12px' }}>
              <div className="form-group">
                <label className="form-label">Recipient name *</label>
                <input
                  className="form-input"
                  value={addressForm.recipientName}
                  onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                  className="form-input"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address line 1 *</label>
                <input
                  className="form-input"
                  value={addressForm.line1}
                  onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address line 2</label>
                <input
                  className="form-input"
                  value={addressForm.line2}
                  onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  className="form-input"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Region</label>
                <input
                  className="form-input"
                  value={addressForm.region}
                  onChange={(e) => setAddressForm({ ...addressForm, region: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Postal code</label>
                <input
                  className="form-input"
                  value={addressForm.postalCode}
                  onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Country *</label>
                <input
                  className="form-input"
                  value={addressForm.country}
                  onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                />
              </div>
              <button className="btn-primary" onClick={createAddress}>
                Save address
              </button>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2 className="dashboard-subtitle">Billing</h2>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={billingSameAsShipping}
              onChange={(e) => setBillingSameAsShipping(e.target.checked)}
            />{' '}
            Billing address is the same as shipping
          </label>
          {!billingSameAsShipping && (
            <select
              className="form-input"
              value={billingAddressId}
              onChange={(e) => setBillingAddressId(e.target.value)}
            >
              <option value="">Select a billing address</option>
              {addressOptions(addresses)}
            </select>
          )}
        </div>

        <div className="dashboard-section">
          <h2 className="dashboard-subtitle">Payment method</h2>
          {PAYMENT_METHODS.map((m) => (
            <label key={m} style={{ display: 'block', marginBottom: '6px' }}>
              <input
                type="radio"
                name="paymentMethod"
                value={m}
                checked={paymentMethod === m}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />{' '}
              {m.replace(/_/g, ' ')}
            </label>
          ))}
        </div>

        <div className="dashboard-section">
          <h2 className="dashboard-subtitle">Order summary</h2>
          {items.length === 0 && <p>Your cart is empty.</p>}
          {items.map((it) => (
            <div key={it.variantId} className="info-row">
              <strong>{it.productName}</strong> — {it.sku} x {it.quantity} = ${it.subtotal}
            </div>
          ))}
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Shipping: ${shippingCost.toFixed(2)}</p>
          <p>Tax: ${tax.toFixed(2)}</p>
          <p style={{ fontWeight: 600 }}>Total: ${total.toFixed(2)}</p>

          <div className="form-group">
            <label className="form-label">Order notes</label>
            <textarea
              className="form-input"
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            className="btn-primary"
            onClick={placeOrder}
            disabled={placing || items.length === 0}
          >
            {placing ? 'Placing order...' : 'Place order'}
          </button>
        </div>
      </div>

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