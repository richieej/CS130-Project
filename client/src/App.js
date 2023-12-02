import React, { useContext, useEffect } from "react";
import styled from 'styled-components'

import { Route, Routes } from "react-router-dom";

import Landing from "./containers/LandingPage";
import Login from "./containers/Login";
import UpdateKnowledgeBase from "./containers/UpdateKnowledgeBase"
import DownloadExcelFile from "./containers/DownloadExcelFile";
import SignUp from "./containers/SignUp"

import { Ctx, StateProvider } from './components/StateProvider';
import SessionStorage from "./utils/SessionStorage";

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
          <Route path = "/login" element={<Login/>} />
          <Route path = "/signup/admin" element={<SignUp isAdmin={true}/>} />
          <Route path = "/signup/regular" element={<SignUp isAdmin={false}/>} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </Container>
    )
  }

  return (
    <Container>
      <Routes>
        <Route exact path="/" element={<Landing />} />
        <Route path="/updateknowledgebase" element={<UpdateKnowledgeBase/>} />
        <Route path="/downloadexcelfile" element={<DownloadExcelFile/>} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </Container>
  )
}


export default App;
