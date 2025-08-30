import React, { useState } from 'react';
import { LogOut, User, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthForm from './components/auth/AuthForm';
import FoodLogPage from './pages/FoodLogPage';

const AppContent: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowAuthModal(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-800">Food Log</h1>
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
            Beta
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:inline">
                {user.displayName || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50"
            >
              <User className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <FoodLogPage />

      {/* Auth Modal */}
      {showAuthModal && !user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
            <AuthForm />
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
