import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from './Login';
import { Ctx } from '../components/StateProvider';
import UserService from '../services/UserService';
import SessionStorage from '../utils/SessionStorage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../services/UserService');

jest.mock('../utils/SessionStorage', () => ({
  storeItem: jest.fn(),
}));

const mockContextValue = {
  state: {
    user: { email: 'test@email.com', firstName: 'felonius', lastName: 'gru', admin: true },
  },
};

describe('Login Component', () => {
  it('renders without crashing', () => {
    render(
      <Router>
        <Ctx.Provider value={mockContextValue}>
          <Login />
        </Ctx.Provider>
      </Router>
    );
  });
});
