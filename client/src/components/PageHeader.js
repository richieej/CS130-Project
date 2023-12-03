import React, { useContext } from 'react';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components'
import LogoutButton from './LogoutButton';

import Home from '../assets/home.png';

import { Ctx } from './StateProvider';

const Container = styled.h1`
    margin: 1.5em auto 0 35px;
    padding: 15px 0;
    font-family: 'Bungee', sans-serif;
    font-size: 60px;
    display: flex;
    justify-content: center;
`

const Logo = styled.img`
    position: fixed;
    top: 5px;
    left: 0px;
    padding: 10px 1em;
    width: 75px;
    height: 75px;
    border-radius: 20px;
    color: white;
    font-size: 20px;
    font-family: 'Concert One', sans-serif;
    cursor: pointer;
    margin: auto;
`


export default function PageHeader({ title }) {
    const { state } = useContext(Ctx);
    const navigate = useNavigate();

    return (
        <Container>
            <Logo src={Home} onClick={() => navigate("/")} />
            {title}
            {state.user !== null && <LogoutButton/>}
        </Container>
    );
}
