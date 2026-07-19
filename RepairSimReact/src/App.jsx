//import styles from './App.module.css';
import { useState } from 'react'
import TechSolveLogo from './assets/TechSolveLogo.png'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/home/home'
import Dificuldade from './pages/dificuldade/dificuldade'
import Config from './pages/home/Config/Config'
import TesteApi from './pages/testeAPI/api'; //teste de api
function App() {

 // const [count, setCount] = useState(0)

  return (
     <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/dificuldade' element={<Dificuldade />} />
        <Route path='/config' element={<Config />} />
        <Route path='*' element={<h1>Not Found</h1>} />
        <Route path="/teste" element={<TesteApi />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App; 
