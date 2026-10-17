//App.jsx
import React from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import './styles/App.css'; 
import { useState } from 'react';


function App() {
  return (
    <div className="App">
      <Header /> 
      {/* Main content of the application */}
      <Footer />
    </div>
  );
}

export default App;