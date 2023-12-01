import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from "react-router-dom";
import styled from 'styled-components';

import PageHeader from '../components/PageHeader';
import MappingList from '../components/MappingList';
import TextInput from '../components/TextInput';
import MappingService from '../services/MappingService';
import PopUpModal from '../components/PopUpModal';

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
    height: 80vh;
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
    height: 80vh;
`

const UpdateButton = styled.button `
    padding: 10px;
    width: 12vw;
    border-radius: 20px;
    background-color: #39B045;
    color: white;
    font-size: 20px;
    font-family: 'Concert One', sans-serif;
    border: 2px solid black;
    cursor: pointer;
    float: right;
    margin: 20px;
`

const initialNewMapping = {
  query_name: '',
  read_query: '',
  write_query: '',
};

const initialModal = {
  show: false,
  success: true,
  successText: '',
  errorText: '',
}

const CreateMapping = () => {
    const { state } = useContext(Ctx);

    const [modal, setModal] = useState(initialModal);
    const [mappings, setMappings] = useState([]);
    const [newMapping, setNewMapping] = useState(initialNewMapping)
    const { query_name, read_query, write_query } = newMapping;
    const disabled = query_name.length === 0 || read_query.length === 0 || write_query.length === 0

    const fetchMappings = async () => {
      try {
        const res = await MappingService.getAllMappings();
        const filteredMappings = res.filter((obj) => obj.owner_uuid === state.user.email);
        setMappings(filteredMappings)
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

    const submit = async () => {
      const mappingData = {
        name: query_name,
        owner_uuid: state.user.email,
        read_query: read_query,
        write_query: write_query,
      }
      console.log(mappingData);
      try {
        await MappingService.createMapping(mappingData);
        setModal((prev) => ({
          ...prev,
          show: true,
          success: true,
          successText: 'Created mapping successfully',
        }))
        setNewMapping(initialNewMapping);
        fetchMappings();
      } catch (e) {
        console.log(e);
        setModal((prev) => ({
          ...prev,
          show: true,
          success: false,
          errorText: 'An error occurred trying to create the mappings',
        }))
      };
    }

    const closeModal = () => setModal(initialModal)

    const handleChange = (e) => {
      const { name, value } = e.target;
      setNewMapping((prev) => ({
        ...prev,
        [name]: value,
      }));
      console.log(newMapping);
    };

    useEffect(() => {
      fetchMappings();
    }, [])

    if (state.user === null || !state.user.admin) {
      return <Navigate to="/" replace />;
    }

    return (
      <div style={{ height: "fit-content"}}>
          <PopUpModal
            isOpen={modal.show}
            closeModal={closeModal}
            success={modal.success}
            successText={modal.successText}
            errorText={modal.errorText}
          />
          <PageHeader title={"Create Mappings"} />
          <Grid>
              <MappingsContainer>
                  <MappingList data={mappings}/>
              </MappingsContainer>
              <RightHalf>
                  <Box>
                      <p> New Mapping Definition </p>
                      <TextInput
                        value={query_name}
                        placeholder="Enter query name"
                        label="Query Name"
                        name="query_name"
                        onChange={handleChange}
                      />
                      <TextInput
                        value={read_query}
                        placeholder="Enter read query"
                        label="Read Query"
                        name="read_query"
                        onChange={handleChange}
                      />
                      <TextInput
                        value={write_query}
                        placeholder="Enter write query"
                        label="Write Query"
                        name="write_query"
                        onChange={handleChange}
                      />
                      <UpdateButton
                        onClick={submit}
                        disabled={disabled}
                        style={{backgroundColor: disabled ? 'gray': '#39B045'}}
                      >
                        Create Mapping
                      </UpdateButton>
                  </Box>
              </RightHalf>
          </Grid>

      </div>
    );
}

export default CreateMapping;
