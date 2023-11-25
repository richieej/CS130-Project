import React from "react";
import { Link } from 'react-router-dom';
import styled from 'styled-components'

const Container = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const Logo = styled.h1`
    font-size: 150px;
    font-family: 'Bungee', sans-serif;
    color: black;
    text-align: center;
    margin: 0;
`

const Slogan = styled.h2`
    text-align: center;
    font-size: 30px;
    font-style: italic;
    margin-top: 0;
`

const ButtonContainer = styled.div`
    display: flex;
    width: 40%;
    justify-content: space-between;
    margin: 2em;
`

const Button = styled.button `
    padding: 10px 1em;
    width: 15vw;
    border-radius: 20px;
    background-color: black;
    color: white;
    font-size: 30px;
    font-family: 'Concert One', sans-serif;
    border: 2px solid black;
    cursor: pointer;
`

export default function Landing() {
    return (
        <Container>
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
        </Container>
    );
}
