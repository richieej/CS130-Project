import React, { useContext, useEffect } from "react";
import styled from 'styled-components'

import { Route, Routes } from "react-router-dom";

import Landing from "./containers/LandingPage";
import Login from "./containers/Login";
import UpdateKnowledgeBase from "./containers/UpdateKnowledgeBase"
import SignUp from "./containers/SignUp"
import SessionStorage from "./utils/SessionStorage";
import CreateMapping from "./containers/CreateMapping";

import { Ctx, StateProvider } from './components/StateProvider';

const Container = styled.div`
    height: 100vh;
    background-color: #f0ada8;
`

const App = () => {
  return (
    <StateProvider>
      <Home />
    </StateProvider>
  )
};

const Home = () => {
  const { state, dispatch } = useContext(Ctx);

  useEffect(() => {
    const initialUser = SessionStorage.retrieveItem("user");
    dispatch({
      type: 'SET_USER',
      user: initialUser,
  });
  }, [])

  if (state.user === undefined)
    return <Container />

  if (state.user === null) {
    return (
      <Container>
        <Routes>
          <Route exact path="/" element={<Landing />} />
          <Route exact path = "/login" element={<Login/>} />
          <Route exact path = "/signup/admin" element={<SignUp isAdmin={true}/>} />
          <Route exact path = "/signup/regular" element={<SignUp isAdmin={false}/>} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </Container>
    )
  }

  return (
    <Container>
      <Routes>
        <Route exact path="/" element={<Landing />} />
        <Route exact path="/updateknowledgebase" element={<UpdateKnowledgeBase/>} />
        <Route exact path="/createmapping" element={<CreateMapping />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </Container>
  )
}


export default App;
