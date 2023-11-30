import React from "react";
import { Route, Routes } from "react-router-dom";

import Landing from "./containers/LandingPage";
import Login from "./containers/Login";
import UpdateKnowledgeBase from "./containers/UpdateKnowledgeBase"

 const App = () => {
 return (
   <div className="app">
     <Routes>
       <Route exact path="/" element={<Landing />} />
       <Route path = "/login" element={<Login/>} />
       <Route path="/updateknowledgebase" element={<UpdateKnowledgeBase/>} />
       <Route path="*" element={<Landing />} />
     </Routes>
   </div>
 );
};
 export default App;
