import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { FiMapPin, FiTrash2, FiPlus } from 'react-icons/fi';
import { useAuth } from '../features/auth/AuthContext';
import { addressAPI } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import GuestGuard from '../components/Auth/GuestGuard';

const EMPTY_FORM = {
  recipientName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postalCode: '',
  country: '',
  addressType: 'SHIPPING',
};

export default function Addresses() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isAuthenticated) return;
    setAddressesLoading(true);
    addressAPI
      .getAddresses()
      .then((res) => setAddresses(res.data?.data || []))
      .catch(() => setAddresses([]))
      .finally(() => setAddressesLoading(false));
  }, [isAuthenticated]);

  const addAddress = async (e) => {
    e.preventDefault();
    if (!form.recipientName || !form.line1 || !form.city || !form.country) {
      toast.error('Name, address line, city and country are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await addressAPI.createAddress(form);
      const newAddress = res.data?.data;
      if (newAddress) {
        setAddresses((prev) => [...prev, newAddress]);
      }
      setForm(EMPTY_FORM);
      toast.success('Address saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  const removeAddress = async (id) => {
    try {
      await addressAPI.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete address');
    }
  };

  if (mounted && !loading && !isAuthenticated) {
    return <GuestGuard message="Log in to manage your saved addresses." />;
  }

  if (!mounted) return null;

  return (
    <AppLayout>
      <div className="page-heading">
        <div>
          <h1>Addresses</h1>
          <p>Saved shipping addresses for faster checkout</p>
        </div>
      </div>

      <div className="content-card">
        <h2 className="dashboard-subtitle">Add a new address</h2>
        <form onSubmit={addAddress}>
          <div className="form-group">
            <label className="form-label">Recipient Name</label>
            <input
              className="form-input"
              placeholder="e.g. Ko Aung"
              value={form.recipientName}
              onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              placeholder="09 123 456 789"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address line 1</label>
            <input
              className="form-input"
              placeholder="House No, Street, Ward"
              value={form.line1}
              onChange={(e) => setForm({ ...form, line1: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address line 2</label>
            <input
              className="form-input"
              placeholder="Room, Floor (optional)"
              value={form.line2}
              onChange={(e) => setForm({ ...form, line2: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              className="form-input"
              placeholder="e.g. Yangon"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Region / State</label>
            <input
              className="form-input"
              placeholder="e.g. Yangon Region"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Postal code</label>
            <input
              className="form-input"
              placeholder="e.g. 11121"
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Country</label>
            <input
              className="form-input"
              placeholder="Myanmar"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-pill btn-pill-yellow" disabled={submitting}>
            <FiPlus /> {submitting ? 'Saving...' : 'Save address'}
          </button>
        </form>
      </div>

      {addressesLoading ? (
        <p>Loading addresses...</p>
      ) : addresses.length === 0 ? (
        <div className="empty-state">
          <FiMapPin size={32} />
          <div className="empty-state-title">No saved addresses</div>
          <p>Add an address above to use it at checkout.</p>
        </div>
      ) : (
        addresses.map((a) => (
          <div key={a.id} className="content-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{a.recipientName}</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city} {a.postalCode}
                {a.phone ? ` · ${a.phone}` : ''}
              </p>
            </div>
            <button type="button" className="btn-sm btn-sm-danger" onClick={() => removeAddress(a.id)}>
              <FiTrash2 />
            </button>
          </div>
        ))
      )}
    </AppLayout>
  );
}
