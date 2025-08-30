import React from 'react';

const FirebaseNotConfigured: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">🔥</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4">Firebase Not Configured</h1>
        <p className="text-muted-foreground mb-6">
          FoodLogger.me needs Firebase to be configured to work properly. 
        </p>
        <div className="bg-muted/50 rounded-lg p-4 text-left text-sm">
          <h3 className="font-semibold mb-2">Setup Required:</h3>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Create a Firebase project</li>
            <li>Enable Authentication</li>
            <li>Create a Firestore database</li>
            <li>Add your config to .env.local</li>
          </ol>
        </div>
        <button
          onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
          className="mt-6 w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Open Firebase Console
        </button>
      </div>
    </div>
  );
};

export default FirebaseNotConfigured;