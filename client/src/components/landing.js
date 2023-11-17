import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import styled from 'styled-components'

const Logo = styled.h1`
    font-size: 150px;
    font-family: 'Bungee', sans-serif;
    color: black;
    text-align: center;
    margin: auto;
    padding-top: 1.5em;
`

const Slogan = styled.h2`
    text-align: center;
    font-size: 30px;
    font-style: italic;
`

const ButtonContainer = styled.div`
    display: flex;
    margin: auto;
    justify-content: center;
`

const Button = styled.button `
    padding: 10px 1em;
    margin: 2em;
    width: 15vw;
    border-radius: 20px;
    background-color: black;
    color: white;
    font-size: 30px;
    font-family: 'Concert One', sans-serif;
    border: 2px solid black;
`

export default function Landing() {
    return (
        <div style={{ backgroundColor: "#f0ada8"}}>
            <Logo>EXCQL</Logo>
            <Slogan>Where Excel Meets Query, Simplifying Data Management for Non-Database Experts!</Slogan>
            <ButtonContainer>
                <Link to = "/login">
                    <Button> Login </Button>
                </Link>
                <Link to = "/signup">
                    <Button> New User </Button>
                </Link>
            </ButtonContainer>
        </div>
    );
}
