import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
// import { debug } from '@testing-library/react';  
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import CreateMapping from './CreateMapping';
import { Ctx } from '../components/StateProvider';
import MappingService from '../services/MappingService';

jest.mock('../services/MappingService', () => ({
  getAllMappings: jest.fn(),
  createMapping: jest.fn(),
}));

jest.mock('../components/MappingList', () => {
    return jest.fn(() => <div data-testid="mapping-list-mock"></div>);
  });

// Mock the context value
const mockContextValue = {
    state: {
      user: {email: "test@email.com", firstName: "felonius", lastName: "gru", admin: true},
    },
    dispatch: jest.fn(),
};

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

describe('CreateMapping component', () => {
  it('renders without crashing', async () => {
    act(() => {
    render(
        <Router>
            <Ctx.Provider value={mockContextValue}>
               <CreateMapping/>
            </Ctx.Provider>
        </Router>
       );
    });

    expect(screen.getByText('Create Mappings')).toBeInTheDocument();

  });

  it('handles input changes and submit button click', async () => {

    render(
     <Ctx.Provider value={mockContextValue}>
        <Router>
            <CreateMapping/>
        </Router>
     </Ctx.Provider>
    );

    // Wait for the component to be fully rendered
    await act(async () => {
        screen.getByPlaceholderText("Enter query name").value = 'TestQuery';
        fireEvent.change(screen.getByPlaceholderText("Enter query name"));

        screen.getByPlaceholderText("Enter read query").value = 'SELECT * FROM test';
        fireEvent.change(screen.getByPlaceholderText("Enter read query"));

        screen.getByPlaceholderText("Enter write query").value = 'INSERT INTO test VALUES (1, "test")';
        fireEvent.change(screen.getByPlaceholderText("Enter write query"));
    });

    await act(async () => {
        // Simulate button click
        fireEvent.click(screen.getByText('Create Mapping'));
    
        // No errors occurred
        await waitFor(() => {
            expect(screen.queryByText('An error occurred trying to create the mappings')).not.toBeInTheDocument();
        });
    });
  });

  it('displays an error message if fetching mappings fails', async () => {
    MappingService.getAllMappings.mockRejectedValue(new Error('Fetch error'));
  
    render(
      <Router>
        <Ctx.Provider value={mockContextValue}>
          <CreateMapping />
        </Ctx.Provider>
      </Router>
    );
  
    // Ensure an error message is displayed
    await waitFor(() => {
      expect(screen.getByText('An error occurred trying to fetch the mappings')).toBeInTheDocument();
    });
  });
});
