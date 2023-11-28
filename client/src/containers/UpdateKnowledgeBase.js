import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import styled from 'styled-components'
import PageHeader from '../components/PageHeader'
import MappingList from '../components/MappingList';

const Grid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 1em;
    margin: 0 30px;
`

const RightHalf = styled.div`
    display: grid;
    grid-template-rows: 1fr 3fr;
    row-gap: 2em;
    p {
        padding: 10px;
        margin: 0;
    }
`

const Box = styled.div`
    padding: 15px;
    border: 5px solid white;
    font-family: 'Concert One', sans-serif;
    font-size: 30px;
`

const MappingsContainer = styled.div`
    border: 5px solid white;
    box-sizing: border-box;
    padding: 15px;
`

const UploadButton = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30%;
    height: 2em;
    border-radius: 20px;
    background-color: #4098d6;
    color: white;
    font-size: 25px;
    font-family: 'Concert One', sans-serif;
    border: 2px solid black;
    margin: 10px;
`

const UpdateButton = styled.button `
    padding: 10px;
    width: 15vw;
    border-radius: 20px;
    background-color: #39B045;
    color: white;
    font-size: 30px;
    font-family: 'Concert One', sans-serif;
    border: 2px solid black;
    cursor: pointer;
    float: right;
    margin: 20px 35px;
`

const MatchRow = styled.div`
    padding: 10px;
`

// TODO: conditionally render 2 columns of dropdowns with N rows (for N sheets in Excel file)
// TOOD: render first dropdown with available mappings
// TOOD: conditionally render second dropdown to have sheet names

const UpdateKnowledgeBase = () => {
    const [file, setFile] = useState(null)
    const [sheets, setSheets] = useState([])

    function onFileChange(event) {
        // Update the state
        setFile(event.target.files[0])
    };

    // On file upload (click the upload button)
    function onFileUpload(event) {
        event.preventDefault()

        // Check if a file is selected
        if (!file) {
            alert("Please select a file.");
            return;
        }

        // Read the file content
        var reader = new FileReader();
        reader.onload = function(e) {
            // Assuming the data is binary (e.g., an Excel file)
            const data = e.target.result;

            // Use xlsx to parse the Excel content
            const workbook = XLSX.read(data);
            const names = workbook.SheetNames;
            setSheets(workbook.SheetNames);
            // const sheetName = workbook.SheetNames[0];
            // const worksheet = workbook.Sheets[sheetName];
            console.log(workbook)
            console.log(names)
        };
        reader.readAsArrayBuffer(file);
        
        // const url = 'http://localhost:3000/uploadFile';
        // const formData = new FormData();
        // formData.append('file', file);
        // formData.append('fileName', file.name);
        // const config = {
        //     headers: {
        //         'content-type': 'multipart/form-data',
        //     },
        // };
        // axios.post(url, formData, config).then((response) => {
        //     console.log(response.data);
        // });
    };

    return (
        <div style={{ height: "fit-content"}}>
            <PageHeader title={"Update Knowledge Base"} />
            <Grid>
                <MappingsContainer>
                    <MappingList/>
                </MappingsContainer>
                <RightHalf>
                    <Box> 
                        <p> 1. Upload Excel File </p> 
                        <input 
                            type="file"
                            accept=".xlsx, .xls"
                            // style={{ display: 'none' }}
                            id="button-file"
                            onChange={onFileChange}
                        />
                        <button onClick={onFileUpload}>Upload</button>
                    </Box>
                    <Box> 
                        <p> 2. Match Mappings with Excel Sheets </p>
                        {sheets.map((idx) => (
                            <MatchRow key={idx}>
                                <label>
                                    <select>
                                        <option value="">Select a sheet</option>
                                        {/* Dynamically generate options based on sheet names */}
                                        {sheets.map((name, index) => (
                                            <option key={index} value={name}>
                                                {name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </MatchRow>
                        ))}
                    </Box>
                </RightHalf>
            </Grid>
            <UpdateButton> Update </UpdateButton>
        </div>
    );
}

export default UpdateKnowledgeBase;