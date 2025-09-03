import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Plus, 
  Droplets, 
  BarChart3, 
  User,
  Clock
} from 'lucide-react';

interface TabItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

const tabs: TabItem[] = [
  { path: '/', icon: Clock, label: 'Timeline' },
  { path: '/add', icon: Plus, label: 'Log Food' },
  { path: '/water', icon: Droplets, label: 'Water' },
  { path: '/analytics', icon: BarChart3, label: 'Stats' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const BottomTabs: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center px-2 py-2 min-w-0 flex-1 transition-all duration-200 ${
                isActive ? 'text-brand-orange' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <motion.div
                className="flex flex-col items-center justify-center relative"
                whileTap={{ scale: 0.9 }}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {/* Tab Icon */}
                <div className={`p-2 rounded-full transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-orange/10 text-brand-orange' 
                    : 'text-gray-500'
                }`}>
                  <tab.icon className="w-5 h-5" />
                </div>

                {/* Tab Label */}
                <span className={`text-xs font-medium mt-1 transition-all duration-200 ${
                  isActive ? 'text-brand-orange' : 'text-gray-500'
                }`}>
                  {tab.label}
                </span>

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 w-1 h-1 bg-brand-orange rounded-full"
                    transition={{ duration: 0.2 }}
                  />
                )}

                {/* Badge */}
                {tab.badge && (
                  <motion.div
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tab.badge}
                  </motion.div>
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>

      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </div>
  );
};

export default BottomTabs;