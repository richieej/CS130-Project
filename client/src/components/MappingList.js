import React, { useState, useEffect } from 'react';
import styled from 'styled-components'


const ScrollableContainer = styled.div`
    max-height: 90vh;
    max-width: 100%;
    width: 40vw;
    overflow-y: auto;
    font-family: 'Courier Prime', monospace;
    font-size: 20px;
`

const Header = styled.h1 `
    font-family: 'Concert One', sans-serif;
    font-size: 40px;
    margin: 0;
    padding: 0;
`

const MappingList = () => {
    const tempData = [
        {mapping: "SELECT * FROM table1"},
        {mapping: "SELECT * FROM table2"},
        {mapping: "SELECT * FROM table3"},
        {mapping: "SELECT * FROM table4"},
        {mapping: "SELECT * FROM table5"},
        {mapping: "SELECT * FROM table6"},
        {mapping: "SELECT * FROM table7 SELECT * FROM table7"},
        {mapping: "SELECT * FROM table8"},
        {mapping: "SELECT * FROM table9 SELECT * FROM table9"},
        {mapping: "SELECT * FROM table10"},
        {mapping: "SELECT * FROM table11"},
        {mapping: "SELECT * FROM table12"},
    ]
    
    const [data, setData] = useState([]);

    useEffect(() => {
        // const fetchData = async () => {
        //     try {
        //     const response = await fetch('http://localhost:8080/mappings');
        //     const result = await response.json();
        //     setData(result.items); 
        //     } catch (error) {
        //     console.error('Error fetching data:', error);
        //     }
        // };
        // fetchData();
        setData(tempData)
    }, []); // empty dependency array ensures that this effect runs once when the component mounts

  return (
    <div>
      <Header> SPARQL Mappings</Header>
      <ScrollableContainer>
        <ul>
            {data.map(item => (
                // Assuming each item has a 'mapping' property
                <li> {item.mapping} </li>
            ))}
        </ul>
      </ScrollableContainer>
    </div>
  );
};

export default MappingList;
