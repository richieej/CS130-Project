import React from 'react';
import styled from 'styled-components'

const Container = styled.h1`
    margin: 0 auto 0 35px;
    padding: 15px 0;
    font-family: 'Bungee', sans-serif;
    font-size: 60px;
`


export default function PageHeader(props) {
    return (
        <Container>
            {props.title}
        </Container>
    );
}