import React, { useEffect, useState } from 'react';
import styled from 'styled-components'
import PageHeader from '../components/PageHeader'
import MappingList from '../components/MappingList';

const Grid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 1em;
    margin: 0 15px;
    // padding: 10px;
`

const RightHalf = styled.div`
    display: grid;
    grid-template-rows: 1fr 3fr;
    row-gap: 2em;
    div {
        padding: 15px;
        border: 5px solid white;
        font-family: 'Concert One', sans-serif;
        font-size: 30px;
    }
`

const MappingsContainer = styled.div`
    height: 80vh;
    border: 5px solid white;
    box-sizing: border-box;
    padding: 15px;
`

const Button = styled.button `
    padding: 10px 1em;
    width: 15vw;
    border-radius: 20px;
    background-color: #39B045;
    color: white;
    font-size: 30px;
    font-family: 'Concert One', sans-serif;
    border: 2px solid black;
    cursor: pointer;
    float: right;
    margin-right: 15px;
`

// TODO: conditionally render 2 columns of dropdowns with N rows (for N sheets in Excel file)
// TOOD: render first dropdown with available mappings
// TOOD: conditionally render second dropdown to have sheet names

export default function Landing() {
    return (
        <>
            <PageHeader title={"Update Knowledge Base"} />
            <Grid>
                <MappingsContainer>
                    <MappingList/>
                </MappingsContainer>
                <RightHalf>
                    <div> 1. Upload File </div>
                    <div> 2. Match Mappings with Excel Sheets </div>
                </RightHalf>
            </Grid>
            <Button> Update </Button>
        </>
    );
}