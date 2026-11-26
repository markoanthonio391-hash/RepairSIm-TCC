import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './temas.css'
import './fontes.css' //carrega a fonte Unispace (@font-face)
import './efeitos.css'
import App from './App.jsx'
import { instalarAvisoSessaoSubstituida } from './services/auth'

instalarAvisoSessaoSubstituida() //aviso de "conta entrou em outro dispositivo" (sessão única dos alunos)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
