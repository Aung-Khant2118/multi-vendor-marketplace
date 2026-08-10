import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const vendorRegisterSchema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  phoneNumber: yup.string().required('Phone number is required'),
  storeName: yup.string().when('accountType', {
    is: 'vendor',
    then: yup.string().required('Store name is required'),
    otherwise: yup.string(),
  }),
  businessAddress: yup.string().when('accountType', {
    is: 'vendor',
    then: yup.string().required('Business address is required'),
    otherwise: yup.string(),
  }),
  storeDescription: yup.string().when('accountType', {
    is: 'vendor',
    then: yup.string().required('Store description is required'),
    otherwise: yup.string(),
  }),
  accountType: yup.string().required('Please select account type'),
  agreeTerms: yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),
});

export default function VendorRegisterForm() {
  const { registerVendor } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isVendor, setIsVendor] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(vendorRegisterSchema),
    defaultValues: {
      accountType: 'vendor',
      agreeTerms: false,
    },
  });

  const handleAccountTypeChange = (type) => {
    setIsVendor(type === 'vendor');
    setValue('accountType', type);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    if (data.accountType === 'vendor') {
      const vendorData = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        username: data.username,
        phoneNumber: data.phoneNumber,
        accountType: 'vendor',
        storeDetails: {
          storeName: data.storeName,
          businessAddress: data.businessAddress,
          storeDescription: data.storeDescription,
        },
      };

      const result = await registerVendor(vendorData);
      setLoading(false);

      if (result.success) {
        toast.success('Vendor registration pending! You will be notified upon approval.');
        router.push('/auth/login');
      } else {
        toast.error(result.error || 'Vendor registration failed. Please try again.');
      }
    } else {
      const customerData = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        username: data.username,
        phoneNumber: data.phoneNumber,
        accountType: 'customer',
      };

      const result = await registerVendor(customerData);
      setLoading(false);

      if (result.success) {
        toast.success('Registration successful! Please check your email for verification.');
        router.push('/auth/login');
      } else {
        toast.error(result.error || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Create Account</h2>
      <p className="auth-subtitle">Join ZayLink to start your journey.</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            {...register('fullName')}
            placeholder="Enter your full name"
            className={`form-input ${errors.fullName ? 'error' : ''}`}
          />
          {errors.fullName && <span className="form-error">{errors.fullName.message}</span>}
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
          <input
            type="password"
            {...register('password')}
            placeholder="••••••••••"
            className={`form-input ${errors.password ? 'error' : ''}`}
          />
          {errors.password && <span className="form-error">{errors.password.message}</span>}
        </div>

        {/* Account Type */}
        <div className="form-group">
          <label className="form-label">Account Type</label>
          <div className="radio-group">
            <label className={!isVendor ? 'active' : ''}>
              <input
                type="radio"
                checked={!isVendor}
                onChange={() => handleAccountTypeChange('customer')}
              />
              Customer
            </label>
            <label className={isVendor ? 'active' : ''}>
              <input
                type="radio"
                checked={isVendor}
                onChange={() => handleAccountTypeChange('vendor')}
              />
              Vendor
            </label>
          </div>
          {errors.accountType && <span className="form-error">{errors.accountType.message}</span>}
        </div>

        {/* ===== STORE DETAILS - SHOWS WHEN VENDOR IS SELECTED ===== */}
        {isVendor && (
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

            {/* Username */}
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                {...register('username')}
                placeholder="Choose a username"
                className={`form-input ${errors.username ? 'error' : ''}`}
              />
              {errors.username && <span className="form-error">{errors.username.message}</span>}
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                {...register('phoneNumber')}
                placeholder="+1 (555) 000-0000"
                className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
              />
              {errors.phoneNumber && <span className="form-error">{errors.phoneNumber.message}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="••••••••••"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
            </div>

            {/* Vendor - Business Address */}
            <div className="form-group">
              <label className="form-label">Vendor</label>
              <input
                type="text"
                {...register('businessAddress')}
                placeholder="123 Commerce St, City"
                className={`form-input ${errors.businessAddress ? 'error' : ''}`}
              />
              {errors.businessAddress && <span className="form-error">{errors.businessAddress.message}</span>}
            </div>
          </div>
        )}

        {/* ===== CUSTOMER FIELDS - SHOWS WHEN CUSTOMER IS SELECTED ===== */}
        {!isVendor && (
          <>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                {...register('username')}
                placeholder="Choose a username"
                className={`form-input ${errors.username ? 'error' : ''}`}
              />
              {errors.username && <span className="form-error">{errors.username.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                {...register('phoneNumber')}
                placeholder="+1 (555) 000-0000"
                className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
              />
              {errors.phoneNumber && <span className="form-error">{errors.phoneNumber.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="••••••••••"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
            </div>
          </>
        )}

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
        Already have an account? <a href="/auth/login">Sign in</a>
      </p>
    </div>
  );
}