import React, { useEffect, useState } from 'react';
import styled from 'styled-components'
import PageHeader from '../components/PageHeader'

const Form = styled.div`
    padding: 15px 50px;

    label {
        font-family: 'Concert One', sans-serif;
        font-size: 40px;
    }
`

const ListContainer = styled.div`
    font-family: 'Courier Prime', monospace;
    font-size: 20px;
    padding: 1em 0;
`

const SubmitButton = styled.button`
    padding: 5px;
    width: 10vw;
    border-radius: 20px;
    background-color: #39B045;
    color: white;
    font-size: 30px;
    font-family: 'Concert One', sans-serif;
    border: 2px solid black;
    cursor: pointer;
`

const DownloadExcelFile = () => {
    const [mappings, setMappings] = useState([]);
    const [checked, setChecked] = useState([]);

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
        setMappings(tempData)
    }, []); // empty dependency array ensures that this effect runs once when the component mounts

    // Add/Remove checked item from list
    const handleCheck = (event) => {
        var updatedList = [...checked];
        if (event.target.checked) {
            updatedList = [...checked, event.target.value];
        } else {
            updatedList.splice(checked.indexOf(event.target.value), 1);
        }
        setChecked(updatedList);
    };

    // TODO: send mappings to endpoint and get Excel file from endpoint
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Send selected mappings list to the server
        try {
            const response = await fetch('/api/submit-form', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(checked),
            });
    
            // Assuming the server responds with a file to download
            const fileBlob = await response.blob();

            // Create a blob URL for the file
            const fileUrl = URL.createObjectURL(fileBlob);

            // Create an anchor element to trigger download
            const downloadLink = document.createElement('a');
            downloadLink.href = fileUrl;
            downloadLink.download = 'data.xls'; // Set the file name

            // Append the anchor to the body and trigger the download
            document.body.appendChild(downloadLink);
            downloadLink.click();

            // Remove the anchor element from the body
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(fileUrl);
        } catch (error) {
            console.error('Error submitting selected mappings:', error);
        }
      };
    
    return (
        <div>
            <PageHeader title={"Download Excel File from Knowledge Base"} />
            <Form>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="mapping-selection"> Select Mappings </label>
                    <ListContainer>
                        {mappings.map((m, index) => (
                            <div key={index}>
                                <input value={m.mapping} type="checkbox" onChange={handleCheck} />
                                <span> {m.mapping} </span>
                            </div>
                        ))}
                    </ListContainer>
                </form>

                <SubmitButton type="submit">
                    Submit
                </SubmitButton>
            </Form>
        </div>
    )
}

export default DownloadExcelFile