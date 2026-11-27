import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeProvider'
import { LanguageProvider } from './context/LanguageProvider';
import { SoundProvider } from './context/SoundProvider';
import { JogoProvider } from './context/JogoContext';
import ToastConquista from './pages/Conquistas/ToastConquista';


const Suporte = lazy(() => import('./pages/Suporte/Suporte'));
const Faq = lazy(() => import('./pages/Faq/Faq'));
const EsqueciSenha = lazy(() => import('./pages/EsqueciSenha/EsqueciSenha'));
const SomGlobal = lazy(() => import('./components/SomGlobal'));
const MusicaGlobal = lazy(() => import('./components/MusicaGlobal'));
const Home = lazy(() => import('./pages/home/home'));
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
const CadastrarDesafio = lazy(() => import('./pages/admin/CadastrarDesafio'));
const ResultadosProfessor = lazy(() => import('./pages/admin/ResultadosProfessor'));
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
                  {/* música de fundo: lobby nas telas iniciais, música dos casos durante os casos e comemoração no resultado */}
                  <MusicaGlobal />
                  <ToastConquista />
                  <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/Dificuldade' element={<Dificuldade />} />
                    <Route path='/config' element={<Config />} />
                    {/* página de teste da API: só existe no modo de desenvolvimento (npm run dev) */}
                    {import.meta.env.DEV && <Route path="/teste" element={<TesteApi />} />}
                    <Route path="/Login" element={<Login />} />
                    <Route path='/Historico' element={<Historico />} />
                    <Route path='/cadastro' element={<Cadastro />} />      
                    <Route path="/cliente" element={<Cliente />} />
                    <Route path="/Conquistas" element={<Conquistas />} />
                    <Route path="/relatorio/:id" element={<Relatorio />} />
                    <Route path="/caso" element={<Caso />} />
                    <Route path='/resultado' element={<Resultado/>} />
                    <Route path="/faq" element={<Faq />} />
                    <Route path="/esqueci-senha" element={<EsqueciSenha />} />
                    <Route path='/cadastrar-desafio' element={<CadastrarDesafio />} />
                    <Route path='/resultados-professor' element={<ResultadosProfessor />} />
                    <Route path="/suporte" element={<Suporte />} />
                    <Route path='*' element={
                      <div style={{ color: 'white', textAlign: 'center', padding: '48px 16px' }}>
                        <h1>Página não encontrada</h1>
                        <Link to="/" style={{ color: 'aquamarine' }}>Voltar para o início</Link>
                      </div>
                    } />
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