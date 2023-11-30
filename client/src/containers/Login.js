import React, { useEffect, useState } from 'react';
import styled from 'styled-components'

import GoogleSignInButton from '../components/GoogleSignInButton';

const Container = styled.div`
    height: 100%;
    min-height: 100vh;
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

export default function Landing() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        console.log(user);
    }, [user])

    return (
        <Container>
            <Title>Login</Title>
            <GoogleSignInButton setUser={setUser}/>
        </Container>
    );
}
