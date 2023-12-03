import React, { useEffect, useState, useContext } from 'react';
import { Navigate } from "react-router-dom";
import Axios from 'axios';
import * as XLSX from 'xlsx';
import styled from 'styled-components'
import PageHeader from '../components/PageHeader'
import MappingList from '../components/MappingList';

import { Ctx } from '../components/StateProvider';
import MappingService from '../services/MappingService';
import PopUpModal from '../components/PopUpModal';

import { BASE_URL } from '../config';

const axios = Axios.create({
	baseURL: BASE_URL,
});

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

const UploadButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 20px;
    border-radius: 10px;
    background-color: #4098d6;
    color: white;
    font-size: 20px;
    font-family: 'Concert One', sans-serif;
    border: 2px solid black;
    margin: 10px;
    cursor: pointer;
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

const Dropdown = styled.select`
    width: 100%;
`

const initialModal = {
    show: false,
    success: true,
    successText: '',
    errorText: '',
}

// TODO Store the sheet to mapping pairs somewhere
const UpdateKnowledgeBase = () => {

    const [modal, setModal] = useState(initialModal);
    const [file, setFile] = useState(null)
    const [sheets, setSheets] = useState([])
    const [mappings, setMappings] = useState([])
    // a pair = {sheet name, mapping}
    const [dropdownPairs, setDropdownPairs] = useState([{sheetName: '', mappingName: '' }]);
    const disabled = file === null;

    const fetchMappings = async () => {
        try {
            const res = await MappingService.getAllMappings();
            setMappings(res)
        } catch(e) {
            console.log(e);
            setModal((prev) => ({
                ...prev,
                show: true,
                success: false,
                errorText: 'An error occurred trying to fetch the mappings',
            }))
        }
    }

    const closeModal = () => setModal(initialModal)

    useEffect(() => {
        fetchMappings();
    }, []); // empty dependency array ensures that this effect runs once when the component mounts

    function onFileChange(event) {
        // Update the state
        setFile(event.target.files[0])
    };

    // On file upload (click the upload button)
    function onFileUpload(event) {
        event.preventDefault()

        // Read the file content
        var reader = new FileReader();
        reader.onload = function(e) {
            const data = e.target.result;

            // Use xlsx to parse the Excel content
            const workbook = XLSX.read(data);
            const names = workbook.SheetNames;
            setSheets(workbook.SheetNames);

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
        
        const formData = new FormData();
        const fileInput = document.getElementById('file-input');
        formData.append('file', fileInput.files[0]);
        formData.append('pairs', dropdownPairs);

        axios.post('/tables/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
        }).then(response => {
            console.log('Server response:', response.data);
            setModal((prev) => ({
                ...prev,
                show: true,
                success: true,
                successText: 'Uploaded data successfully',
            }))
        }).catch(error => {
            console.error('Error:', error);
            setModal((prev) => ({
                ...prev,
                show: true,
                success: false,
                errorText: 'Failed to update knowledge base',
            }))
        });
    }

    const { state } = useContext(Ctx);

    if (state.user === null || !state.user.admin) {
        return <Navigate to="/" replace />;
    }

    return (
        <div style={{ height: "fit-content"}}>
            <PageHeader title={"Update Knowledge Base"} />
                <PopUpModal
                isOpen={modal.show}
                closeModal={closeModal}
                success={modal.success}
                successText={modal.successText}
                errorText={modal.errorText}
            />
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
                            id="file-input"
                            onChange={onFileChange}
                        />
                        <UploadButton disabled={disabled} onClick={onFileUpload} style={{backgroundColor: disabled ? 'gray': '#4098d6'}} >Upload</UploadButton>
                    </Box>
                    <Box>
                        <p> 2. Match Mappings with Excel Sheets </p>
                        <MatchBox>
                            {sheets.map((sheetName, idx) => (
                                <MatchRow key={idx}>
                                    <label htmlFor="sheets">
                                        <Dropdown name="sheets" id={`sheets-${idx}`}
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
                                        </Dropdown>
                                    </label>
                                    <label htmlFor="mappings">
                                        <Dropdown name="mappings" id={`mappings-${idx}`}
                                            // value={value}
                                            onChange={(e) => handleMapSelect(e, idx)}
                                            required
                                        >
                                            <option value="placeholder">Select a mapping</option>
                                            {/* Generate options based on mappings */}
                                            {mappings.map((item) => (
                                                <option
                                                    key={item.uuid}
                                                    value={item.write_query}
                                                >
                                                    {item.write_query}
                                                </option>
                                            ))}
                                        </Dropdown>
                                    </label>
                                </MatchRow>
                            ))}
                        </MatchBox>
                    </Box>
                </RightHalf>
            </Grid>
            <UpdateButton
                onClick={handleUpdateClick}
                disabled={disabled}
                style={{backgroundColor: disabled ? 'gray': '#39B045'}}
            > Update </UpdateButton>
        </div>
    );
}

export default UpdateKnowledgeBase;
