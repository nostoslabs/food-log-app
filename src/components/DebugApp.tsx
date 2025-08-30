import React from 'react';
import { auth, db, isFirebaseConfigured } from '../services/firebase';

const DebugApp: React.FC = () => {
  console.log('DebugApp render');
  console.log('Firebase configured:', isFirebaseConfigured);
  console.log('Auth object:', auth);
  console.log('DB object:', db);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Firebase Debug Page</h1>
      <div>
        <h2>Configuration Status</h2>
        <p>Firebase Configured: <strong>{isFirebaseConfigured ? 'YES' : 'NO'}</strong></p>
        <p>Auth Object: <strong>{auth ? 'Available' : 'Not Available'}</strong></p>
        <p>Database Object: <strong>{db ? 'Available' : 'Not Available'}</strong></p>
      </div>
      
      <div>
        <h2>Environment Variables</h2>
        <p>API Key: <strong>{import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Not Set'}</strong></p>
        <p>Auth Domain: <strong>{import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Not Set'}</strong></p>
        <p>Project ID: <strong>{import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Set' : 'Not Set'}</strong></p>
      </div>

      {isFirebaseConfigured ? (
        <div style={{ background: '#d4edda', padding: '10px', borderRadius: '5px', color: '#155724' }}>
          ✅ Firebase is properly configured and should work
        </div>
      ) : (
        <div style={{ background: '#f8d7da', padding: '10px', borderRadius: '5px', color: '#721c24' }}>
          ❌ Firebase is not configured. Check your .env.local file
        </div>
      )}
    </div>
  );
};

export default DebugApp;