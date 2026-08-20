import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../features/auth/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const vendorRegisterSchema = yup.object().shape({
  firstName: yup.string().required('First name is required').min(2, 'Name must be at least 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  storeName: yup.string().required('Store name is required'),
  businessAddress: yup.string().required('Business address is required'),
  storeDescription: yup.string().required('Store description is required'),
  agreeTerms: yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),
});

export default function VendorRegisterForm() {
  const { registerVendor } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(vendorRegisterSchema),
    defaultValues: {
      agreeTerms: false,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);

    const vendorData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      storeName: data.storeName,
      businessAddress: data.businessAddress,
      storeDescription: data.storeDescription,
    };

    const result = await registerVendor(vendorData);
    setLoading(false);

    if (result.success) {
      toast.success('Vendor registration successful! Please log in.');
      router.push('/auth/login');
    } else {
      const statusText = result.status ? ` (code: ${result.status})` : '';
      toast.error((result.error || 'Vendor registration failed. Please try again.') + statusText);
      console.error('Vendor registration error response:', result.raw || result);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Create Vendor Account</h2>
      <p className="auth-subtitle">Join ZayLink to start selling.</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* First Name */}
        <div className="form-group">
          <label className="form-label">First Name</label>
          <input
            type="text"
            {...register('firstName')}
            placeholder="Enter your first name"
            className={`form-input ${errors.firstName ? 'error' : ''}`}
          />
          {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
        </div>

        {/* Last Name */}
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            {...register('lastName')}
            placeholder="Enter your last name"
            className={`form-input ${errors.lastName ? 'error' : ''}`}
          />
          {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            {...register('email')}
            placeholder="you@example.com"
            className={`form-input ${errors.email ? 'error' : ''}`}
          />
          {errors.email && <span className="form-error">{errors.email.message}</span>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="••••••••••"
              className={`form-input ${errors.password ? 'error' : ''}`}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password && <span className="form-error">{errors.password.message}</span>}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              placeholder="••••••••••"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
        </div>

        {/* ===== STORE DETAILS ===== */}
        <div className="store-details-section">
          <h3>Store Details</h3>

          {/* Store Name */}
          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input
              type="text"
              {...register('storeName')}
              placeholder="Your Store Name"
              className={`form-input ${errors.storeName ? 'error' : ''}`}
            />
            {errors.storeName && <span className="form-error">{errors.storeName.message}</span>}
          </div>

          {/* Business Address */}
          <div className="form-group">
            <label className="form-label">Business Address</label>
            <input
              type="text"
              {...register('businessAddress')}
              placeholder="123 Commerce St, City"
              className={`form-input ${errors.businessAddress ? 'error' : ''}`}
            />
            {errors.businessAddress && <span className="form-error">{errors.businessAddress.message}</span>}
          </div>

          {/* Store Description */}
          <div className="form-group">
            <label className="form-label">Store Description</label>
            <textarea
              {...register('storeDescription')}
              placeholder="Briefly describe your business..."
              rows="3"
              className={`form-input ${errors.storeDescription ? 'error' : ''}`}
            />
            {errors.storeDescription && <span className="form-error">{errors.storeDescription.message}</span>}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="checkbox-group">
          <div className="checkbox-left">
            <input
              type="checkbox"
              {...register('agreeTerms')}
              id="agreeTerms"
            />
            <label htmlFor="agreeTerms">I agree to the Terms & Conditions and Privacy Policy.</label>
          </div>
        </div>
        {errors.agreeTerms && <span className="form-error">{errors.agreeTerms.message}</span>}

        {/* Register Button */}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'REGISTER ACCOUNT'}
        </button>
      </form>

      <p className="auth-link">
        Already have an account? <Link href="/auth/login">Sign in</Link>
      </p>
      <p className="auth-link">
        Want to buy on ZayLink? <Link href="/auth/register">Register as a customer</Link>
      </p>
    </div>
  );
}
