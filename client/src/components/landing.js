import React, { useState, useEffect } from "react";
import styled from 'styled-components'

const Logo = styled.h1`
    font-size: 120px;
    font-family: 'Bungee', sans-serif;
    color: black;
    text-align: center;
    margin: auto;
    padding-top: 1.5em;
`

const ButtonContainer = styled.div`
    display: flex;
    margin: auto;
    justify-content: center;
`

const Button = styled.button `
    padding: 10px 1em;
    margin: 2em;
    width: 20vw;
    border-radius: 20px;
    background-color: #f0ada8;
    font-size: 30px;
    font-family: 'Concert One', sans-serif;
`

export default function Landing() {
    return (
        <div>
            <Logo>EXCQL</Logo>
            <ButtonContainer>
                <Button> Login </Button>
                <Button> New User </Button>
            </ButtonContainer>
        </div>
    );
}