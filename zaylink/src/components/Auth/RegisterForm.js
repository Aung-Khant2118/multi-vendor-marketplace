import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../features/auth/AuthContext';
import { userAPI } from '../../services/api';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const registerSchema = yup.object().shape({
  fullName: yup.string().required('Full name is required').min(2, 'Name must be at least 2 characters'),
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  accountType: yup.string().required('Please select account type'),
  agreeTerms: yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),
});

export default function RegisterForm() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState('customer');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      accountType: 'customer',
      agreeTerms: false,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    // split full name into firstName / lastName for backend RegisterRequest
    const nameParts = data.fullName.trim().split(/\s+/);
    const registrationData = {
      firstName: nameParts.shift(),
      lastName: nameParts.join(' ') || '',
      email: data.email,
      password: data.password,
      // frontend-only fields (username, phoneNumber, accountType) can be sent later via profile endpoints
    };

    const result = await registerUser(registrationData);
    setLoading(false);

    if (result.success) {
      // update additional profile fields (username, phoneNumber, accountType)
      try {
        await userAPI.updateProfile({
          username: data.username,
          phoneNumber: data.phoneNumber,
          accountType: data.accountType,
        });
      } catch (e) {
        toast.warn('Profile update failed; you can complete it later in your account settings.');
      }

      toast.success('Registration successful! Please check your email for verification.');
      router.push('/auth/login');
    } else {
      const statusText = result.status ? ` (code: ${result.status})` : '';
      toast.error((result.error || 'Registration failed. Please try again.') + statusText);
      console.error('Registration error response:', result.raw || result);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Create Account</h2>
      <p className="auth-subtitle">Join ZayLink to start your journey.</p>

      <form onSubmit={handleSubmit(onSubmit)}>
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
          <label className="form-label">Email</label>
          <input
            type="email"
            {...register('email')}
            placeholder="you@example.com"
            className={`form-input ${errors.email ? 'error' : ''}`}
          />
          {errors.email && <span className="form-error">{errors.email.message}</span>}
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
          <label className="form-label">Password</label>
          <input
            type="password"
            {...register('password')}
            placeholder="••••••••••"
            className={`form-input ${errors.password ? 'error' : ''}`}
          />
          {errors.password && <span className="form-error">{errors.password.message}</span>}
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

        <div className="form-group">
          <label className="form-label">Account Type</label>
          <div className="radio-group">
            <label className={accountType === 'customer' ? 'active' : ''}>
              <input
                type="radio"
                value="customer"
                {...register('accountType')}
                onChange={() => setAccountType('customer')}
              />
              Customer
            </label>
            <label className={accountType === 'vendor' ? 'active' : ''}>
              <input
                type="radio"
                value="vendor"
                {...register('accountType')}
                onChange={() => { setAccountType('vendor'); router.push('/auth/vendor-register'); }}
              />
              Vendor
            </label>
          </div>
          {errors.accountType && <span className="form-error">{errors.accountType.message}</span>}
        </div>

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