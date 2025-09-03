import React from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Target, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();

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

      {!user && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>Please sign in to access profile features</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;