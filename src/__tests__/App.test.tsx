import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import App from '../App';

// Mock Firebase
vi.mock('../services/firebase', () => ({
  auth: {},
  db: {}
}));

// Mock Firebase services
vi.mock('../services/auth', () => ({
  authService: {
    onAuthStateChanged: vi.fn((callback) => {
      // Simulate auth state change with no user
      setTimeout(() => callback(null), 0);
      return () => {}; // Unsubscribe function
    }),
    getCurrentUser: vi.fn(() => null)
  }
}));

describe('App', () => {
  it('renders the food log application', async () => {
    render(<App />);
    
    // Wait for loading to complete and check for all Food Log elements
    await waitFor(() => {
      expect(screen.getAllByText('Food Log')).toHaveLength(2); // Nav and main header
    });
    
    // Check if the sign in button is present when not authenticated
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<App />);
    
    // Initially should show loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});