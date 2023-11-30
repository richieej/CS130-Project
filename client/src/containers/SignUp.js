import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components'

import GoogleAuthButton from '../components/GoogleAuthButton';

import UserService from '../services/UserService';

import { Ctx } from '../components/StateProvider';
import SessionStorage from '../utils/SessionStorage';

const Container = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const Title = styled.h1`
    font-size: 100px;
    font-family: 'Bungee', sans-serif;
    color: black;
    text-align: center;
    margin: 0;
`

const SignUp = ({ isAdmin }) => {
    const [user, setUser] = useState(null);
    const { dispatch } = useContext(Ctx);
    const navigate = useNavigate();

    const createUser = async() => {
        try {
            const userData = {
                email: user.email,
                firstName: user.given_name,
                lastName: user.family_name,
                admin: isAdmin,
            }
            await UserService.createUser(userData);

            dispatch({
                type: 'SET_USER',
                user: userData,
            });
            SessionStorage.storeItem("user", userData);
            navigate("/");
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    useEffect(() => {
        if (user !== null) {
            console.log(user);
            createUser();
        }
    }, [user])

    return (
        <Container>
            <Title>{isAdmin && 'Admin '}Sign Up</Title>
            <GoogleAuthButton setUser={setUser}/>
        </Container>
    );
}

export default SignUp;
