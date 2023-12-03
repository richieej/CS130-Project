import React, { useContext } from "react";
import { Link } from 'react-router-dom';
import styled from 'styled-components'

import LogoutButton from "../components/LogoutButton";

import { Ctx } from '../components/StateProvider';
import SessionStorage from "../utils/SessionStorage";
import PageHeader from "../components/PageHeader";

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
    width: 60%;
    justify-content: space-between;
    margin: 2em;
`

const Button = styled.button `
    padding: 10px 1em;
    width: 14vw;
    border-radius: 20px;
    background-color: black;
    color: white;
    font-size: 20px;
    font-family: 'Concert One', sans-serif;
    border: 2px solid black;
    cursor: pointer;
    margin: auto;
`

export default function Landing() {
    const { state, dispatch } = useContext(Ctx);

    const logout = () => {
        SessionStorage.storeItem("user", null);
        dispatch({
            type: 'SET_USER',
            user: null,
        });
    }

    return (
        <Container>
            <PageHeader title={''} />
            <Logo>EXCQL</Logo>
            <Slogan>Where Excel Meets Query, Simplifying Data Management for Non-Database Experts!</Slogan>
            {state.user === null ? (
                <ButtonContainer>
                    <Link to = "/login">
                        <Button> Login </Button>
                    </Link>
                    <Link to = "/signup/admin">
                        <Button> New Admin User </Button>
                    </Link>
                    <Link to = "/signup/regular">
                        <Button> New Regular User </Button>
                    </Link>
                </ButtonContainer>
                ) : (
                <ButtonContainer>
                    <Link to = "/updateknowledgebase">
                        <Button> Update Knowledge Base </Button>
                    </Link>
                    <Link to = "/downloadexcelfile">
                        <Button> Download Data </Button>
                    </Link>
                    {state.user.admin && <Link to = "/createmapping">
                        <Button> Create Mappings </Button>
                    </Link>}
                    {state.user.admin && <Link to = "/editmapping">
                        <Button> Edit Mappings </Button>
                    </Link>}
                </ButtonContainer>
            )}
        </Container>
    );
}
