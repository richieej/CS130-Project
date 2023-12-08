import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoogleAuthButton from './GoogleAuthButton';

// Mock the useJwt hook
jest.mock('react-jwt', () => ({
  useJwt: (token) => ({
    decodedToken: token ? { sub: 'user123', email: 'test@example.com' } : null,
  }),
}));

// Mock the Google Sign-In API functions
window.google = {
  accounts: {
    id: {
      initialize: jest.fn(),
      renderButton: jest.fn(),
      prompt: jest.fn(),
    },
  },
};

describe('GoogleAuthButton', () => {
  it('renders the Google Auth button and handles user authentication', async () => {
    const setUserMock = jest.fn();

    // Render the GoogleAuthButton component
    const { container } = render(<GoogleAuthButton setUser={setUserMock} />);

    // Check if the Google Sign-In API functions are called
    await waitFor(() => {
      expect(window.google.accounts.id.initialize).toHaveBeenCalled();
      expect(window.google.accounts.id.renderButton).toHaveBeenCalled();
      expect(window.google.accounts.id.prompt).toHaveBeenCalled();
    });

    // Click the Google Auth button
    const buttonDiv = container.querySelector('#buttonDiv');
    userEvent.click(buttonDiv);

    // Check if setUser is called with the decoded token
    await waitFor(() => {
      expect(setUserMock).toHaveBeenCalled();
    });
  });
});
