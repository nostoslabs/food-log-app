import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Target, FileText, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/auth/AuthForm';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 py-6">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6" />
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
          <p className="text-white/80 text-sm mt-1">
            Manage your account and preferences
          </p>
        </div>
      </motion.div>

      {/* User Info */}
      {user && (
        <motion.div 
          className="m-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user.displayName || 'User'}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Menu Items */}
      <motion.div 
        className="m-4 space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {[
          { icon: Settings, label: 'Settings', subtitle: 'App preferences and defaults' },
          { icon: Target, label: 'Goals', subtitle: 'Set your daily targets' },
          { icon: FileText, label: 'Export Data', subtitle: 'Download your food logs' },
        ].map((item, index) => (
          <motion.button
            key={item.label}
            className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-gray-900">{item.label}</h3>
              <p className="text-sm text-gray-500">{item.subtitle}</p>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Sign Out */}
      {user && (
        <motion.div 
          className="mt-auto m-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={handleSignOut}
            className="w-full bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4 hover:bg-red-100 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-red-600">Sign Out</h3>
              <p className="text-sm text-red-500">Sign out of your account</p>
            </div>
          </motion.button>
        </motion.div>
      )}

      {/* Sign In CTA for non-authenticated users */}
      {!user && (
        <motion.div 
          className="m-4 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-brand-orange to-amber-500 rounded-2xl p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8" />
            <div className="relative z-10">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-white" />
              <h2 className="text-2xl font-bold mb-2">Unlock Your Full Experience</h2>
              <p className="text-white/90 mb-6">
                Sign in to sync your data, track progress across devices, and access premium features
              </p>
              
              {/* CTA Buttons */}
              <div className="space-y-3">
                <Link 
                  to="/signin"
                  className="block w-full bg-white text-brand-orange py-3 px-6 rounded-xl font-bold hover:bg-white/90 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  Get Started - It's Free!
                </Link>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white py-3 px-6 rounded-xl font-semibold hover:bg-white/30 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  Quick Sign In
                </button>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '☁️', title: 'Cloud Sync', desc: 'Access your data anywhere' },
              { icon: '📊', title: 'Advanced Analytics', desc: 'Track your progress over time' },
              { icon: '🔒', title: 'Secure Backup', desc: 'Never lose your food logs' },
              { icon: '✨', title: 'Premium Features', desc: 'Export, goals, and more' }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="text-2xl mb-2">{benefit.icon}</div>
                <h3 className="font-semibold text-gray-900 text-sm">{benefit.title}</h3>
                <p className="text-xs text-gray-600">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Local Storage Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm">ℹ️</span>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 text-sm mb-1">No Account Required</h4>
                <p className="text-blue-800 text-xs leading-relaxed">
                  You can continue using the app without signing in. Your data will be stored locally on this device only.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && !user && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="max-w-md w-full relative"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 hover:shadow-xl transition-all z-10 text-xl font-bold"
              >
                ×
              </button>
              <AuthForm />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;