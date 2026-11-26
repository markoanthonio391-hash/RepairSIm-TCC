import styles from './Login.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salvarUsuario } from '../../services/auth';
import FundoAnimado from '../../components/FundoAnimado';
import TechSolveLogo from '../../components/TechSolveLogo';
import TituloRepairSim from '../../components/TituloRepairSim';
import { useTheme } from '../../context/useTheme';

function Login() {
  const navigate = useNavigate();
  const { efeitos } = useTheme();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState(() => {
    try {
      const aviso = sessionStorage.getItem('aviso_login');
      sessionStorage.removeItem('aviso_login');
      return aviso || '';
    } catch {
      return '';
    }
  });
  const [loading, setLoading] = useState(false);

  // mesmo efeito de "ligar o neon" da Home
  const [ligando, setLigando] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLigando(false), 4500);
    return () => clearTimeout(timer);
  }, []);
  const faseClasse = ligando && efeitos.neon === 'normal' ? styles.ligando : styles.ligado;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:3000/usuarios/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();
      if (response.ok) {
        salvarUsuario(data.usuario);
        alert(`Login realizado com sucesso!\n\nOlá ${data.usuario.username}!`);
        navigate('/');
      } else {
        setError(data.mensagem);
      }
    } catch (err) {
      console.error(err);
      setError('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
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
          <span className={styles.chave}>🔧</span>
        </div>  

        <h2 className={styles.cardTitle}>Bem-vindo de volta</h2>
        <p className={styles.cardSubtitle}>Entre com seus dados para acessar sua conta</p>

        <label className={styles.fieldLabel} htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          placeholder="seuemail@exemplo.com"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className={styles.fieldLabel} htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          placeholder="••••••••"
          className={styles.input}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {error && <p className={styles.error}>{error}</p>}
        {loading && <p className={styles.loading}>Carregando...</p>}

        <button type="submit" className={`${styles.loginButton} ${faseClasse}`} disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <button type="button" className={`${styles.cancelarButton} ${faseClasse}`} onClick={() => navigate(-1)}>
          Cancelar
        </button>

        <button type="button" className={styles.cadButton} onClick={() => navigate('/cadastro')}>
          Não tem uma conta? <span className={styles.cadLink}>Cadastre-se</span>
        </button>

        <button type="button" className={styles.esqueciButton} onClick={() => navigate('/esqueci-senha')}>
          Esqueci minha senha
        </button>
      </form>
    </div>
  );
}

export default Login;