import React from 'react';
import styled from 'styled-components'


const ScrollableContainer = styled.div`
    max-height: 100vh;
    max-width: 100%;
    width: 100%;
    overflow-y: auto;
    font-family: 'Courier Prime', monospace;
    font-size: 20px;
    margin-right: 0px;
`

const Header = styled.h1 `
    font-family: 'Concert One', sans-serif;
    font-size: 40px;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
`

const QueryList = styled.ol`
    padding-left: 50px;
`

const Query = styled.li `
    padding: 10px;
    margin: 5px;
`

const QueryButton = styled.button`
    cursor: pointer;
    background: none;
    border: none;
    font-family: 'Courier Prime', monospace;
    font-size: 20px;
    margin-right: 0px;
    display: flex;
    flex-direction: column;
`

const QueryName = styled.p`
    font-weight: bold;
    margin-bottom: 0px;
    font-size: 22px;
`

const QueryDetails = styled.p `
    margin: 0px;
    margin-left: 15px;
    margin-top: 7px;
`

const None = styled.p`
    display: flex;
    justify-content: center;
    font-weight: bold;
    font-size: 30px;
`

const MappingList = ({ data, clickable, selected, setSelected }) => {
  const handleClick = (item) => {
    const selectedItem = {
      uuid: item.uuid,
      query_name: item.name,
      read_query: item.read_query,
      write_query: item.write_query
    };

    if (JSON.stringify(selectedItem) !== JSON.stringify(selected))
      setSelected(selectedItem);
    else
      setSelected(null);
  }

  return (
    <div>
      <Header> SPARQL Mappings</Header>
      <ScrollableContainer>
        {data.length > 0 ? (
          <QueryList>
            {data.map(item => (
                <Query key={item.uuid}>
                  {clickable ? (
                    <QueryButton onClick={() => handleClick(item)}>
                      <QueryName>{item.name}:</QueryName>
                      <QueryDetails><strong style={{marginRight: '5px'}}>Created by:</strong>{item.owner_uuid}</QueryDetails>
                      <QueryDetails><strong style={{marginRight: '5px'}}>Read Query:</strong>{item.read_query} </QueryDetails>
                      <QueryDetails><strong style={{marginRight: '5px'}}>Write Query:</strong>{item.write_query}</QueryDetails>
                    </QueryButton>
                  ) : (
                    <>
                      <QueryName>{item.name}:</QueryName>
                      <QueryDetails><strong style={{marginRight: '5px'}}>Created by:</strong>{item.owner_uuid}</QueryDetails>
                      <QueryDetails><strong style={{marginRight: '5px'}}>Read Query:</strong>{item.read_query} </QueryDetails>
                      <QueryDetails><strong style={{marginRight: '5px'}}>Write Query:</strong>{item.write_query}</QueryDetails>
                    </>
                  )}
                </Query>
            ))}
          </QueryList>
        ) : (
          <None>No mappings to show</None>
        )}
      </ScrollableContainer>
    </div>
  );
};

export default MappingList;
