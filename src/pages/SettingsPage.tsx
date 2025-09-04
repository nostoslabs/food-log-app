import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Settings, 
  Droplets, 
  Bell, 
  Palette, 
  Globe, 
  Save,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';
import { usePreferences } from '../hooks/usePreferences';

const SettingsPage: React.FC = () => {
  const { 
    preferences, 
    loading, 
    error, 
    updatePreferences,
    updateWaterPreferences,
    updateTheme,
    updateNotificationSettings,
    clearError 
  } = usePreferences();

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localPrefs, setLocalPrefs] = useState(preferences);

  // Update local preferences when global preferences change
  React.useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    clearError();

    try {
      const success = await updatePreferences(localPrefs);
      if (success) {
        setSuccessMessage('Settings saved successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof typeof preferences, value: any) => {
    setLocalPrefs(prev => ({ ...prev, [field]: value }));
  };

  const hasChanges = JSON.stringify(localPrefs) !== JSON.stringify(preferences);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg">
          <div className="px-4 py-6 flex items-center gap-3">
            <Link to="/profile" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Settings className="w-6 h-6" />
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading preferences...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Link 
              to="/profile" 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Settings className="w-6 h-6" />
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
          <p className="text-white/80 text-sm">
            Customize your app preferences and defaults
          </p>
        </div>
      </motion.div>

      {/* Success/Error Messages */}
      {(successMessage || error) && (
        <motion.div 
          className="mx-4 mt-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">{successMessage}</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          )}
        </motion.div>
      )}

      <div className="flex-1 p-4 space-y-6">
        {/* Water Preferences */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Water Tracking</h2>
              <p className="text-sm text-gray-500">Set your water intake goals and defaults</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Water Amount (oz)
              </label>
              <input
                type="number"
                min="1"
                max="64"
                value={localPrefs.defaultWaterAmount}
                onChange={(e) => handleFieldChange('defaultWaterAmount', parseInt(e.target.value) || 32)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="32"
              />
              <p className="text-xs text-gray-500 mt-1">Default amount when logging water</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Water Goal (oz)
              </label>
              <input
                type="number"
                min="32"
                max="256"
                value={localPrefs.dailyWaterGoal}
                onChange={(e) => handleFieldChange('dailyWaterGoal', parseInt(e.target.value) || 128)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="128"
              />
              <p className="text-xs text-gray-500 mt-1">Your daily hydration target</p>
            </div>
          </div>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-500">Configure reminders and alerts</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Water Reminders</label>
                <p className="text-xs text-gray-500">Get reminded to drink water</p>
              </div>
              <button
                onClick={() => handleFieldChange('enableWaterReminders', !localPrefs.enableWaterReminders)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localPrefs.enableWaterReminders ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localPrefs.enableWaterReminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {localPrefs.enableWaterReminders && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pl-4 border-l-2 border-blue-100"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Interval (minutes)
                </label>
                <select
                  value={localPrefs.waterReminderInterval}
                  onChange={(e) => handleFieldChange('waterReminderInterval', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={30}>Every 30 minutes</option>
                  <option value={60}>Every hour</option>
                  <option value={90}>Every 90 minutes</option>
                  <option value={120}>Every 2 hours</option>
                </select>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Display Preferences */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Display</h2>
              <p className="text-sm text-gray-500">Theme and appearance settings</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: 'light', label: 'Light', icon: '☀️' },
                  { value: 'dark', label: 'Dark', icon: '🌙' },
                  { value: 'auto', label: 'Auto', icon: '⚡' },
                ] as const).map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => handleFieldChange('theme', theme.value)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      localPrefs.theme === theme.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{theme.icon}</div>
                    <div className="text-sm font-medium">{theme.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Time Format</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: '12h', label: '12 Hour (2:30 PM)' },
                  { value: '24h', label: '24 Hour (14:30)' },
                ] as const).map((format) => (
                  <button
                    key={format.value}
                    onClick={() => handleFieldChange('timeFormat', format.value)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      localPrefs.timeFormat === format.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{format.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Regional Preferences */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Regional</h2>
              <p className="text-sm text-gray-500">Units and regional preferences</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Units</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'imperial', label: 'Imperial (oz, lbs)' },
                { value: 'metric', label: 'Metric (ml, kg)' },
              ] as const).map((unit) => (
                <button
                  key={unit.value}
                  onClick={() => handleFieldChange('units', unit.value)}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    localPrefs.units === unit.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">{unit.label}</div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <motion.div 
          className="sticky bottom-20 mx-4 mb-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl py-4 px-6 font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Settings...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default SettingsPage;