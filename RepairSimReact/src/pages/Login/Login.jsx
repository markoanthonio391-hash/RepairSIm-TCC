import styles from './Login.module.css';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {

    const navigate = useNavigate()
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
       try {
          e.preventDefault();
          setLoading(true);
          setError('');
          const response = await fetch('http://localhost:3000/usuarios/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, senha }),
          });
          const data = await response.json();
          if (response.ok) {
              localStorage.setItem('usuario', JSON.stringify(data.usuario));
              alert(`Login realizado com sucesso!\n\nOlá ${data.usuario.username}!`);
              navigate('/');
          }
         
        else {
            setError(data.mensagem);
        }
      } catch (error) {
        console.error(error);
        setError("Não foi possível conectar ao servidor.");

      } finally {
      setLoading(false);
      }
    };
      return(
            <div className={styles.container}>
              <input  type="email" placeholder="   E-mail" className={styles.input}  value={email} onChange={(e)=>setEmail(e.target.value)} />
              <input type="password" placeholder="   Senha" className={styles.input}  value={senha} onChange={(e)=>setSenha(e.target.value)} />
              {error && <p className={styles.error}>{error}</p>}
                    {loading && <p className={styles.loading}>Carregando...</p>}
                    <div className={styles.containerButtons}>
                      <button type="submit" className={`${styles.loginButton} ${styles.styleButton}`} onClick={handleSubmit} disabled={loading}  >
                        Entrar
                      </button>
                      <button className={`${styles.cancelarButton} ${styles.styleButton}`} onClick={() => navigate(-1)}>
                        Cancelar
                      </button>
                    </div>
                    <button className={styles.cadButton} onClick={() => navigate('/cadastro')}>Clique aqui para cadastro.</button>
                    
            </div>
      )
    };
    export default Login;
