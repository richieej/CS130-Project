import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route } from 'react-router-dom';
import { Ctx } from '../components/StateProvider';

import { BrowserRouter as Router } from 'react-router-dom';
import SignUp from './SignUp';
import UserService from '../services/UserService';

jest.mock('../services/UserService', () => ({
  ...jest.requireActual('../services/UserService'),
  createUser: jest.fn(),
}));

const mockContextValue = {
    state: {
      user: { email: 'test@email.com', firstName: 'felonius', lastName: 'gru', admin: true },
    },
  };

describe('SignUp Component', () => {
  it('renders without crashing', () => {
    render(
        <Router>
          <Ctx.Provider value={mockContextValue}>
            <SignUp />
          </Ctx.Provider>
        </Router>
      );
  });
});
