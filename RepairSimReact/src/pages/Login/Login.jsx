import styles from './Login.module.css';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {

    const navigate = useNavigate()
      return(
            <div className={styles.container}>
              <input  type="text" placeholder="   Usuário" className={styles.input} />
              <input type="password" placeholder="   Senha" className={styles.input} />
                    <button type="submit" className={styles.loginButton}>
                      Entrar
                    </button>
                    <button className={styles.cancelarButton} onClick={() => navigate(-1)}>
                      Cancelar
                    </button>
            </div>
      )
    };
    export default Login;
