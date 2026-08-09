import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Cadastro.module.css'
// import backgroundImage from '../../../assets/imgFundoBranco.jpeg'
function Cadastro() {
    const navigate = useNavigate()
    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState(''); // CRIAR
    const [username, setUsername] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [telefone, setTelefone] = useState(''); //CRIAR
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [termosAceitos, setTermosAceitos] = useState(false);
    const handleSubmit = async (e) => {
       try {
          e.preventDefault();
          setLoading(true);
          setError('');
          const response = await fetch('http://localhost:3000/cadastro', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nome, sobrenome, username, dataNascimento, telefone, email, senha, confirmarSenha, termosAceitos }),
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
            {/* <div className={styles.bckground}>
                <img src={backgroundImage} alt="Background" className={styles.bckground} />
            </div> */}
            <input type="text" placeholder='   Nome' className={styles.input}/>
            <input type="text" placeholder='   Sobrenome' className={styles.input}/>
            <input type='text' placeholder='   Username' className={styles.input}/>
            <input type="date" placeholder='   Data de Nascimento' className={styles.input}/>
            <input type='tel' placeholder='   (00) 00000-0000' className={styles.input}/>
            <input  type="email" placeholder="   E-mail" className={styles.input} />
            <input type="password" placeholder="   Senha" className={styles.input} />
            <input type='password'  placeholder='   Confirme a senha'  className={styles.input} />
            <div className={styles.containerTerms}>
                <input type='checkbox' className={styles.inputTerms} />
                <h10 className={styles.terms}> Li e aceito os termos de uso</h10>
            </div>
            <button className={`${styles.confirmarButton} ${styles.styleButton}`}>Confirmar</button>
            <button className={`${styles.cancelarButton} ${styles.styleButton}`} onClick={() => navigate(-1)}>Cancelar</button>
        </div>
      )
    };
    export default Cadastro;