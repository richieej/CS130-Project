import React, { useContext } from "react";
import styled from 'styled-components'

import { Ctx } from '../components/StateProvider';
import SessionStorage from "../utils/SessionStorage";

const Button = styled.button `
    position: fixed;
    top: 15px;
    right: 30px;
    padding: 10px 1em;
    width: 8vw;
    border-radius: 20px;
    background-color: black;
    color: white;
    font-size: 20px;
    font-family: 'Concert One', sans-serif;
    border: 2px solid black;
    cursor: pointer;
    margin: auto;
`

const LogoutButton = () => {
    const { dispatch } = useContext(Ctx);

    const logout = () => {
        SessionStorage.storeItem("user", null);
        dispatch({
            type: 'SET_USER',
            user: null,
        });
    }

    return (
        <Button onClick={() => logout()}>Logout</Button>
    );
}

export default LogoutButton;
