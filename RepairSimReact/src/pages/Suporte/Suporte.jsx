import styles from '../Login/Login.module.css';
import local from './Suporte.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FundoAnimado from '../../components/FundoAnimado';
import TechSolveLogo from '../../components/TechSolveLogo';
import TituloRepairSim from '../../components/TituloRepairSim';
import { lerUsuario } from '../../services/auth';

const EMAIL_SUPORTE = 'Techsolve816@gmail.com';
const ASSUNTOS = ['Dúvida', 'Problema técnico', 'Sugestão', 'Outro'];

function Suporte() {
  const navigate = useNavigate();
  const usuario = lerUsuario(); // se estiver logado, já preenche nome e e-mail

  const [nome, setNome] = useState(usuario?.username ?? '');
  const [email, setEmail] = useState(usuario?.email ?? '');
  const [assunto, setAssunto] = useState(ASSUNTOS[0]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  // valida e monta assunto + corpo; devolve null se a mensagem for curta demais
  const montarMensagem = () => {
    if (mensagem.trim().length < 10) {
      setErro('Escreva uma mensagem com pelo menos 10 caracteres.');
      setAviso('');
      return null;
    }
    setErro('');
    return {
      titulo: `[RepairSim] ${assunto}`,
      corpo: `Nome: ${nome || '(não informado)'}\nE-mail: ${email || '(não informado)'}\n\n${mensagem.trim()}`,
    };
  };

  const enviarPeloApp = () => {
    const m = montarMensagem();
    if (!m) return;
    window.location.href =
      `mailto:${EMAIL_SUPORTE}?subject=${encodeURIComponent(m.titulo)}&body=${encodeURIComponent(m.corpo)}`;
    setAviso('Abrindo seu aplicativo de e-mail...');
  };

  const enviarPeloGmail = () => {
    const m = montarMensagem();
    if (!m) return;
    window.open(
      `https://mail.google.com/mail/?view=cm&to=${EMAIL_SUPORTE}&su=${encodeURIComponent(m.titulo)}&body=${encodeURIComponent(m.corpo)}`,
      '_blank',
      'noopener'
    );
    setAviso('Abrindo o Gmail em uma nova aba...');
  };

  // Enter dentro do formulário usa a opção do app de e-mail
  const handleSubmit = (e) => {
    e.preventDefault();
    enviarPeloApp();
  };

  return (
    <div className={styles.page} data-efeito="menu">
      <FundoAnimado />

      <div className={styles.topo}>
        <TechSolveLogo size={90} className={styles.logo} />
        <h1 className={styles.title} aria-label="RepairSim"><TituloRepairSim /></h1>
      </div>

      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.iconBadge} aria-hidden="true">
          <span className={styles.chave}>💬</span>
        </div>

        <h2 className={styles.cardTitle}>Fale com a TechSolve</h2>
        <p className={styles.cardSubtitle}>Conte sua dúvida ou problema para a nossa equipe</p>

        <label className={styles.fieldLabel} htmlFor="nome">Nome</label>
        <input
          id="nome"
          type="text"
          className={styles.input}
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <label className={styles.fieldLabel} htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          className={styles.input}
          placeholder="seuemail@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className={styles.fieldLabel} htmlFor="assunto">Assunto</label>
        <select
          id="assunto"
          className={styles.input}
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
        >
          {ASSUNTOS.map((a) => (
            <option key={a} value={a} style={{ color: '#000' }}>{a}</option>
          ))}
        </select>

        <label className={styles.fieldLabel} htmlFor="mensagem">Mensagem</label>
        <textarea
          id="mensagem"
          className={local.textarea}
          placeholder="Descreva o que aconteceu..."
          maxLength={1000}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
        />

        {erro && <p className={styles.error}>{erro}</p>}
        {aviso && <p className={styles.loading}>{aviso}</p>}

        <button type="submit" className={styles.loginButton}>
          Enviar pelo app de e-mail
        </button>

        <button type="button" className={local.gmailButton} onClick={enviarPeloGmail}>
          Enviar pelo Gmail
        </button>

        <button type="button" className={styles.cancelarButton} onClick={() => navigate(-1)}>
          Voltar
        </button>

        <p className={local.alternativa}>
          Ou escreva direto para <strong>{EMAIL_SUPORTE}</strong>
        </p>
      </form>
    </div>
  );
}

export default Suporte;