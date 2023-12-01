import React from 'react';
import styled from 'styled-components'


const ScrollableContainer = styled.div`
    max-height: 70vh;
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
`

const Query = styled.li `
    padding: 10px;
    margin: 5px;
`

const QueryName = styled.p`
  font-weight: bold;
  margin-bottom: 0px;
  font-size: 22px;
`

const QueryDetails = styled.p `
  margin: 0px;
  margin-left: 10px;
`

const MappingList = ({ data }) => {
  return (
    <div>
      <Header> SPARQL Mappings</Header>
      <ScrollableContainer>
        <ol>
            {data.map(item => (
                // Assuming each item has a 'mapping' property
                <Query key={item.uuid}>
                  <QueryName>{item.name}:</QueryName>
                  <QueryDetails><strong style={{marginRight: '5px'}}>Created by:</strong>{item.owner_uuid}</QueryDetails>
                  <QueryDetails><strong style={{marginRight: '5px'}}>Read Query:</strong>{item.read_query} </QueryDetails>
                  <QueryDetails><strong style={{marginRight: '5px'}}>Write Query:</strong>{item.write_query}</QueryDetails>
                </Query>
            ))}
        </ol>
      </ScrollableContainer>
    </div>
  );
};

export default MappingList;
