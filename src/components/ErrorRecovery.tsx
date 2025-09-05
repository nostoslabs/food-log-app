/**
 * CRITICAL: Error Recovery Component for Patient Data Safety
 * 
 * This component provides comprehensive error handling and recovery
 * mechanisms to prevent patient data loss in healthcare applications.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Database, Shield, CheckCircle, X } from 'lucide-react';
import { useFoodLogStore, useFoodLogErrors } from '../stores/foodLogStore';

interface ErrorRecoveryProps {
  onClose?: () => void;
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({ onClose }) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryResult, setRecoveryResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  
  const { recoverFromLocalStorage, validateAllData, syncAllData, clearError } = useFoodLogStore();
  const { errors, currentError } = useFoodLogErrors();
  
  // Auto-dismiss success messages
  useEffect(() => {
    if (recoveryResult?.success) {
      const timer = setTimeout(() => {
        setRecoveryResult(null);
        onClose?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [recoveryResult, onClose]);
  
  const handleRecoverFromLocalStorage = async () => {
    setIsRecovering(true);
    try {
      await recoverFromLocalStorage();
      const validation = await validateAllData();
      
      setRecoveryResult({
        success: true,
        message: `Recovery completed successfully. Recovered ${validation.valid} valid entries.`,
        details: validation
      });
      
      // Clear any previous errors after successful recovery
      clearError();
      
    } catch (error) {
      setRecoveryResult({
        success: false,
        message: `Recovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsRecovering(false);
    }
  };
  
  const handleSyncData = async () => {
    setIsRecovering(true);
    try {
      await syncAllData();
      const validation = await validateAllData();
      
      setRecoveryResult({
        success: true,
        message: `Data sync completed. ${validation.valid} entries validated.`,
        details: validation
      });
      
      clearError();
      
    } catch (error) {
      setRecoveryResult({
        success: false,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsRecovering(false);
    }
  };
  
  const handleValidateData = async () => {
    setIsRecovering(true);
    try {
      const validation = await validateAllData();
      
      if (validation.invalid === 0) {
        setRecoveryResult({
          success: true,
          message: `All ${validation.valid} entries are valid. No issues detected.`,
          details: validation
        });
      } else {
        setRecoveryResult({
          success: false,
          message: `Found ${validation.invalid} invalid entries out of ${validation.valid + validation.invalid} total.`,
          details: validation
        });
      }
      
    } catch (error) {
      setRecoveryResult({
        success: false,
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsRecovering(false);
    }
  };
  
  const hasErrors = errors.length > 0 || currentError;
  
  if (!hasErrors && !recoveryResult) {
    return null;
  }
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {recoveryResult?.success ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-500" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {recoveryResult?.success ? 'Recovery Successful' : 'Data Recovery Required'}
                </h3>
                <p className="text-sm text-gray-500">
                  Healthcare data integrity protection
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Success Message */}
            {recoveryResult?.success && (
              <motion.div
                className="p-4 bg-green-50 border border-green-200 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-green-800 font-medium">
                      {recoveryResult.message}
                    </p>
                    {recoveryResult.details && (
                      <p className="text-green-700 text-sm mt-1">
                        Valid entries: {recoveryResult.details.valid} | 
                        Invalid entries: {recoveryResult.details.invalid}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Error Message */}
            {recoveryResult?.success === false && (
              <motion.div
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">
                      {recoveryResult.message}
                    </p>
                    {recoveryResult.details?.errors && (
                      <div className="mt-2 text-sm text-red-700">
                        <p className="font-medium">Issues found:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {recoveryResult.details.errors.slice(0, 3).map((error: string, index: number) => (
                            <li key={index} className="text-xs">{error}</li>
                          ))}
                          {recoveryResult.details.errors.length > 3 && (
                            <li className="text-xs">...and {recoveryResult.details.errors.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Current Error */}
            {currentError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">Current Error</p>
                    <p className="text-red-700 text-sm mt-1">{currentError}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Recent Errors */}
            {errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Recent Issues</h4>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {errors.slice(-3).reverse().map((error, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-700">{error.operation}</span>
                        <span className="text-gray-500 text-xs">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{error.error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Recovery Actions */}
            {!recoveryResult?.success && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Recovery Options</h4>
                
                <button
                  onClick={handleRecoverFromLocalStorage}
                  disabled={isRecovering}
                  className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Database className={`w-5 h-5 text-blue-600 ${isRecovering ? 'animate-pulse' : ''}`} />
                  <div className="text-left">
                    <p className="font-medium text-blue-800">Recover from Local Storage</p>
                    <p className="text-blue-700 text-sm">Restore data from local backup</p>
                  </div>
                </button>
                
                <button
                  onClick={handleSyncData}
                  disabled={isRecovering}
                  className="w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 text-green-600 ${isRecovering ? 'animate-spin' : ''}`} />
                  <div className="text-left">
                    <p className="font-medium text-green-800">Sync Cloud Data</p>
                    <p className="text-green-700 text-sm">Refresh from server</p>
                  </div>
                </button>
                
                <button
                  onClick={handleValidateData}
                  disabled={isRecovering}
                  className="w-full flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Shield className={`w-5 h-5 text-purple-600 ${isRecovering ? 'animate-pulse' : ''}`} />
                  <div className="text-left">
                    <p className="font-medium text-purple-800">Validate All Data</p>
                    <p className="text-purple-700 text-sm">Check data integrity</p>
                  </div>
                </button>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 rounded-b-xl border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              <Shield className="w-3 h-3 inline mr-1" />
              Your health data is protected with multiple backup layers
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook to trigger error recovery
export const useErrorRecovery = () => {
  const [showRecovery, setShowRecovery] = useState(false);
  const { errors, currentError } = useFoodLogErrors();
  
  // Auto-show recovery dialog for critical errors
  useEffect(() => {
    const hasCriticalError = currentError?.includes('validation') || 
                           currentError?.includes('data') ||
                           errors.some(e => e.operation.includes('firestore') && !e.resolved);
    
    if (hasCriticalError && !showRecovery) {
      setShowRecovery(true);
    }
  }, [currentError, errors, showRecovery]);
  
  return {
    showRecovery,
    setShowRecovery,
    hasErrors: errors.length > 0 || !!currentError,
  };
};