import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import ErrorBoundary from './components/ErrorBoundary';
import DebugApp from './components/DebugApp';

const App: React.FC = () => {
  console.log('App component rendering - Debug Mode');
  
  return (
    <ErrorBoundary>
      <DebugApp />
      <Analytics />
    </ErrorBoundary>
  );
};

export default App;