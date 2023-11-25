import React from "react";

import { Route, Routes } from "react-router-dom";

import Landing from "./containers/LandingPage";
import Login from "./containers/Login";

 const App = () => {
 return (
   <div className="app" style={{ backgroundColor: "#f0ada8", height: "100vh"}}>

     <Routes>
       <Route exact path="/" element={<Landing />} />
       <Route path = "/login" element={<Login/>} />
       <Route path="*" element={<Landing />} />
     </Routes>
   </div>
 );
};
 export default App;
