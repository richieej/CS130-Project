import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPage from './LandingPage';
import { Ctx } from '../components/StateProvider';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock the StateProvider with Logged In User
const mockContextValueLoggedInAdmin = {
    state: {
      user: {email: "test@email.com", firstName: "felonius", lastName: "gru", admin: true},
    },
    dispatch: jest.fn(),
};

const mockContextValueLoggedInNonAdmin = {
    state: {
      user: {email: "reguser@email.com", firstName: "powell", lastName: "cat", admin: false},
    },
    dispatch: jest.fn(),
};

const mockContextValueLoggedOut = {
    state: {
      user: null,
    },
    dispatch: jest.fn(),
};


describe('Landing component', () => {
  test('renders with a logged-out user', () => {
    render(
    <Ctx.Provider value={mockContextValueLoggedOut}>
        <Router>
            <LandingPage/>
        </Router>
    </Ctx.Provider>
    );

    // Check if the logo and slogan are rendered
    expect(screen.getByText('EXCQL')).toBeInTheDocument();
    expect(
      screen.getByText('Where Excel Meets Query, Simplifying Data Management for Non-Database Experts!')
    ).toBeInTheDocument();

    // Check if login and signup buttons are rendered
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('New Admin User')).toBeInTheDocument();
    expect(screen.getByText('New Regular User')).toBeInTheDocument();
  });

  test('renders with a logged-in admin user', () => {
    // Mock the StateProvider with a logged-in user

    render(
    <Ctx.Provider value={mockContextValueLoggedInAdmin}>
        <Router>
            <LandingPage/>
        </Router>
    </Ctx.Provider>
    );

    // Check if the logo and slogan are rendered
    expect(screen.getByText('EXCQL')).toBeInTheDocument();
    expect(
      screen.getByText('Where Excel Meets Query, Simplifying Data Management for Non-Database Experts!')
    ).toBeInTheDocument();

    // Check if update, download, create, and edit buttons are rendered for an admin user
    expect(screen.getByText('Update Knowledge Base')).toBeInTheDocument();
    expect(screen.getByText('Download Data')).toBeInTheDocument();
    expect(screen.getByText('Create Mappings')).toBeInTheDocument();
    expect(screen.getByText('Edit Mappings')).toBeInTheDocument();
  });

  test('renders with a non-admin user', () => {
    // Mock the StateProvider with a non-admin user
    render(
        <Ctx.Provider value={mockContextValueLoggedInNonAdmin}>
            <Router>
                <LandingPage/>
            </Router>
        </Ctx.Provider>
    );

    // Check if the logo and slogan are rendered
    expect(screen.getByText('EXCQL')).toBeInTheDocument();
    expect(
      screen.getByText('Where Excel Meets Query, Simplifying Data Management for Non-Database Experts!')
    ).toBeInTheDocument();

    // Check if update and download buttons are rendered for a non-admin user
    expect(screen.getByText('Update Knowledge Base')).toBeInTheDocument();
    expect(screen.getByText('Download Data')).toBeInTheDocument();

    // Check if create and edit buttons are NOT rendered for a non-admin user
    expect(screen.queryByText('Create Mappings')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit Mappings')).not.toBeInTheDocument();
  });

  test('logout button works', () => {

    render(
    <Ctx.Provider value={mockContextValueLoggedInAdmin}>
        <Router>
            <LandingPage/>
        </Router>
    </Ctx.Provider>
    );

    // Click the logout button
    fireEvent.click(screen.getByText('Logout'));

    // Check if dispatch is called
    expect(mockContextValueLoggedInAdmin.dispatch).toHaveBeenCalledWith({
      type: 'SET_USER',
      user: null,
    });
  });
});
