import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { Ctx } from '../components/StateProvider';
import MappingService from '../services/MappingService';
import { BrowserRouter as Router } from 'react-router-dom';
import MappingList from '../components/MappingList';
import { act } from 'react-dom/test-utils';
import EditMapping from './EditMapping';

jest.mock('../services/MappingService'); // Mock MappingService to control its behavior

const mockContextValue = {
  state: {
    user: {email: "test@email.com", firstName: "felonius", lastName: "gru", admin: true},
  },
};

const mockSelected =   {
  uuid: '1',
  name: 'TestQuery1',
  read_query: 'SELECT * FROM TestTable1',
  write_query: 'INSERT INTO TestTable1 (col1, col2) VALUES (?, ?)',
  owner_uuid: 'user1@example.com',
};

const mockMappings = [
  // Mock mappings data for testing
  {
    uuid: '1',
    name: 'TestQuery1',
    read_query: 'SELECT * FROM TestTable1',
    write_query: 'INSERT INTO TestTable1 (col1, col2) VALUES (?, ?)',
    owner_uuid: 'user1@example.com',
  },
  {
    uuid: '2',
    name: 'TestQuery2',
    read_query: 'SELECT * FROM TestTable2',
    write_query: 'INSERT INTO TestTable2 (col1, col2) VALUES (?, ?)',
    owner_uuid: 'user2@example.com',
  },
];

describe('EditMapping component', () => {

  test('renders EditMapping component with no mappings', async () => {
    render(
    <Router>
      <Ctx.Provider value={mockContextValue}>
         <EditMapping/>
      </Ctx.Provider>
    </Router>
    );

    // Wait for mappings to be fetched
    await waitFor(() => screen.getByText('No mappings to show'));

    // Ensure that the component is rendered
    expect(screen.getByText('Edit Mappings')).toBeInTheDocument();
    expect(screen.getByText('No mappings to show')).toBeInTheDocument();
  });

  test('renders EditMapping component with mappings', async () => {
    render(<MappingList data={mockMappings}/>);
    render(
      <MemoryRouter initialEntries={['/edit-mapping']}>
        <Routes>
          <Route path="/edit-mapping" component={EditMapping} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for mappings to be fetched
    await waitFor(() => screen.getByText('TestQuery1:'));

    render(
      <Router>
        <Ctx.Provider value={mockContextValue}>
           <EditMapping/>
        </Ctx.Provider>
      </Router>
      );

    // Ensure that the component is rendered
    expect(screen.getByText('Edit Mappings')).toBeInTheDocument();
    expect(screen.getByText('TestQuery1:')).toBeInTheDocument();
  });

  test('renders the Edit Mapping Definition section when a mapping is selected', async () => {
    render(<MappingList clickable data={mockMappings} selected={mockMappings[0]} setSelected={() => {}} />);
    render(
      <MemoryRouter initialEntries={['/edit-mapping']}>
        <Routes>
          <Route path="/edit-mapping" element={<EditMapping />} />
        </Routes>
      </MemoryRouter>,
      { wrapper: ({ children }) => <Ctx.Provider value={mockContextValue}>{children}</Ctx.Provider> }
    );

    // Wait for mappings to be fetched
    await waitFor(() => screen.getByText('TestQuery1:'));

    // Select a mapping
    fireEvent.click(screen.getByText('TestQuery1:'));

    // render(<MappingList data={mockMappings} selected={mockMappings[0]} />);

    // Check if the "Edit Mapping Definition" section is rendered
    expect(screen.getByText('Edit Mappings')).toBeInTheDocument();
  });
});
