import {lazy, Suspense} from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeProvider'
import { LanguageProvider } from './context/LanguageProvider';
import { SoundProvider } from './context/SoundProvider';
import { JogoProvider } from './context/JogoContext';
import SomGlobal from './components/SomGlobal';

const Home = lazy(() => import ('./pages/home/home'));
const Dificuldade = lazy(() => import('./pages/dificuldade/dificuldade'));
const Config = lazy(() => import('./pages/home/Config/Config'));
const Historico = lazy(() => import('./pages/home/Historico/Historico'));
const TesteApi = lazy(() => import('./pages/testeAPI/api')); //teste de api
const Login = lazy(() => import('./pages/Login/Login'));
const Cadastro = lazy(() => import('./pages/Login/cadastro/cadastro'));
const Cliente = lazy(() => import('./pages/cliente/cliente'));
const Conquistas = lazy(() => import('./pages/Conquistas/Conquistas'));
const Caso = lazy(() => import('./pages/caso/caso'));
const Relatorio = lazy(() => import('./pages/relatorio/relatorio'));
const Resultado = lazy(() => import('./pages/resultado/resultado')); 
//#Problemas na importação da página de relatórios
//  (Causador de fundo branco nas telas de caso e de cliente)

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SoundProvider>
          <BrowserRouter>
            <SomGlobal />
              <Suspense fallback={<div style={{color: 'white'}}>Carregando...</div>}>
                <JogoProvider>
                  <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/Dificuldade' element={<Dificuldade />} />
                    <Route path='/config' element={<Config />} />
                    <Route path="/teste" element={<TesteApi />} />
                    <Route path="/Login" element={<Login />} />
                    <Route path='/Historico' element={<Historico />} />
                    <Route path='/cadastro' element={<Cadastro />} />      
                    <Route path="/cliente" element={<Cliente />} />
                    <Route path="/Conquistas" element={<Conquistas />} />
                    <Route path="/relatorio/:id" element={<Relatorio />} />
                    <Route path="/caso" element={<Caso />} />
                    <Route path='/resultado' element={<Resultado/>} />
                    <Route path='*'element={<h1>Not Found</h1>} />
                    
                  </Routes>
                </JogoProvider>
              </Suspense>
          </BrowserRouter>
        </SoundProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
export default App;