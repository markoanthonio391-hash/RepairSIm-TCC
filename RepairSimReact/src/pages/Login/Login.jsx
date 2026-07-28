import styles from './Login.module.css';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {

    const navigate = useNavigate()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
       try {
          e.preventDefault();
          setLoading(true);
          setError('');
          const response = await fetch('http://localhost:3000/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
          });
          const data = await response.json();
          if (response.ok) {
              localStorage.setItem('token', data.token);
            navigate('/dashboard');
        } else {
            setError(data.message);
        }
      } catch (error) {
        setError(<p type="text" className={styles.error}>E-mail ou senha incorretos. Tente novamente.</p>);
      } finally {
      setLoading(false);
      }
    };
      return(
            <div className={styles.container}>
              <input  type="email" placeholder="   E-mail" className={styles.input} />
              <input type="password" placeholder="   Senha" className={styles.input} />
              {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.loginButton} onClick={handleSubmit} disabled={loading}  >
                      Entrar
                    </button>
                    <button className={styles.cancelarButton} onClick={() => navigate(-1)}>
                      Cancelar
                    </button>
            </div>
      )
    };
    export default Login;
