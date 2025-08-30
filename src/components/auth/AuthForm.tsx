import React, { useState } from 'react';
import { Loader2, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });
  
  const { signIn, signUp, resetPassword, loading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        return;
      }
      await signUp(formData.email, formData.password, formData.displayName);
    } else {
      await signIn(formData.email, formData.password);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.email) {
      alert('Please enter your email address first');
      return;
    }
    
    try {
      await resetPassword(formData.email);
      alert('Password reset email sent! Check your inbox.');
    } catch (error) {
      // Error handled by the auth hook
    }
  };

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <User className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {isSignUp 
              ? 'Start tracking your food log today' 
              : 'Access your food log from anywhere'
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="form-label">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={handleChange('displayName')}
                  className="input-field pl-10"
                  placeholder="Your name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="form-label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                className="input-field pl-10"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                className="input-field pl-10 pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">Passwords do not match</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2">
          {!isSignUp && (
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-primary-600 hover:text-primary-700 text-sm text-center"
            >
              Forgot your password?
            </button>
          )}
          
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              clearError();
              setFormData({ email: '', password: '', displayName: '', confirmPassword: '' });
            }}
            className="text-gray-600 hover:text-gray-800 text-sm text-center"
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Create one"
            }
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Your data is securely stored and synced across all your devices.
            <br />
            You can also use the app without signing in with local storage only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;