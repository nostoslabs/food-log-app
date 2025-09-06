import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { LogOut, User, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthForm from './components/auth/AuthForm';
import { BottomTabs } from './components';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import TimelinePage from './pages/TimelinePage';
import LogPage from './pages/LogPage';
import WaterPage from './pages/WaterPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import FoodLogPage from './pages/FoodLogPage';
import SignInPage from './pages/SignInPage';
import PrivacyPolicy from './pages/PrivacyPolicy';

const AppContent: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
          <span className="text-lg font-medium">Loading your food log...</span>
        </div>
      </div>
    );
  }

  // Check if we're on a route that should show the top navigation or hide bottom tabs
  const showTopNavigation = location.pathname === '/legacy' || location.pathname === '/privacy';
  const hideBottomTabs = showTopNavigation || location.pathname === '/signin';
  const showBottomTabs = !hideBottomTabs;

  return (
    <div className="min-h-screen bg-background flex flex-col ios-scroll-fix">
      {/* Legacy Navigation Bar - only show on legacy and privacy pages */}
      {showTopNavigation && (
        <nav className="gradient-header">
          <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-white/40 via-white/20 to-white/10 flex items-center justify-center backdrop-blur-xl border-2 border-white/30 shadow-xl"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <span className="text-3xl filter drop-shadow-lg">🍽️</span>
                </motion.div>
                <h1 className="text-4xl font-black text-white drop-shadow-2xl tracking-tight">foodlogger.me</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/90 hidden sm:inline font-medium">
                    {user.displayName || user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-sm text-white/90 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <motion.button
                  onClick={() => setShowAuthModal(true)}
                  className="relative px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-white/20 via-white/30 to-white/20 backdrop-blur-xl border-2 border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
                  whileHover={{ 
                    scale: 1.08, 
                    y: -3,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full" />
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-none" />
                  <div className="relative flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold tracking-wider drop-shadow-sm">Sign In</span>
                  </div>
                </motion.button>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<TimelinePage />} />
          <Route path="/add" element={<LogPage />} />
          <Route path="/water" element={<WaterPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/legacy" element={<FoodLogPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </main>

      {/* Bottom Tab Navigation */}
      {showBottomTabs && <BottomTabs />}

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
              className="glass-card max-w-md w-full relative"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent transition-all text-xl"
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

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
          <Analytics />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;