import styles from '../Login/Login.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FundoAnimado from '../../components/FundoAnimado';
import TechSolveLogo from '../../components/TechSolveLogo';
import TituloRepairSim from '../../components/TituloRepairSim';

function EsqueciSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [aviso, setAviso] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: chamar o back-end quando a troca de senha for implementada
    setAviso('Recurso em desenvolvimento.');
  };

  return (
    <div className={styles.page} data-efeito="menu">
      <FundoAnimado />

      <div className={styles.topo}>
        <TechSolveLogo size={90} className={styles.logo} />
        <h1 className={styles.title} aria-label="RepairSim"><TituloRepairSim /></h1>
      </div>

      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.iconBadge} style={{ cursor: 'default' }}>🔑</div>
        <h2 className={styles.cardTitle}>Trocar senha</h2>
        <p className={styles.cardSubtitle}>Informe seu e-mail para redefinir a senha</p>

        <label className={styles.fieldLabel} htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          placeholder="seuemail@exemplo.com"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {aviso && <p className={styles.loading}>{aviso}</p>}

        <button type="submit" className={styles.loginButton}>Enviar</button>
        <button type="button" className={styles.cancelarButton} onClick={() => navigate(-1)}>
          Voltar
        </button>
      </form>
    </div>
  );
}

export default EsqueciSenha;