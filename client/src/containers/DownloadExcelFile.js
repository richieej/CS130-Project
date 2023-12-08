import React, { useEffect, useState, useContext } from 'react';
import { Navigate } from "react-router-dom";
import Axios from 'axios';

import styled from 'styled-components'
import PageHeader from '../components/PageHeader'
import MappingList from '../components/MappingList';
import PopUpModal from '../components/PopUpModal';

import MappingService from '../services/MappingService';
import { Ctx } from '../components/StateProvider';

import { BASE_URL } from '../config';

const axios = Axios.create({
	baseURL: BASE_URL,
});


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
    width: 70%;
    height: 90vh;
    overflow-y: auto;

    div {
        padding-bottom: 2em;
    }
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

const initialModal = {
    show: false,
    success: true,
    successText: '',
    errorText: '',
}

const DownloadExcelFile = () => {
    const [modal, setModal] = useState(initialModal);
    const [mappings, setMappings] = useState([]);
    const [checked, setChecked] = useState([]);

    useEffect(() => {
        fetchMappings();
    }, [])

    const { state } = useContext(Ctx);

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

      
    // Add/Remove checked item from list
    const handleCheck = (event) => {
        console.log(event.target.value)
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
        console.log(checked)

        // Send selected mappings list to the server
        await axios.post('/tables/download', {mappings: checked}, {responseType: 'blob'})
            .then(response => {
                console.log(response.data)
                const url = window.URL.createObjectURL(response.data); 
                const a = document.createElement('a');
                a.href = url;
                a.download = "data.xlsx"  
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);

                setModal((prev) => ({
                    ...prev,
                    show: true,
                    success: true,
                    successText: 'Successfully created Excel file to download',
                }))
        })
        .catch (error => {
            console.log(error);
            setModal((prev) => ({
                ...prev,
                show: true,
                success: false,
                errorText: 'An error occurred trying to fetch the data',
            }))
        });
    };

    if (state.user === null) {
        return <Navigate to="/" replace />;
    }
    
    return (
        <div>
            <PageHeader title={"Download Excel File from Knowledge Base"} />
            <PopUpModal
                isOpen={modal.show}
                closeModal={closeModal}
                success={modal.success}
                successText={modal.successText}
                errorText={modal.errorText}
            />
            <Form>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="mapping-selection"> Select Mappings </label>
                    <ListContainer>
                        {mappings.map((item) => (
                            <div>
                                <input 
                                    id={item.uuid}
                                    key={item.uuid} 
                                    value={item.uuid} 
                                    type="checkbox" 
                                    onChange={handleCheck} />
                                <label for={item.uuid}> {item.read_query} </label>
                            </div>
                        ))}
                    </ListContainer>
                </form>

                <SubmitButton type="submit" onClick={handleSubmit}>
                    Submit
                </SubmitButton>
            </Form>
        </div>
    )
}

export default DownloadExcelFile;