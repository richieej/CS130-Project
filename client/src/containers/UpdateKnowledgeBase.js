import React, { useEffect, useState, useContext } from 'react';
import { Navigate } from "react-router-dom";
import axios from 'axios';
import * as XLSX from 'xlsx';
import styled from 'styled-components'
import PageHeader from '../components/PageHeader'
import MappingList from '../components/MappingList';

import { Ctx } from '../components/StateProvider';

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

const MatchBox = styled.div`
    padding: 10px;
    max-height: 80%;
    overflow-y: auto;
`

const MatchRow = styled.div`
    padding: 10px;
`
// TODO Store the sheet to mapping pairs somewhere
const UpdateKnowledgeBase = () => {

    const [file, setFile] = useState(null)
    const [sheets, setSheets] = useState([])
    const [mappings, setMappings] = useState([])
    // a pair = {sheet name, mapping}
    const [dropdownPairs, setDropdownPairs] = useState([{sheetName: '', mappingName: '' }]);

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
        // setMappings(tempData)
    }, []); // empty dependency array ensures that this effect runs once when the component mounts

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
            const data = e.target.result;

            // Use xlsx to parse the Excel content
            const workbook = XLSX.read(data);
            const names = workbook.SheetNames;
            setSheets(workbook.SheetNames);
            console.log(workbook)
            console.log(names)

            // intialize pairings
            const initialPairs = names.reduce((acc, key) => {
                acc[key] = '';
                return acc;
            }, {});
            setDropdownPairs(initialPairs);
        };
        reader.readAsArrayBuffer(file);
    };

    function handleSheetSelect(event, row) {
        // console.log(dropdownPairs)

        const selectedSheet = event.target.value;
        const sheetIndex = event.target.selectedIndex - 1;
        console.log('Selected Sheet:', selectedSheet);
        console.log('Sheet Index:', event.target.selectedIndex);
        const mappingId = "mappings" + "-" + row;
        console.log("mapping element id:", mappingId);
        var correspondingMappingDropdown = document.getElementById(mappingId);

        const newPairs = {...dropdownPairs, [selectedSheet]: correspondingMappingDropdown.value};
        setDropdownPairs(newPairs);
    }

    function handleMapSelect(event, row) {
        // console.log(dropdownPairs)

        const selectedMapping = event.target.value;
        console.log('Selected Mapping:', selectedMapping);
        const sheetId = "sheets" + "-" + row;
        console.log("sheet element id:", sheetId)
        const sheetsDropdown = document.getElementById(sheetId);
        console.log(sheetsDropdown);
        const selectedSheet = sheetsDropdown.value;
        console.log(selectedSheet);

        const newPairs = {...dropdownPairs, [selectedSheet]: selectedMapping};
        setDropdownPairs(newPairs);
    }

    // TODO: submit dropdownPairs to server
    function handleUpdateClick() {
        console.log(dropdownPairs);

        axios.post('https://your-api-endpoint.com/your-route', { data: dropdownPairs })
            .then(response => {
                // Handle the server response
                console.log('Server response:', response.data);
                alert("Success!");
            })
            .catch(error => {
                // Handle errors
                console.error('Error sending data to server:', error);
                alert("Failed to update knowledge base. Please try again.");
            });
    }

    const { state } = useContext(Ctx);

    if (state.user === null || !state.user.admin) {
        return <Navigate to="/" replace />;
    }

    return (
        <div style={{ height: "fit-content"}}>
            <PageHeader title={"Update Knowledge Base"} />
            <Grid>
                <MappingsContainer>
                    <MappingList data={mappings}/>
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
                        <MatchBox>
                            {sheets.map((sheetName, idx) => (
                                <MatchRow key={idx}>
                                    <label htmlFor="sheets">
                                        <select name="sheets" id={`sheets-${idx}`}
                                            onChange={(e) => handleSheetSelect(e, idx)}
                                            required
                                        >
                                            <option value="placeholder">Select a sheet</option>
                                            {/* Dynamically generate options based on sheet names */}
                                            {sheets.map((sheetName, index) => (
                                                <option key={index} value={sheetName}>
                                                    {sheetName}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label htmlFor="mappings">
                                        <select name="mappings" id={`mappings-${idx}`}
                                            // value={value}
                                            onChange={(e) => handleMapSelect(e, idx)}
                                            required
                                        >
                                            <option value="placeholder">Select a mapping</option>
                                            {/* Generate options based on mappings */}
                                            {mappings.map((m, index) => (
                                                <option
                                                    key={index}
                                                    value={m.mapping}
                                                >
                                                    {m.mapping}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </MatchRow>
                            ))}
                        </MatchBox>
                    </Box>
                </RightHalf>
            </Grid>
            <UpdateButton onClick={handleUpdateClick} > Update </UpdateButton>
        </div>
    );
}

export default UpdateKnowledgeBase;
