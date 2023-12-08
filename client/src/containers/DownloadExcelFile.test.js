import React from 'react';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { Ctx } from '../components/StateProvider';
import DownloadExcelFile from './DownloadExcelFile'; // Import the component directly, no need for `.default`
import '@testing-library/jest-dom/extend-expect'
import { contextType } from 'react-modal';
import MappingService from '../services/MappingService';

// Mocking axios
jest.mock("axios", () => ({
    ...jest.requireActual("axios"),
    post: jest.fn(),
  }));

// Mock the context value
const mockContextValue = {
  state: {
    user: {email: "test@email.com", firstName: "felonius", lastName: "gru", admin: true},
  },
};

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

const mockMappings = [
    { uuid: '1', read_query: 'Mapping 1' },
    { uuid: '2', read_query: 'Mapping 2' },
  ];

function mockGetAllMappings() {return jest.fn(() => mockMappings)};

jest.mock('../services/MappingService', () => ({
    ...jest.requireActual('../services/MappingService'),
    getAllMappings: mockGetAllMappings,
}));

// // Mock the module that exports the context
// jest.mock('../components/StateProvider', () => ({
//   Ctx: {
//     Provider: ({ children }) => children,
//     Consumer: ({ children }) => children(mockContextValue),
//   }
// }));

describe('DownloadExcelFile', () => {
    beforeEach(() => {
        jest.spyOn(axios, 'post').mockResolvedValue({ data: new Blob() });
    });

    it('fetches and displays mappings', async () => {
        // Mock the response from the server
        DownloadExcelFile.fetchMappings = jest.fn().mockResolvedValue(mockMappings);
    
        const dispatch = jest.fn();
        const state = mockContextValue.state;
    
        render(<Ctx.Provider value={{state, dispatch}}><DownloadExcelFile/></Ctx.Provider>);
    
        // Wait for mappings to be fetched
        await waitFor(() => expect(screen.getByText('Mapping 1')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Mapping 2')).toBeInTheDocument());
    });

    it('handles form submission without selecting mappings', async () => {
        render(<Ctx.Provider value={{state: mockContextValue.state, dispatch: jest.fn()}}><DownloadExcelFile/></Ctx.Provider>);
    
        // Submit the form without selecting mappings
        userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    
        // Ensure that axios.post is not called
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('handles form submission with selected mappings', async () => {
        // Mock the server response when the form is submitted
        jest.spyOn(axios, 'post').mockResolvedValue({ data: new Blob() });
      
        await act(async () => {
          render(
            <Ctx.Provider value={{ state: mockContextValue.state, dispatch: jest.fn() }}>
              <DownloadExcelFile />
            </Ctx.Provider>
          );
        });
      
        // Wait for mappings to be fetched
        await waitFor(() => expect(screen.getByText('Mapping 1')).toBeInTheDocument());
      
        // Mock user checking checkboxes
        userEvent.click(screen.getByLabelText('Mapping 1'));
      
        // Submit the form
        await act(async () => {
          fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
        });
      
        // Wait for the modal to be displayed
        await waitFor(() => {
          expect(screen.queryByText('An error occurred trying to fetch the data')).not.toBeInTheDocument();        
        });      
      });

//   it('renders the component and handles form submission', async () => {
//     // Mocking the response from the server

//     // Mock fetchMappings
//     DownloadExcelFile.fetchMappings = jest.fn().mockResolvedValue(mockMappings);

//     const dispatch = jest.fn();
//     const state = mockContextValue.state;

//     render(<Ctx.Provider value={{state, dispatch}}><DownloadExcelFile/></Ctx.Provider>);

//     // Wait for mappings to be fetched
//     await waitFor(() => expect(screen.getByText('Mapping 1')).toBeInTheDocument());
//     await waitFor(() => expect(screen.getByText('Mapping 2')).toBeInTheDocument());

//     // Mock user checking checkboxes
//     userEvent.click(screen.getByLabelText('Mapping 1'));
//     userEvent.click(screen.getByLabelText('Mapping 2'));

//     // Submit the form
//     userEvent.click(screen.getByRole('button', { name: 'Submit' }));

//     // Mock the server response when the form is submitted

//   // Log axios.post calls
//   jest.spyOn(axios, 'post').mockResolvedValue({ data: new Blob() });

//   // Wait for the modal to be displayed
//   await waitFor(() => {
//     console.log('Modal is displayed:', screen.getByRole('dialog'));
//     expect(screen.getByRole('dialog')).toBeInTheDocument();
//   });
});
