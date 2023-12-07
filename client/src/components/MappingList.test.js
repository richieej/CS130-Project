import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import MappingList from './MappingList';
import '@testing-library/jest-dom/extend-expect';


// Mock data for testing
const mockData = [
  {
    uuid: '1',
    name: 'Mapping 1',
    owner_uuid: 'user1',
    read_query: 'SELECT * FROM table1',
    write_query: 'INSERT INTO table1 (column1) VALUES ("value1")',
  },
  // Add more mock data as needed
];

describe('MappingList', () => {
  test('renders mappings correctly', () => {
    const { getByText, queryByText } = render(
      <MappingList data={mockData} clickable={true} selected={null} setSelected={() => {}} />
    );

    // Check if the header is rendered
    expect(getByText('SPARQL Mappings')).toBeInTheDocument();

    // Check if each mapping is rendered
    mockData.forEach((item) => {
      expect(getByText(`${item.name}:`)).toBeInTheDocument();
      expect(getByText(`${item.owner_uuid}`)).toBeInTheDocument();
      expect(getByText(`${item.read_query}`)).toBeInTheDocument();
      expect(getByText(`${item.write_query}`)).toBeInTheDocument();
    });

    // Check if the "No mappings to show" message is not rendered
    expect(queryByText('No mappings to show')).toBeNull();
  });

  test('handles click events correctly', () => {
    const setSelectedMock = jest.fn();
    const { getByText } = render(
      <MappingList data={mockData} clickable={true} selected={null} setSelected={setSelectedMock} />
    );

    // Click on a mapping item
    fireEvent.click(getByText('Mapping 1:'));

    // Check if setSelected is called with the correct arguments
    expect(setSelectedMock).toHaveBeenCalledWith({
      uuid: '1',
      query_name: 'Mapping 1',
      read_query: 'SELECT * FROM table1',
      write_query: 'INSERT INTO table1 (column1) VALUES ("value1")',
    });
  });

  test('handles no mappings correctly', () => {
    const { getByText } = render(<MappingList data={[]} clickable={true} selected={null} setSelected={() => {}} />);

    // Check if the "No mappings to show" message is rendered
    expect(getByText('No mappings to show')).toBeInTheDocument();
  });
});
