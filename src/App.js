import './App.css';
import Home from './Home/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Authentication/Login/Login';
import MessageComponents from './Components/MessageComponents/MessageComponents';
import { useEffect, useState } from 'react';

function App() {

  return (
    <>
      <Router basename='/VMessenger'>
        <Routes>
          <Route path='/' exact element={<Login />} />
          <Route path='home' element={<Home />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
