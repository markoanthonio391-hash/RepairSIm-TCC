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
      return(
        <div className={styles.container}>
            {/* <div className={styles.bckground}>
                <img src={backgroundImage} alt="Background" className={styles.bckground} />
            </div> */}
            <input type="text" placeholder='   Nome' className={styles.input}/>
            <input type="text" placeholder='   Sobrenome' className={styles.input}/>
            <input type='text' placeholder='   Username' className={styles.input}/>
            <input type="date" placeholder='   Data de Nascimento' className={styles.input}/>
            <input type='number' placeholder='   Telefone' className={styles.input}/>
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